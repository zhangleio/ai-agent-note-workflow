import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { DEFAULT_EXTENSIONS } from '../src/cli-options.js'
import { countDirectory } from '../src/directory-stats.js'

async function fixture(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'text-stats-directory-'))
  try {
    await mkdir(join(directory, 'nested', '.hidden'), { recursive: true })
    await writeFile(join(directory, 'z.js'), 'one\ntwo\n', 'utf8')
    await writeFile(join(directory, 'A.TS'), 'one\n\ntwo', 'utf8')
    await writeFile(join(directory, 'ignored.txt'), 'one\ntwo\nthree', 'utf8')
    await writeFile(join(directory, 'nested', 'b.md'), '', 'utf8')
    await writeFile(join(directory, 'nested', '.hidden', 'c.css'), 'one', 'utf8')
    await run(directory)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('recursively counts default extensions with sorted relative paths', async () => fixture(async directory => {
  assert.deepEqual(await countDirectory(directory, { extensions: DEFAULT_EXTENSIONS, recursive: true }), {
    files: [
      { path: 'A.TS', lines: 3 },
      { path: 'nested/.hidden/c.css', lines: 1 },
      { path: 'nested/b.md', lines: 0 },
      { path: 'z.js', lines: 2 },
    ],
    lines: 6,
  })
}))

test('limits scanning to direct files when recursion is disabled', async () => fixture(async directory => {
  assert.deepEqual(await countDirectory(directory, { extensions: ['.js', '.md'], recursive: false }), {
    files: [{ path: 'z.js', lines: 2 }],
    lines: 2,
  })
}))

test('supports multiple explicit extensions and a zero-match result', async () => fixture(async directory => {
  assert.equal((await countDirectory(directory, { extensions: ['.txt', '.css'], recursive: true })).lines, 4)
  assert.deepEqual(await countDirectory(directory, { extensions: ['.py'], recursive: true }), {
    files: [],
    lines: 0,
  })
}))

test('does not follow symbolic links', async () => fixture(async directory => {
  const target = join(directory, 'nested', 'linked.ts')
  await writeFile(target, 'one', 'utf8')
  try {
    await symlink(target, join(directory, 'link.ts'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EPERM') return
    throw error
  }
  const result = await countDirectory(directory, { extensions: ['.ts'], recursive: true })
  assert.deepEqual(result.files, [
    { path: 'A.TS', lines: 3 },
    { path: 'nested/linked.ts', lines: 1 },
  ])
}))

test('rejects missing paths and regular files', async () => fixture(async directory => {
  await assert.rejects(
    countDirectory(join(directory, 'missing'), { extensions: ['.ts'], recursive: true }),
    /Path does not exist/,
  )
  await assert.rejects(
    countDirectory(join(directory, 'z.js'), { extensions: ['.js'], recursive: true }),
    /not a directory/,
  )
}))