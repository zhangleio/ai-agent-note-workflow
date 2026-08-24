import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { runCli } from '../src/cli.js'

async function fixture(run: (path: string, output: string[]) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'agent-workflow-demo-'))
  try {
    await run(join(directory, 'todos.json'), [])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test('adds, lists, and completes a persisted todo', async () => fixture(async (path, output) => {
  const options = { dataPath: path, now: () => new Date('2026-08-24T12:00:00.000Z'), write: (text: string) => output.push(text) }
  await runCli(['add', 'review', 'proposal'], options)
  await runCli(['list'], options)
  await runCli(['done', '1'], options)
  await runCli(['list'], options)

  assert.deepEqual(output, [
    'Added todo 1.\n',
    '[ ] 1 review proposal\n',
    'Completed todo 1.\n',
    '[x] 1 review proposal\n',
  ])
  assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), {
    version: 1,
    nextId: 2,
    active: [{ id: 1, text: 'review proposal', createdAt: '2026-08-24T12:00:00.000Z', completed: true }],
    archived: [],
  })
}))

test('preserves hyphen-prefixed text after add', async () => fixture(async (path, output) => {
  const options = { dataPath: path, write: (text: string) => output.push(text) }
  await runCli(['add', '--urgent', 'task'], options)
  await runCli(['add', '--completed', 'review'], options)
  await runCli(['list'], options)

  assert.deepEqual(output.slice(-2), ['[ ] 1 --urgent task\n', '[ ] 2 --completed review\n'])
  const document = JSON.parse(await readFile(path, 'utf8'))
  assert.deepEqual(document.active.map((todo: { text: string }) => todo.text), [
    '--urgent task',
    '--completed review',
  ])
}))

test('lists a missing data file as empty', async () => fixture(async (path, output) => {
  await runCli(['list'], { dataPath: path, write: text => output.push(text) })
  assert.deepEqual(output, ['No todos.\n'])
}))

test('rejects an unknown id without changing the document', async () => fixture(async (path) => {
  await runCli(['add', 'keep me'], { dataPath: path, write: () => {} })
  const before = await readFile(path, 'utf8')
  await assert.rejects(runCli(['done', '2'], { dataPath: path }), /does not exist/)
  assert.equal(await readFile(path, 'utf8'), before)
}))

test('archives and restores todos without exposing archived items in the active list', async () => fixture(async (path, output) => {
  const options = { dataPath: path, write: (text: string) => output.push(text) }
  await runCli(['add', 'open'], options)
  await runCli(['add', 'completed'], options)
  await runCli(['done', '2'], options)
  await runCli(['archive', '2'], options)
  await runCli(['list'], options)
  await runCli(['archive', 'list'], options)
  await runCli(['restore', '2'], options)
  await runCli(['list'], options)

  assert.deepEqual(output.slice(-5), [
    '[ ] 1 open\n',
    '[x] 2 completed\n',
    'Restored todo 2.\n',
    '[ ] 1 open\n',
    '[x] 2 completed\n',
  ])
}))

test('rejects invalid archive transitions without changing the document', async () => fixture(async (path) => {
  await runCli(['add', 'keep me'], { dataPath: path, write: () => {} })
  const before = await readFile(path, 'utf8')
  await assert.rejects(runCli(['archive', '2'], { dataPath: path }), /does not exist/)
  await assert.rejects(runCli(['restore', '1'], { dataPath: path }), /does not exist/)
  assert.equal(await readFile(path, 'utf8'), before)
}))

test('never reuses an archived identifier', async () => fixture(async (path, output) => {
  const options = { dataPath: path, write: (text: string) => output.push(text) }
  await runCli(['add', 'first'], options)
  await runCli(['archive', '1'], options)
  await runCli(['add', 'second'], options)

  assert.equal(output.at(-1), 'Added todo 2.\n')
}))

