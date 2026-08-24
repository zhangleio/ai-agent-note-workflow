export const DEFAULT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.html',
] as const

export interface CliArguments {
  path: string
  extensions: readonly string[]
  recursive: boolean
  hasDirectoryOptions: boolean
}

/** Parse one input path and directory scan options. */
export function parseCliArguments(args: readonly string[]): CliArguments {
  let path: string | undefined
  let recursive = true
  let hasDirectoryOptions = false
  const extensions = new Map<string, string>()

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!
    if (argument === '--no-recursive') {
      recursive = false
      hasDirectoryOptions = true
      continue
    }
    if (argument === '--ext') {
      const extension = args[index + 1]
      if (extension === undefined || !/^\.[^.\\/]+$/u.test(extension)) {
        throw new Error('Each --ext requires an extension such as .ts')
      }
      extensions.set(extension.toLowerCase(), extension.toLowerCase())
      hasDirectoryOptions = true
      index += 1
      continue
    }
    if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`)
    if (path !== undefined) throw new Error('Usage: text-stats <path> [--ext <extension>]... [--no-recursive]')
    path = argument
  }

  if (path === undefined) throw new Error('Usage: text-stats <path> [--ext <extension>]... [--no-recursive]')
  return {
    path,
    extensions: extensions.size === 0 ? DEFAULT_EXTENSIONS : [...extensions.values()],
    recursive,
    hasDirectoryOptions,
  }
}