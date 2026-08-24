import { stat } from 'node:fs/promises'

import { parseCliArguments } from './cli-options.js'
import { countDirectory } from './directory-stats.js'
import { countFile } from './file-stats.js'

export interface CliOptions {
  write?: (text: string) => void
}

/** Execute text statistics for one file or directory path. */
export async function runCli(args: readonly string[], options: CliOptions = {}): Promise<void> {
  const parsed = parseCliArguments(args)
  let details
  try {
    details = await stat(parsed.path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const subject = parsed.hasDirectoryOptions ? 'Path' : 'File'
      throw new Error(`${subject} does not exist: ${parsed.path}`)
    }
    throw error
  }

  const write = options.write ?? (text => process.stdout.write(text))
  if (details.isFile()) {
    if (parsed.hasDirectoryOptions) throw new Error('Directory options cannot be used with a file')
    const statistics = await countFile(parsed.path)
    write(`Lines: ${statistics.lines}\n`)
    write(`Words: ${statistics.words}\n`)
    write(`Characters: ${statistics.characters}\n`)
    return
  }
  if (!details.isDirectory()) throw new Error(`Path is not a regular file or directory: ${parsed.path}`)

  const statistics = await countDirectory(parsed.path, parsed)
  const output = [
    ...statistics.files.map(file => `${file.path}: ${file.lines}\n`),
    `Files: ${statistics.files.length}\n`,
    `Lines: ${statistics.lines}\n`,
  ].join('')
  write(output)
}