test('migrates a legacy array only on a successful write', async () => fixture(async (path, output) => {
  const legacy = '[{"id":4,"text":"legacy","createdAt":"2026-08-24T00:00:00.000Z","completed":false}]\n'
  await writeFile(path, legacy, 'utf8')
  await runCli(['list'], { dataPath: path, write: text => output.push(text) })
  assert.equal(await readFile(path, 'utf8'), legacy)
  await runCli(['done', '4'], { dataPath: path, write: text => output.push(text) })
  const migrated = JSON.parse(await readFile(path, 'utf8'))
  assert.equal(migrated.version, 1)
  assert.equal(migrated.nextId, 5)
}))

test('withdraws remove without changing the document', async () => fixture(async (path) => {
  await runCli(['add', 'keep me'], { dataPath: path, write: () => {} })
  const before = await readFile(path, 'utf8')
  await assert.rejects(runCli(['remove', '1'], { dataPath: path }), /replaced by archive/)
  assert.equal(await readFile(path, 'utf8'), before)
}))

test('bulk archives only completed todos with either option order', async () => fixture(async (path, output) => {
  const options = { dataPath: path, write: (text: string) => output.push(text) }
  await runCli(['add', 'open'], options)
  await runCli(['add', 'done one'], options)
  await runCli(['done', '2'], options)
  await runCli(['add', 'done two'], options)
  await runCli(['done', '3'], options)
  await runCli(['archive', '--yes', '--completed'], options)

  assert.equal(output.at(-1), 'Archived 2 completed todo(s).\n')
  const document = JSON.parse(await readFile(path, 'utf8'))
  assert.deepEqual(document.active.map((todo: { id: number }) => todo.id), [1])
  assert.deepEqual(document.archived.map((todo: { id: number }) => todo.id), [2, 3])
  assert.equal(document.nextId, 4)

  await runCli(['restore', '2'], options)
  await runCli(['archive', '--completed', '--yes'], options)
  assert.equal(output.at(-1), 'Archived 1 completed todo(s).\n')
}))

test('bulk archive reports zero without rewriting the document', async () => fixture(async (path, output) => {
  await runCli(['add', 'open'], { dataPath: path, write: () => {} })
  const before = await readFile(path, 'utf8')
  await runCli(['archive', '--completed', '--yes'], { dataPath: path, write: text => output.push(text) })
  assert.deepEqual(output, ['Archived 0 completed todo(s).\n'])
  assert.equal(await readFile(path, 'utf8'), before)
}))

test('rejects incomplete or ambiguous bulk archive without writing', async () => fixture(async (path) => {
  await runCli(['add', 'keep'], { dataPath: path, write: () => {} })
  const before = await readFile(path, 'utf8')
  await assert.rejects(runCli(['archive', '--completed'], { dataPath: path }), /--completed --yes/)
  await assert.rejects(runCli(['archive', '--yes'], { dataPath: path }), /--completed --yes/)
  await assert.rejects(runCli(['archive', '1', '--completed', '--yes'], { dataPath: path }), /--completed --yes/)
  await assert.rejects(runCli(['list', '--completed', '--yes'], { dataPath: path }), /belong only/)
  assert.equal(await readFile(path, 'utf8'), before)
}))

test('rejects malformed stored JSON without replacing it', async () => fixture(async (path) => {
  await writeFile(path, '{broken', 'utf8')
  await assert.rejects(runCli(['add', 'new'], { dataPath: path }), /malformed/)
  assert.equal(await readFile(path, 'utf8'), '{broken')
}))

test('rejects invalid command arguments', async () => fixture(async (path) => {
  await assert.rejects(runCli(['add'], { dataPath: path }), /Usage/)
  await assert.rejects(runCli(['done', 'zero'], { dataPath: path }), /Usage/)
  await assert.rejects(runCli(['archive', 'zero'], { dataPath: path }), /Usage/)
  await assert.rejects(runCli(['restore', 'zero'], { dataPath: path }), /Usage/)
  await assert.rejects(runCli(['clear'], { dataPath: path }), /add\|list\|done\|archive\|restore/)
}))