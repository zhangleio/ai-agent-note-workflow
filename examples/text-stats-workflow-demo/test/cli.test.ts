import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'

import { runCli } from '../src/cli.js'

const execFileAsync = promisify(execFile)

async function fixture(run: (path: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'text-stats-cli-'))
  const path = join(directory, 'input.txt')
  try {
    await writeFile(path, 'one two\n😀\n', 'utf8')
    await run(path)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('prints fixed human-readable output', async () => fixture(async path => {
  const output: string[] = []
  await runCli([path], { write: text => output.push(text) })
  assert.deepEqual(output, ['Lines: 2\n', 'Words: 3\n', 'Characters: 10\n'])
}))

test('rejects missing and extra arguments before producing output', async () => {
  const output: string[] = []
  await assert.rejects(runCli([], { write: text => output.push(text) }), /Usage/)
  await assert.rejects(runCli(['one', 'two'], { write: text => output.push(text) }), /Usage/)
  assert.deepEqual(output, [])
})

test('prints sorted directory details and totals with explicit extensions', async () => fixture(async path => {
  const directory = join(path, '..')
  await mkdir(join(directory, 'nested'))
  await writeFile(join(directory, 'z.ts'), 'one\ntwo\n', 'utf8')
  await writeFile(join(directory, 'nested', 'a.js'), 'one', 'utf8')
  await writeFile(join(directory, 'nested', 'ignored.md'), 'one', 'utf8')
  const output: string[] = []
  await runCli([directory, '--ext', '.ts', '--ext', '.js'], { write: text => output.push(text) })
  assert.equal(output.join(''), 'nested/a.js: 1\nz.ts: 2\nFiles: 2\nLines: 3\n')
}))

test('supports non-recursive scans and zero matches', async () => fixture(async path => {
  const directory = join(path, '..')
  await mkdir(join(directory, 'nested'))
  await writeFile(join(directory, 'nested', 'a.ts'), 'one', 'utf8')
  const output: string[] = []
  await runCli([directory, '--ext', '.ts', '--no-recursive'], { write: text => output.push(text) })
  assert.equal(output.join(''), 'Files: 0\nLines: 0\n')
}))

test('rejects directory options for files without producing output', async () => fixture(async path => {
  const output: string[] = []
  await assert.rejects(runCli([path, '--ext', '.txt'], { write: text => output.push(text) }), /Directory options/)
  assert.deepEqual(output, [])
}))

test('runs the built CLI as a real subprocess', async () => fixture(async path => {
  const entry = resolve('dist/src/index.js')
  const success = await execFileAsync(process.execPath, [entry, path])
  assert.equal(success.stdout, 'Lines: 2\nWords: 3\nCharacters: 10\n')
  assert.equal(success.stderr, '')

  await assert.rejects(
    execFileAsync(process.execPath, [entry, `${path}.missing`]),
    (error: unknown) => {
      const failure = error as { code?: number, stdout?: string, stderr?: string }
      assert.equal(failure.code, 1)
      assert.equal(failure.stdout, '')
      assert.match(failure.stderr ?? '', /File does not exist/)
      return true
    },
  )
}))

test('runs a directory scan as a real subprocess', async () => fixture(async path => {
  const directory = join(path, '..')
  await mkdir(join(directory, 'src'))
  await writeFile(join(directory, 'src', 'index.ts'), 'one\ntwo', 'utf8')
  const entry = resolve('dist/src/index.js')
  const result = await execFileAsync(process.execPath, [entry, directory, '--ext', '.ts'])
  assert.equal(result.stdout, 'src/index.ts: 2\nFiles: 1\nLines: 2\n')
  assert.equal(result.stderr, '')
}))