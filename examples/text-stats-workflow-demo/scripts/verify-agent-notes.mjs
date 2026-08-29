import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const supportedModes = new Set(['bilingual', 'zh-only', 'en-only'])
const noteClasses = new Set(['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing'])
const lifecycleSections = {
  proposed: {
    en: ['## Problem', '## Proposal', '## Alternatives considered', '## Acceptance criteria', '## Risks'],
    zh: ['## 问题', '## 提案', '## 考虑过的替代方案', '## 验收标准', '## 风险'],
  },
  implemented: {
    en: ['## Problem', '## Decision', '## Alternatives considered', '## Consequences'],
    zh: ['## 问题', '## 决策', '## 考虑过的替代方案', '## 后果'],
  },
  rejected: {
    en: ['## Problem', '## Proposal', '## Alternatives considered'],
    zh: ['## 问题', '## 提案', '## 考虑过的替代方案'],
  },
  archived: {
    en: ['## Problem', '## Decision', '## Alternatives considered', '## Consequences'],
    zh: ['## 问题', '## 决策', '## 考虑过的替代方案', '## 后果'],
  },
}

function parseArguments(argv) {
  if (argv.length === 0) return fileURLToPath(new URL('..', import.meta.url))
  if (argv.length === 2 && argv[0] === '--project-root') return resolve(argv[1])
  throw new Error('Usage: node scripts/verify-agent-notes.mjs [--project-root <path>]')
}

async function readConfiguration(projectRoot) {
  const path = join(projectRoot, '.agents', 'agent-note-workflow.json')
  let text
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return { version: 1, proposedMode: 'bilingual', compatibilityDefault: true }
    throw error
  }

  let configuration
  try {
    configuration = JSON.parse(text)
  } catch {
    throw new Error(`${relative(projectRoot, path)}: invalid JSON`)
  }
  if (configuration === null || Array.isArray(configuration) || typeof configuration !== 'object') {
    throw new Error(`${relative(projectRoot, path)}: configuration must be an object`)
  }
  const keys = Object.keys(configuration).sort()
  if (JSON.stringify(keys) !== JSON.stringify(['proposedMode', 'version'])) {
    throw new Error(`${relative(projectRoot, path)}: expected only version and proposedMode`)
  }
  if (configuration.version !== 1) {
    throw new Error(`${relative(projectRoot, path)}: unsupported configuration version`)
  }
  if (!supportedModes.has(configuration.proposedMode)) {
    throw new Error(`${relative(projectRoot, path)}: proposedMode must be bilingual, zh-only, or en-only`)
  }
  return configuration
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesBelow(path) : [path]
  }))
  return nested.flat()
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

