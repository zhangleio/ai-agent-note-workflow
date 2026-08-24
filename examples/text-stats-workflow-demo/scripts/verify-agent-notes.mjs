import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../.agents/notes/', import.meta.url))
const lifecycles = {
  proposed: {
    en: ['## Problem', '## Proposal', '## Alternatives considered', '## Acceptance criteria', '## Risks'],
    zh: ['## 问题', '## 提案', '## 考虑过的替代方案', '## 验收标准', '## 风险'],
  },
  implemented: {
    en: ['## Problem', '## Decision', '## Alternatives considered', '## Verification', '## Consequences'],
    zh: ['## 问题', '## 决策', '## 考虑过的替代方案', '## 验证', '## 后果'],
  },
  rejected: {
    en: ['## Problem', '## Proposal', '## Alternatives considered'],
    zh: ['## 问题', '## 提案', '## 考虑过的替代方案'],
  },
  archived: {
    en: ['## Problem', '## Decision', '## Alternatives considered', '## Verification', '## Consequences'],
    zh: ['## 问题', '## 决策', '## 考虑过的替代方案', '## 验证', '## 后果'],
  },
}
const classes = new Set(['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing'])

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesBelow(path) : [path]
  }))).flat()
}

function gitBlobHash(text) {
  const content = Buffer.from(text.replaceAll('\r\n', '\n'))
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex')
}

function parseConsistencyRecord(text, expectedKeys) {
  const record = new Map()
  for (const line of text.split(/\r?\n/)) {
    if (line === '' || line.startsWith('#')) continue
    const match = /^([^:#]+\.md): ([0-9a-f]{40})$/.exec(line)
    if (match === null || record.has(match[1])) return undefined
    record.set(match[1], match[2])
  }
  if (record.size !== expectedKeys.length || expectedKeys.some(key => !record.has(key))) return undefined
  return record
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

function signature(text) {
  const withoutSwitcher = text.replace(/^\[?English\]?.*中文.*$/m, '')
  return {
    headings: [...withoutSwitcher.matchAll(/^(#+) /gm)].map(match => match[1].length),
    code: [...withoutSwitcher.matchAll(/^```[^\n]*\n[\s\S]*?^```$/gm)].map(match => match[0]),
    links: [...withoutSwitcher.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]),
  }
}

const allFiles = await filesBelow(root)
const sources = allFiles.filter(path => path.endsWith('.md') && !path.endsWith('.zh.md'))
if (sources.length === 0) throw new Error('No Agent Notes found')

const archiveManifest = JSON.parse(await readFile(join(root, 'archived', 'manifest.json'), 'utf8'))
const pairedPaths = new Set()
const seenTopics = new Map()

for (const sourceFile of sources) {
  const sourcePath = relative(root, sourceFile).replaceAll('\\', '/')
  const [lifecycle, noteClass] = sourcePath.split('/')
  const sections = lifecycles[lifecycle]
  if (sections === undefined) throw new Error(`${sourcePath}: unsupported lifecycle`)
  if (!classes.has(noteClass)) throw new Error(`${sourcePath}: unsupported class`)

  const topic = basename(sourceFile)
  const previous = seenTopics.get(topic)
  if (previous !== undefined) throw new Error(`${sourcePath}: duplicates Agent Note ${previous}`)
  seenTopics.set(topic, sourcePath)

  const stem = sourceFile.slice(0, -3)
  const zhFile = `${stem}.zh.md`
  const recordFile = `${stem}.i18n.yaml`
  const zhPath = relative(root, zhFile).replaceAll('\\', '/')
  const recordPath = relative(root, recordFile).replaceAll('\\', '/')
  const [sourceText, zhText, recordText] = await Promise.all([
    readFile(sourceFile, 'utf8'),
    readFile(zhFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing Chinese counterpart`) }),
    readFile(recordFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing consistency record`) }),
  ])
  pairedPaths.add(sourcePath)
  pairedPaths.add(zhPath)
  pairedPaths.add(recordPath)

  const sourceName = basename(sourceFile)
  const zhName = basename(zhFile)
  const expectedKeys = [sourceName, zhName]
  const record = parseConsistencyRecord(recordText, expectedKeys)
  if (record === undefined) {
    throw new Error(`${recordPath}: consistency record must use canonical YAML mappings`)
  }
  if (record.get(sourceName) !== gitBlobHash(sourceText)
    || record.get(zhName) !== gitBlobHash(zhText)) {
    throw new Error(`${recordPath}: translation pair hash mismatch`)
  }

  const expectedStatus = lifecycle === 'archived' ? 'implemented' : lifecycle
  for (const [language, text, path] of [['en', sourceText, sourcePath], ['zh', zhText, zhPath]]) {
    const status = text.match(/^Status: ([^\n]+)$/m)?.[1]
    if (status === undefined || !status.startsWith(expectedStatus)) {
      throw new Error(`${path}: Status must match ${expectedStatus}`)
    }
    for (const section of sections[language]) {
      if (!text.includes(section)) throw new Error(`${path}: missing ${section}`)
    }
  }

  if (!sourceText.includes(`English | [中文](${basename(zhFile)})`)) {
    throw new Error(`${sourcePath}: missing Chinese language switcher`)
  }
  if (!zhText.includes(`[English](${basename(sourceFile)}) | 中文`)) {
    throw new Error(`${zhPath}: missing English language switcher`)
  }
  if (JSON.stringify(signature(sourceText)) !== JSON.stringify(signature(zhText))) {
    throw new Error(`${sourcePath}: bilingual structure mismatch`)
  }

  if (lifecycle === 'archived') {
    for (const [path, text] of [[sourcePath, sourceText], [zhPath, zhText], [recordPath, recordText]]) {
      if (path.endsWith('.md') && !/^Archived: \d{4}-\d{2}-\d{2}$/m.test(text)) {
        throw new Error(`${path}: missing Archived date`)
      }
      if (archiveManifest[path.slice('archived/'.length)] !== sha256(text)) {
        throw new Error(`${path}: frozen archive hash mismatch`)
      }
    }
  }
}

for (const file of allFiles) {
  const path = relative(root, file).replaceAll('\\', '/')
  if ((path.endsWith('.zh.md') || path.endsWith('.i18n.yaml')) && !pairedPaths.has(path)) {
    throw new Error(`${path}: orphan translation pair artifact`)
  }
}

for (const archivePath of Object.keys(archiveManifest)) {
  if (!pairedPaths.has(`archived/${archivePath}`)) {
    throw new Error(`archived/manifest.json: entry has no paired file: ${archivePath}`)
  }
}

console.log(`Verified ${sources.length} Agent Note pair(s).`)