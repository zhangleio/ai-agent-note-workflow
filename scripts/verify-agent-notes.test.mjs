import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import test from 'node:test'
import assert from 'node:assert/strict'

const execFileAsync = promisify(execFile)
const verifier = fileURLToPath(new URL('./verify-agent-notes.mjs', import.meta.url))
const topic = '2026-08-29-language-mode'

function gitBlobHash(text) {
  const content = Buffer.from(text.replaceAll('\r\n', '\n'))
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex')
}

function proposedText(language, bilingual = false) {
  if (language === 'en') return `# Agent Note: Language mode

Status: proposed
${bilingual ? `\nEnglish | [中文](${topic}.zh.md)\n` : ''}
## Problem

Problem.

## Proposal

Proposal.

## Alternatives considered

Alternative.

## Acceptance criteria

- Complete.

## Risks

Risk.
`
  return `# Agent Note：语言模式

Status: proposed
${bilingual ? `\n[English](${topic}.md) | 中文\n` : ''}
## 问题

问题。

## 提案

提案。

## 考虑过的替代方案

替代方案。

## 验收标准

- 完成。

## 风险

风险。
`
}

function implementedText(language) {
  if (language === 'en') return `# Agent Note: Language mode

Status: implemented

English | [中文](${topic}.zh.md)

## Problem

Problem.

## Decision

Decision.

## Alternatives considered

Alternative.

## Consequences

Consequence.
`
  return `# Agent Note：语言模式

Status: implemented

[English](${topic}.md) | 中文

## 问题

问题。

## 决策

决策。

## 考虑过的替代方案

替代方案。

## 后果

后果。
`
}

async function createProject(mode, { omitConfiguration = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'agent-note-mode-'))
  await mkdir(join(root, '.agents', 'notes', 'proposed', 'process'), { recursive: true })
  await mkdir(join(root, '.agents', 'notes', 'implemented', 'process'), { recursive: true })
  if (!omitConfiguration) {
    await writeFile(join(root, '.agents', 'agent-note-workflow.json'), `${JSON.stringify({ version: 1, proposedMode: mode }, null, 2)}\n`)
  }
  return root
}

async function writeMonolingualProposal(root, language) {
  const suffix = language === 'zh' ? '.zh.md' : '.md'
  await writeFile(join(root, '.agents', 'notes', 'proposed', 'process', `${topic}${suffix}`), proposedText(language))
}

async function writeBilingualProposal(root) {
  const directory = join(root, '.agents', 'notes', 'proposed', 'process')
  const en = proposedText('en', true)
  const zh = proposedText('zh', true)
  await Promise.all([
    writeFile(join(directory, `${topic}.md`), en),
    writeFile(join(directory, `${topic}.zh.md`), zh),
    writeFile(join(directory, `${topic}.i18n.yaml`), `# Bilingual-pair consistency record
${topic}.md: ${gitBlobHash(en)}
${topic}.zh.md: ${gitBlobHash(zh)}
`),
  ])
}

async function writeImplementedPair(root, { omitChinese = false } = {}) {
  const directory = join(root, '.agents', 'notes', 'implemented', 'process')
  const en = implementedText('en')
  const zh = implementedText('zh')
  await writeFile(join(directory, `${topic}.md`), en)
  if (!omitChinese) await writeFile(join(directory, `${topic}.zh.md`), zh)
  await writeFile(join(directory, `${topic}.i18n.yaml`), `# Bilingual-pair consistency record
${topic}.md: ${gitBlobHash(en)}
${topic}.zh.md: ${gitBlobHash(zh)}
`)
}

async function verify(root) {
  return execFileAsync(process.execPath, [verifier, '--project-root', root])
}

async function withProject(mode, options, action) {
  const root = await createProject(mode, options)
  try {
    await action(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('accepts an explicit bilingual proposed Note', () => withProject('bilingual', {}, async root => {
  await writeBilingualProposal(root)
  const { stdout } = await verify(root)
  assert.match(stdout, /proposedMode=bilingual/)
}))

test('uses bilingual as the compatibility default when configuration is missing', () => withProject('bilingual', { omitConfiguration: true }, async root => {
  await writeBilingualProposal(root)
  const { stdout } = await verify(root)
  assert.match(stdout, /proposedMode=bilingual \(compatibility default\)/)
}))

test('accepts a Chinese-only proposed Note', () => withProject('zh-only', {}, async root => {
  await writeMonolingualProposal(root, 'zh')
  const { stdout } = await verify(root)
  assert.match(stdout, /1 monolingual proposed Note\(s\)/)
  assert.match(stdout, /proposedMode=zh-only/)
}))

test('accepts an English-only proposed Note', () => withProject('en-only', {}, async root => {
  await writeMonolingualProposal(root, 'en')
  const { stdout } = await verify(root)
  assert.match(stdout, /proposedMode=en-only/)
}))

test('rejects mixed proposed artifacts in Chinese-only mode', () => withProject('zh-only', {}, async root => {
  await writeMonolingualProposal(root, 'zh')
  await writeFile(join(root, '.agents', 'notes', 'proposed', 'process', `${topic}.md`), proposedText('en'))
  await assert.rejects(verify(root), error => {
    assert.match(error.stderr, /artifact is incompatible with proposedMode zh-only/)
    return true
  })
}))

test('rejects mixed proposed artifacts in English-only mode', () => withProject('en-only', {}, async root => {
  await writeMonolingualProposal(root, 'en')
  await writeFile(join(root, '.agents', 'notes', 'proposed', 'process', `${topic}.zh.md`), proposedText('zh'))
  await assert.rejects(verify(root), error => {
    assert.match(error.stderr, /artifact is incompatible with proposedMode en-only/)
    return true
  })
}))

test('requires a locked bilingual triplet after proposed', () => withProject('zh-only', {}, async root => {
  await writeImplementedPair(root, { omitChinese: true })
  await assert.rejects(verify(root), error => {
    assert.match(error.stderr, /missing .*\.zh\.md/)
    return true
  })
}))

test('accepts a locked bilingual triplet after proposed in a monolingual project', () => withProject('en-only', {}, async root => {
  await writeImplementedPair(root)
  const { stdout } = await verify(root)
  assert.match(stdout, /1 locked Note pair\(s\)/)
}))

test('rejects an unsupported configured mode', () => withProject('zh-only', {}, async root => {
  await writeFile(join(root, '.agents', 'agent-note-workflow.json'), '{"version":1,"proposedMode":"mixed"}\n')
  await assert.rejects(verify(root), error => {
    assert.match(error.stderr, /proposedMode must be bilingual, zh-only, or en-only/)
    return true
  })
}))