function parseFrozenLegacyRecord(text, expectedKeys) {
  try {
    const record = JSON.parse(text)
    if (Object.keys(record).length !== expectedKeys.length
      || expectedKeys.some(key => !/^[0-9a-f]{40}$/.test(record[key]))) return undefined
    return new Map(Object.entries(record))
  } catch {
    return undefined
  }
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

function structuralSignature(text) {
  const withoutSwitcher = text.replace(/^\[?English\]?.*中文.*$/m, '')
  return {
    headingDepths: [...withoutSwitcher.matchAll(/^(#+) /gm)].map(match => match[1].length),
    codeBlocks: [...withoutSwitcher.matchAll(/^```[^\n]*\n[\s\S]*?^```$/gm)].map(match => match[0]),
    linkTargets: [...withoutSwitcher.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      .map(match => match[1].replace(/\.zh\.md(?=$|#)/, '.md')),
  }
}

function noteIdentity(file, language) {
  const name = basename(file)
  const topic = language === 'zh' ? name.replace(/\.zh\.md$/, '.md') : name
  if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(topic)) {
    throw new Error(`${name}: Note name must be yyyy-mm-dd-topic${language === 'zh' ? '.zh' : ''}.md`)
  }
  return topic
}

function registerTopic(seenTopics, topic, path) {
  const previousPath = seenTopics.get(topic)
  if (previousPath !== undefined) throw new Error(`${path}: duplicates Agent Note ${previousPath}`)
  seenTopics.set(topic, path)
}

async function readArchiveManifest(notesRoot) {
  const path = join(notesRoot, 'archived', 'manifest.json')
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw new Error(`${relative(notesRoot, path)}: invalid archive manifest`)
  }
}

const projectRoot = parseArguments(process.argv.slice(2))
const notesRoot = join(projectRoot, '.agents', 'notes')
const configuration = await readConfiguration(projectRoot)
const allFiles = await filesBelow(notesRoot)
const proposedMode = configuration.proposedMode
const monolingualLanguage = proposedMode === 'zh-only' ? 'zh' : proposedMode === 'en-only' ? 'en' : undefined
const monolingualProposedFiles = monolingualLanguage === undefined ? [] : allFiles.filter(file => {
  const path = relative(notesRoot, file).replaceAll('\\', '/')
  if (!path.startsWith('proposed/')) return false
  return monolingualLanguage === 'zh' ? path.endsWith('.zh.md') : path.endsWith('.md') && !path.endsWith('.zh.md')
})
const pairedSourceFiles = allFiles.filter(file => {
  const path = relative(notesRoot, file).replaceAll('\\', '/')
  if (path.startsWith('proposed/') && proposedMode !== 'bilingual') return false
  return path.endsWith('.md') && !path.endsWith('.zh.md')
})
const archiveManifest = await readArchiveManifest(notesRoot)
const seenTopics = new Map()
const pairedPaths = new Set()

for (const file of monolingualProposedFiles) {
  const path = relative(notesRoot, file).replaceAll('\\', '/')
  const [, noteClass] = path.split('/')
  if (!noteClasses.has(noteClass)) throw new Error(`${path}: unsupported Note class`)

  const topic = noteIdentity(file, monolingualLanguage)
  registerTopic(seenTopics, topic, path)
  const text = await readFile(file, 'utf8')
  const status = text.match(/^Status: ([^\n]+)$/m)?.[1]
  if (status === undefined || !status.startsWith('proposed')) {
    throw new Error(`${path}: Status must match proposed`)
  }
  for (const section of lifecycleSections.proposed[monolingualLanguage]) {
    if (!text.includes(section)) throw new Error(`${path}: missing ${section}`)
  }
  if (/^\[?English\]?.*中文.*$/m.test(text)) {
    throw new Error(`${path}: monolingual proposed Note must not contain a language switcher`)
  }
  pairedPaths.add(path)
}

for (const sourceFile of pairedSourceFiles) {
  const sourcePath = relative(notesRoot, sourceFile).replaceAll('\\', '/')
  const [lifecycle, noteClass] = sourcePath.split('/')
  const sections = lifecycleSections[lifecycle]
  if (sections === undefined) throw new Error(`${sourcePath}: unsupported lifecycle`)
  if (!noteClasses.has(noteClass)) throw new Error(`${sourcePath}: unsupported Note class`)

  const topic = noteIdentity(sourceFile, 'en')
  registerTopic(seenTopics, topic, sourcePath)
  const stem = sourceFile.slice(0, -'.md'.length)
  const zhFile = `${stem}.zh.md`
  const recordFile = `${stem}.i18n.yaml`
  const zhPath = relative(notesRoot, zhFile).replaceAll('\\', '/')
  const recordPath = relative(notesRoot, recordFile).replaceAll('\\', '/')
  const [sourceText, zhText, recordText] = await Promise.all([
    readFile(sourceFile, 'utf8'),
    readFile(zhFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing ${basename(zhFile)}`) }),
    readFile(recordFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing ${basename(recordFile)}`) }),
  ])
  pairedPaths.add(sourcePath)
  pairedPaths.add(zhPath)
  pairedPaths.add(recordPath)

  const sourceName = basename(sourceFile)
  const zhName = basename(zhFile)
  const expectedKeys = [sourceName, zhName]
  const record = parseConsistencyRecord(recordText, expectedKeys)
    ?? (lifecycle === 'archived' ? parseFrozenLegacyRecord(recordText, expectedKeys) : undefined)
  if (record === undefined) {
    throw new Error(`${recordPath}: consistency record must use canonical YAML mappings with real hashes`)
  }
  if (record.get(sourceName) !== gitBlobHash(sourceText)
    || record.get(zhName) !== gitBlobHash(zhText)) {
    throw new Error(`${recordPath}: translation pair hash mismatch`)
  }

  const expectedStatus = lifecycle === 'archived' ? 'implemented' : lifecycle
  for (const [language, text] of [['en', sourceText], ['zh', zhText]]) {
    const status = text.match(/^Status: ([^\n]+)$/m)?.[1]
    if (status === undefined || !status.startsWith(expectedStatus)) {
      throw new Error(`${language === 'en' ? sourcePath : zhPath}: Status must match ${expectedStatus}`)
    }
    for (const section of sections[language]) {
      if (!text.includes(section)) throw new Error(`${language === 'en' ? sourcePath : zhPath}: missing ${section}`)
    }
  }

  if (!sourceText.includes(`English | [中文](${basename(zhFile)})`)) {
    throw new Error(`${sourcePath}: missing Chinese language switcher`)
  }
  if (!zhText.includes(`[English](${basename(sourceFile)}) | 中文`)) {
    throw new Error(`${zhPath}: missing English language switcher`)
  }
  if (JSON.stringify(structuralSignature(sourceText)) !== JSON.stringify(structuralSignature(zhText))) {
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
  const path = relative(notesRoot, file).replaceAll('\\', '/')
  if (path.startsWith('proposed/') && (path.endsWith('.md') || path.endsWith('.i18n.yaml')) && !pairedPaths.has(path)) {
    throw new Error(`${path}: artifact is incompatible with proposedMode ${proposedMode}`)
  }
  if (!path.startsWith('proposed/') && (path.endsWith('.zh.md') || path.endsWith('.i18n.yaml')) && !pairedPaths.has(path)) {
    throw new Error(`${path}: orphan translation pair artifact`)
  }
}

for (const archivePath of Object.keys(archiveManifest)) {
  if (!pairedPaths.has(`archived/${archivePath}`)) {
    throw new Error(`archived/manifest.json: entry has no paired file: ${archivePath}`)
  }
}

const compatibility = configuration.compatibilityDefault ? ' (compatibility default)' : ''
console.log(`Verified ${monolingualProposedFiles.length} monolingual proposed Note(s) and ${pairedSourceFiles.length} locked Note pair(s); proposedMode=${proposedMode}${compatibility}.`)
