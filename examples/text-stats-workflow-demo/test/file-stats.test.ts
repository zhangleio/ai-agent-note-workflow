import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { countFile } from '../src/file-stats.js'

async function fixture(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'text-stats-'))
  try {
    await run(directory)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('counts a UTF-8 file', async () => fixture(async directory => {
  const path = join(directory, 'input.txt')
  await writeFile(path, 'alpha 世界\n', 'utf8')
  assert.deepEqual(await countFile(path), { lines: 1, words: 2, characters: 9 })
}))

test('rejects a missing path without creating files', async () => fixture(async directory => {
  const before = await readdir(directory)
  await assert.rejects(countFile(join(directory, 'missing.txt')), /File does not exist/)
  assert.deepEqual(await readdir(directory), before)
}))

test('rejects a directory without creating files', async () => fixture(async directory => {
  const before = await readdir(directory)
  await assert.rejects(countFile(directory), /not a regular file/)
  assert.deepEqual(await readdir(directory), before)
}))