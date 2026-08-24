import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const pairs = [
  ['README.md', 'README.zh.md', 'README.i18n.yaml'],
  ['AGENTS.md', 'AGENTS.zh.md', 'AGENTS.i18n.yaml'],
  ['examples/README.md', 'examples/README.zh.md', 'examples/README.i18n.yaml'],
]

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

function structure(text) {
  return {
    headings: [...text.matchAll(/^(#+) /gm)].map(match => match[1].length),
    fences: text.split(/\r?\n/).filter(line => line.startsWith('```')).length,
  }
}

function proseLinks(text) {
  let fenced = false
  const links = []
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('```')) {
      fenced = !fenced
      continue
    }
    if (fenced) continue
    links.push(...[...line.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]))
  }
  return links
}

for (const [englishRelative, chineseRelative, recordRelative] of pairs) {
  const englishPath = join(root, englishRelative)
  const chinesePath = join(root, chineseRelative)
  const recordPath = join(root, recordRelative)
  const [english, chinese, recordText] = await Promise.all([
    readFile(englishPath, 'utf8'),
    readFile(chinesePath, 'utf8'),
    readFile(recordPath, 'utf8'),
  ])

  const englishName = basename(englishPath)
  const chineseName = basename(chinesePath)
  const record = parseConsistencyRecord(recordText, [englishName, chineseName])
  if (record === undefined) {
    throw new Error(`${recordRelative}: consistency record must use canonical YAML mappings`)
  }
  if (record.get(englishName) !== gitBlobHash(english)
    || record.get(chineseName) !== gitBlobHash(chinese)) {
    throw new Error(`${recordRelative}: translation pair hash mismatch`)
  }

  if (!english.includes(`English | [简体中文](${basename(chinesePath)})`)) {
    throw new Error(`${englishRelative}: missing Chinese language switcher`)
  }
  if (!chinese.includes(`[English](${basename(englishPath)}) | 简体中文`)) {
    throw new Error(`${chineseRelative}: missing English language switcher`)
  }
  if (JSON.stringify(structure(english)) !== JSON.stringify(structure(chinese))) {
    throw new Error(`${englishRelative}: bilingual structure mismatch`)
  }

  for (const [documentPath, relativePath, text] of [
    [englishPath, englishRelative, english],
    [chinesePath, chineseRelative, chinese],
  ]) {
    for (const link of proseLinks(text)) {
      const target = link.split('#')[0]
      if (target === '' || /^[a-z]+:/iu.test(target)) continue
      const resolved = resolve(dirname(documentPath), decodeURIComponent(target))
      if (!existsSync(resolved)) throw new Error(`${relativePath}: broken relative link ${link}`)
    }
  }
}

console.log(`Verified ${pairs.length} bilingual document pair(s).`)