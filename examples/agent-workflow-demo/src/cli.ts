import { parseArgs } from 'node:util'

import { readDocument, writeDocument } from './store.js'

export interface CliOptions {
  dataPath?: string
  now?: () => Date
  write?: (text: string) => void
}

/** Execute one CLI command against the configured todo document. */
export async function runCli(args: readonly string[], options: CliOptions = {}): Promise<void> {
  const dataPath = options.dataPath ?? '.todos.json'
  const now = options.now ?? (() => new Date())
  const output = options.write ?? (text => process.stdout.write(text))
  const [rawCommand, ...rawOperands] = args
  if (rawCommand === 'add') {
    const text = rawOperands.join(' ').trim()
    if (text.length === 0) throw new Error('Usage: todo-demo add <text>')
    const document = await readDocument(dataPath)
    const id = document.nextId
    document.nextId += 1
    document.active.push({ id, text, createdAt: now().toISOString(), completed: false })
    await writeDocument(dataPath, document)
    output(`Added todo ${id}.\n`)
    return
  }
  const parsed = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      completed: { type: 'boolean' },
      yes: { type: 'boolean' },
    },
  })
  const [command, ...operands] = parsed.positionals
  const hasBulkOption = parsed.values.completed !== undefined || parsed.values.yes !== undefined
  if (command !== 'archive' && hasBulkOption) {
    throw new Error('The --completed and --yes options belong only to archive bulk mode.')
  }

  if (command === 'list') {
    if (operands.length !== 0) throw new Error('Usage: todo-demo list')
    const document = await readDocument(dataPath)
    if (document.active.length === 0) {
      output('No todos.\n')
      return
    }
    for (const todo of [...document.active].sort((left, right) => left.id - right.id)) {
      output(`${todo.completed ? '[x]' : '[ ]'} ${todo.id} ${todo.text}\n`)
    }
    return
  }

  if (command === 'done') {
    if (operands.length !== 1 || !/^[1-9]\d*$/.test(operands[0] ?? '')) {
      throw new Error('Usage: todo-demo done <id>')
    }
    const id = Number(operands[0])
    const document = await readDocument(dataPath)
    const todo = document.active.find(candidate => candidate.id === id)
    if (todo === undefined) throw new Error(`Todo ${id} does not exist.`)
    todo.completed = true
    await writeDocument(dataPath, document)
    output(`Completed todo ${id}.\n`)
    return
  }

  if (command === 'archive' && operands[0] === 'list') {
    if (hasBulkOption) throw new Error('Usage: todo-demo archive list')
    if (operands.length !== 1) throw new Error('Usage: todo-demo archive list')
    const document = await readDocument(dataPath)
    if (document.archived.length === 0) {
      output('No archived todos.\n')
      return
    }
    for (const todo of [...document.archived].sort((left, right) => left.id - right.id)) {
      output(`${todo.completed ? '[x]' : '[ ]'} ${todo.id} ${todo.text}\n`)
    }
    return
  }

  if (command === 'archive' && hasBulkOption) {
    if (operands.length !== 0 || parsed.values.completed !== true || parsed.values.yes !== true) {
      throw new Error('Usage: todo-demo archive --completed --yes')
    }
    const document = await readDocument(dataPath)
    const completed = document.active.filter(todo => todo.completed)
    if (completed.length === 0) {
      output('Archived 0 completed todo(s).\n')
      return
    }
    document.active = document.active.filter(todo => !todo.completed)
    document.archived.push(...completed)
    await writeDocument(dataPath, document)
    output(`Archived ${completed.length} completed todo(s).\n`)
    return
  }

  if (command === 'archive') {
    const id = parseId(operands, 'archive')
    const document = await readDocument(dataPath)
    const index = document.active.findIndex(candidate => candidate.id === id)
    if (index === -1) throw new Error(`Active todo ${id} does not exist.`)
    const [todo] = document.active.splice(index, 1)
    document.archived.push(todo!)
    await writeDocument(dataPath, document)
    output(`Archived todo ${id}.\n`)
    return
  }

  if (command === 'restore') {
    const id = parseId(operands, 'restore')
    const document = await readDocument(dataPath)
    const index = document.archived.findIndex(candidate => candidate.id === id)
    if (index === -1) throw new Error(`Archived todo ${id} does not exist.`)
    const [todo] = document.archived.splice(index, 1)
    document.active.push(todo!)
    await writeDocument(dataPath, document)
    output(`Restored todo ${id}.\n`)
    return
  }

  if (command === 'remove') throw new Error('The remove command was replaced by archive. Use: todo-demo archive <id>')

  throw new Error('Usage: todo-demo <add|list|done|archive|restore>')
}

function parseId(operands: readonly string[], command: 'archive' | 'restore'): number {
  if (operands.length !== 1 || !/^[1-9]\d*$/.test(operands[0] ?? '')) {
    throw new Error(`Usage: todo-demo ${command} <id>`)
  }
  return Number(operands[0])
}