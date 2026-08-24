# Agent Note: Repository document i18n gate

Status: implemented

English | [中文](2026-08-24-repository-document-i18n-gate.zh.md)

## Problem

The repository now maintains three equal-authority English and Simplified Chinese document pairs, but their implemented process intentionally relies on human review without content hashes. This allows a later edit to update only one language while all files and links still appear valid. Adding consistency records without an executed check would merely create stale metadata, so the records need an owning validation command.

This proposal partially supersedes the no-hash-gate decision in [Bilingual repository documents](../../implemented/process/2026-08-24-bilingual-repository-documents.md). Its language naming, complete `AGENTS.md`, scope, and equal-authority rules remain effective.

## Decision

The repository keeps one canonical YAML consistency record beside each governed bilingual document pair. [Canonical i18n YAML format](../bug-fix/2026-08-24-canonical-i18n-yaml-format.md) corrects the original JSON-object representation without changing this gate's ownership or hash semantics:

```text
README.i18n.yaml
AGENTS.i18n.yaml
examples/README.i18n.yaml
```

Each record maps the two local Markdown basenames to their Git blob SHA-1 after CRLF-to-LF normalization. A hash refresh means a human has reviewed both current documents for semantic equivalence; it must not be used to hide an unsynchronized translation.

Each non-comment line must be an unquoted `<basename>.md: <40-character-lowercase-hex>` mapping. Blank lines and `#` comments are allowed. JSON object syntax, quoted keys, duplicates, unknown keys, and malformed hashes are rejected.

The zero-dependency `scripts/verify-doc-i18n.mjs` command validates the three declared pairs. It checks that both documents and the consistency record exist, the recorded hashes match current content, language switchers are reciprocal, heading levels and fenced code block structures correspond, and prose relative links resolve. Fenced template examples are excluded from link resolution.

The documented command is:

```powershell
node scripts/verify-doc-i18n.mjs
```

Both root `AGENTS` documents require every change to one of the six governed Markdown files to update its counterpart, refresh the record after human review, and run the command. Both root READMEs describe the ordinary-document gate separately from the Agent Note triplet gate.

The three records govern only the root guide, root Agent instructions, and example index. Example-project-specific documents and Agent Notes keep their existing policies.

## Alternatives considered

**Add records without a script.** This looks standardized but cannot detect stale hashes in normal work. An executable gate gives the records operational meaning.

**Reuse an example project's Agent Note verifier.** Those scripts own lifecycle-specific Note sections, duplicate topics, and archive manifests. Ordinary repository documents need a smaller, separate validator rather than pretending to be Agent Notes.

**Use SHA-256 instead of Git blob SHA-1.** Git blob SHA-1 already defines the repository's active bilingual consistency convention. SHA-256 remains reserved for frozen archive bytes.

**Generate one central record for all six files.** A record beside each pair makes ownership and refresh scope obvious and matches the existing paired-document convention.

## Verification

The first focused run of `node scripts/verify-doc-i18n.mjs` failed because `README.i18n.yaml` did not exist, proving that every declared record is required. After the three records were created, the command verified all three document pairs.

A reversible stale-hash probe then changed the English example index without updating its Chinese counterpart or record. The same command failed with `examples/README.i18n.yaml: translation pair hash mismatch`. After synchronizing the Chinese explanation, reviewing both documents, and refreshing both hashes, the command again reported `Verified 3 bilingual document pair(s).`

Both root README and AGENTS pairs have corresponding heading and fenced-block structures and no Markdown diagnostics. The earlier bilingual-document Note records this decision as a partial supersession while preserving its language naming, scope, complete `AGENTS.md`, and equal-authority rules. Both process Note pairs pass their Git blob hash checks, and `git diff --check` reports no whitespace errors. Human implementation acceptance approved the gate and records.

## Consequences

The three repository document pairs now fail deterministically when a counterpart or consistency record is missing, when reviewed content changes without a hash refresh, when language switchers or document structures diverge, or when prose relative links break. The records use the same LF-normalized Git blob SHA-1 convention as active Agent Notes while remaining separate from lifecycle validation.

Hashes prove that content has not changed since review, not that a translation is accurate. The validator adds a maintenance surface that must evolve if Markdown structure conventions change. Its structural comparison intentionally checks headings and fenced blocks rather than paragraph or list counts, leaving semantic equivalence to human review. Contributors must update two documents and one record for every governed documentation change.