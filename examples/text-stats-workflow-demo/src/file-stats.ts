import { readFile, stat } from 'node:fs/promises'

import { countText, type TextStatistics } from './stats.js'

/** Read one regular UTF-8 file and return its text statistics. */
export async function countFile(path: string): Promise<TextStatistics> {
  let details
  try {
    details = await stat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File does not exist: ${path}`)
    }
    throw error
  }
  if (!details.isFile()) throw new Error(`Path is not a regular file: ${path}`)
  return countText(await readFile(path, 'utf8'))
}