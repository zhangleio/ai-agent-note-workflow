import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../.agents/notes/', import.meta.url))
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

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

function structuralSignature(text) {
  const withoutSwitcher = text.replace(/^\[?English\]?.*中文.*$/m, '')
  return {
    headingDepths: [...withoutSwitcher.matchAll(/^(#+) /gm)].map(match => match[1].length),
    codeBlocks: [...withoutSwitcher.matchAll(/^```[^\n]*\n[\s\S]*?^```$/gm)].map(match => match[0]),
    linkTargets: [...withoutSwitcher.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]),
  }
}

const allFiles = await filesBelow(root)
const sourceFiles = allFiles.filter(path => path.endsWith('.md') && !path.endsWith('.zh.md'))
if (sourceFiles.length === 0) throw new Error('No Agent Notes found')

const manifestPath = join(root, 'archived', 'manifest.json')
const archiveManifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const seenTopics = new Map()
const pairedPaths = new Set()

for (const sourceFile of sourceFiles) {
  const sourcePath = relative(root, sourceFile).replaceAll('\\', '/')
  const lifecycle = sourcePath.split('/')[0]
  const sections = lifecycleSections[lifecycle]
  if (sections === undefined) throw new Error(`${sourcePath}: unsupported lifecycle`)

  const topic = basename(sourceFile)
  const previousPath = seenTopics.get(topic)
  if (previousPath !== undefined) throw new Error(`${sourcePath}: duplicates Agent Note ${previousPath}`)
  seenTopics.set(topic, sourcePath)

  const stem = sourceFile.slice(0, -'.md'.length)
  const zhFile = `${stem}.zh.md`
  const recordFile = `${stem}.i18n.yaml`
  const zhPath = relative(root, zhFile).replaceAll('\\', '/')
  const recordPath = relative(root, recordFile).replaceAll('\\', '/')
  const [sourceText, zhText, recordText] = await Promise.all([
    readFile(sourceFile, 'utf8'),
    readFile(zhFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing ${basename(zhFile)}`) }),
    readFile(recordFile, 'utf8').catch(() => { throw new Error(`${sourcePath}: missing ${basename(recordFile)}`) }),
  ])
  pairedPaths.add(sourcePath)
  pairedPaths.add(zhPath)
  pairedPaths.add(recordPath)

  let record
  try {
    record = JSON.parse(recordText)
  } catch {
    throw new Error(`${recordPath}: consistency record must use JSON-compatible YAML`)
  }
  if (record[basename(sourceFile)] !== gitBlobHash(sourceText)
    || record[basename(zhFile)] !== gitBlobHash(zhText)) {
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

console.log(`Verified ${sourceFiles.length} Agent Note pair(s).`)