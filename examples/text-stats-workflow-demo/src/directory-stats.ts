import { readdir, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

import { countFile } from './file-stats.js'

export interface FileLineCount {
  path: string
  lines: number
}

export interface DirectoryStatistics {
  files: readonly FileLineCount[]
  lines: number
}

export interface DirectoryScanOptions {
  extensions: readonly string[]
  recursive: boolean
}

/** Count matching regular files below one directory without following symbolic links. */
export async function countDirectory(
  path: string,
  options: DirectoryScanOptions,
): Promise<DirectoryStatistics> {
  let details
  try {
    details = await stat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Path does not exist: ${path}`)
    }
    throw error
  }
  if (!details.isDirectory()) throw new Error(`Path is not a directory: ${path}`)

  const extensions = new Set(options.extensions.map(extension => extension.toLowerCase()))
  const files: FileLineCount[] = []

  async function visit(directory: string, relativeDirectory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = join(directory, entry.name)
      const relativePath = relativeDirectory === ''
        ? entry.name
        : `${relativeDirectory}/${entry.name}`
      if (entry.isDirectory()) {
        if (options.recursive) await visit(entryPath, relativePath)
      } else if (entry.isFile() && extensions.has(extname(entry.name).toLowerCase())) {
        files.push({ path: relativePath, lines: (await countFile(entryPath)).lines })
      }
    }
  }

  await visit(path, '')
  files.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)
  return {
    files,
    lines: files.reduce((total, file) => total + file.lines, 0),
  }
}