import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { readDocument, writeDocument } from '../src/store.js'

async function fixture(run: (path: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'agent-workflow-store-'))
  try {
    await run(join(directory, 'todos.json'))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('projects a legacy array without rewriting it', async () => fixture(async path => {
  const legacy = '[{"id":3,"text":"legacy","createdAt":"2026-08-24T00:00:00.000Z","completed":false}]\n'
  await writeFile(path, legacy, 'utf8')
  assert.deepEqual(await readDocument(path), {
    version: 1,
    nextId: 4,
    active: [{ id: 3, text: 'legacy', createdAt: '2026-08-24T00:00:00.000Z', completed: false }],
    archived: [],
  })
  assert.equal(await readFile(path, 'utf8'), legacy)
}))

test('writes a version 1 document', async () => fixture(async path => {
  const document = { version: 1 as const, nextId: 2, active: [
    { id: 1, text: 'active', createdAt: '2026-08-24T00:00:00.000Z', completed: false },
  ], archived: [] }
  await writeDocument(path, document)
  assert.deepEqual(await readDocument(path), document)
}))

test('rejects duplicate ids across active and archived', async () => fixture(async path => {
  const todo = { id: 1, text: 'duplicate', createdAt: '2026-08-24T00:00:00.000Z', completed: false }
  const source = JSON.stringify({ version: 1, nextId: 2, active: [todo], archived: [todo] })
  await writeFile(path, source, 'utf8')
  await assert.rejects(readDocument(path), /duplicate/)
  assert.equal(await readFile(path, 'utf8'), source)
}))

test('rejects unsupported versions and invalid nextId', async () => fixture(async path => {
  await writeFile(path, JSON.stringify({ version: 2, nextId: 1, active: [], archived: [] }), 'utf8')
  await assert.rejects(readDocument(path), /unsupported version/)
  await writeFile(path, JSON.stringify({ version: 1, nextId: 1, active: [
    { id: 1, text: 'x', createdAt: '2026-08-24T00:00:00.000Z', completed: false },
  ], archived: [] }), 'utf8')
  await assert.rejects(readDocument(path), /nextId/)
}))