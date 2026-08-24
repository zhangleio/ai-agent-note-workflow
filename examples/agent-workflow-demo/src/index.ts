#!/usr/bin/env node

import { pathToFileURL } from 'node:url'

import { runCli } from './cli.js'

/** Run the todo CLI and translate expected failures into a nonzero exit. */
export async function main(): Promise<void> {
  try {
    await runCli(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) await main()