#!/usr/bin/env node

import { pathToFileURL } from 'node:url'

import { runCli } from './cli.js'

async function main(): Promise<void> {
	try {
		await runCli(process.argv.slice(2))
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		process.stderr.write(`Error: ${message}\n`)
		process.exitCode = 1
	}
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
	await main()
}