import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_EXTENSIONS, parseCliArguments } from '../src/cli-options.js'

test('uses default extensions and recursive scanning', () => {
  assert.deepEqual(parseCliArguments(['project']), {
    path: 'project',
    extensions: DEFAULT_EXTENSIONS,
    recursive: true,
    hasDirectoryOptions: false,
  })
})

test('parses repeated extensions as a case-insensitive replacement set', () => {
  assert.deepEqual(parseCliArguments(['project', '--ext', '.TS', '--ext', '.js', '--ext', '.ts']), {
    path: 'project',
    extensions: ['.ts', '.js'],
    recursive: true,
    hasDirectoryOptions: true,
  })
})

test('supports non-recursive scanning with options before the path', () => {
  assert.deepEqual(parseCliArguments(['--no-recursive', '--ext', '.md', 'project']), {
    path: 'project',
    extensions: ['.md'],
    recursive: false,
    hasDirectoryOptions: true,
  })
})

test('rejects missing paths, extra paths, unknown options, and malformed extensions', () => {
  for (const args of [
    [],
    ['one', 'two'],
    ['project', '--recursive'],
    ['project', '--ext'],
    ['project', '--ext', 'ts'],
    ['project', '--ext', '.d.ts'],
  ]) {
    assert.throws(() => parseCliArguments(args))
  }
})