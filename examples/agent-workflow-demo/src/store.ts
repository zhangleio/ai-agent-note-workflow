import { readFile, rename, rm, writeFile } from 'node:fs/promises'

export interface Todo {
  id: number
  text: string
  createdAt: string
  completed: boolean
}

export interface TodoDocument {
  version: 1
  nextId: number
  active: Todo[]
  archived: Todo[]
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const todo = value as Partial<Todo>
  return Number.isSafeInteger(todo.id) && typeof todo.text === 'string'
    && typeof todo.createdAt === 'string' && typeof todo.completed === 'boolean'
}

function documentFrom(value: unknown, path: string): TodoDocument {
  if (Array.isArray(value)) {
    if (!value.every(isTodo)) throw new Error(`Todo data has an invalid structure: ${path}`)
    assertUniqueIds(value, path)
    return { version: 1, nextId: largestId(value) + 1, active: value, archived: [] }
  }
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Todo data has an invalid structure: ${path}`)
  }
  const document = value as Partial<TodoDocument>
  if (document.version !== 1 || !Number.isSafeInteger(document.nextId) || (document.nextId ?? 0) < 1
    || !Array.isArray(document.active) || !document.active.every(isTodo)
    || !Array.isArray(document.archived) || !document.archived.every(isTodo)) {
    throw new Error(`Todo data has an invalid structure or unsupported version: ${path}`)
  }
  const todos = [...document.active, ...document.archived]
  assertUniqueIds(todos, path)
  if ((document.nextId as number) <= largestId(todos)) {
    throw new Error(`Todo data has an invalid nextId: ${path}`)
  }
  return document as TodoDocument
}

function largestId(todos: readonly Todo[]): number {
  return todos.reduce((largest, todo) => Math.max(largest, todo.id), 0)
}

function assertUniqueIds(todos: readonly Todo[], path: string): void {
  const ids = new Set<number>()
  for (const todo of todos) {
    if (todo.id < 1 || ids.has(todo.id)) throw new Error(`Todo data has duplicate or invalid identifiers: ${path}`)
    ids.add(todo.id)
  }
}

/** Read and validate a current document or project one legacy array in memory. */
export async function readDocument(path: string): Promise<TodoDocument> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { version: 1, nextId: 1, active: [], archived: [] }
    }
    throw error
  }

  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error(`Todo data is malformed: ${path}`)
  }
  return documentFrom(value, path)
}

/** Replace the todo document through a same-directory temporary file. */
export async function writeDocument(path: string, document: TodoDocument): Promise<void> {
  const temporaryPath = `${path}.${process.pid}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    await rename(temporaryPath, path)
  } finally {
    await rm(temporaryPath, { force: true })
  }
}