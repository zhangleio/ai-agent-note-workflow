# Agent Note: Bilingual Agent Note pairs

Status: implemented

English | [中文](2026-08-24-bilingual-agent-note-pairs.zh.md)

## Problem

The demonstration repository stores each Agent Note only in English. DeepSeek Harness instead treats English and Simplified Chinese as equally authoritative and requires every active Note to be a complete three-file group: `topic.md`, `topic.zh.md`, and `topic.i18n.yaml`. The demonstration therefore omits a material part of the workflow it is intended to teach.

The current verifier counts Markdown files rather than decision groups, cannot distinguish a Chinese counterpart from a second topic, and freezes only the English archived file. Adding translations without changing these rules would either fail validation or leave incomplete lifecycle and archive guarantees.

## Decision

Every active Agent Note is a sibling triplet. The English and Chinese files carry the same status, headings, facts, alternatives, links, and code blocks, with reciprocal language switchers after the status block. Neither language outranks the other. The YAML record stores each side's Git blob hash at the last human-confirmed consistent contents.

The verifier discovers unsuffixed English Notes as decision groups. It requires both counterpart files and the consistency record, checks both current Git blob hashes against the record, validates lifecycle status and required sections in each language, checks reciprocal switchers and structural signatures, rejects orphan pair artifacts, and reports the number of Note groups rather than Markdown files.

Lifecycle changes move all three files together. Proposed, implemented, and rejected pairs remain editable only when both languages are updated and the record is refreshed. Archiving is permitted only for a complete consistent triplet; all three files receive or preserve the archive metadata as applicable and are frozen by the archive manifest.

The six earlier Notes were migrated in one bounded operation. The archived remove Note was temporarily unfrozen only to create its missing Chinese counterpart, consistency record, and complete archive manifest entries; it is again a frozen triplet. This was a correction to the demonstration's incomplete archive procedure, not ordinary post-archive editing.

## Alternatives considered

**Treat English as authoritative and Chinese as a convenience translation.** This reduces synchronization work but does not demonstrate the source repository's equal-authority contract.

**Add only `.zh.md` files.** Without a consistency record, later edits can silently update one language only. Presence is weaker than confirmed consistency.

**Translate only new Notes.** This leaves active rules split between bilingual and English-only records, forcing readers to know a rollout boundary and leaving the archived example structurally incorrect.

**Copy the full DeepSeek Harness translation toolchain.** Its merge driver, snapshot refs, structural signature, terminology corpus, and generators solve repository-scale problems. The demonstration needs the same contract with a smaller verifier, not the entire production implementation.

**Keep the archived English file permanently frozen and add an external Chinese explanation.** That preserves the current hash but fails the complete-triplet archive rule and separates equivalent history into unrelated locations.

## Verification

- All seven Agent Note groups contain `.md`, `.zh.md`, and `.i18n.yaml` siblings.
- English and Chinese files have reciprocal switchers, matching lifecycle status, equivalent required sections, links, and code blocks.
- Each consistency record contains the current Git blob hash of both language files.
- Editing either language without refreshing the confirmed record fails `npm run verify:notes`.
- Missing or orphaned pair artifacts fail validation.
- Lifecycle duplicate detection operates on the unsuffixed topic stem.
- The archived remove Note freezes all three files and rejects a one-byte change to either language or the pairing record.
- `npm run check` reports seven Agent Note pairs, compiles the strict TypeScript program, and passes all eighteen behavior tests.

## Consequences

Readers and agents can use either language as an equally authoritative decision source, and lifecycle operations cannot silently leave one language behind. Human review still determines semantic translation quality; matching hashes and structure cannot prove equivalent meaning. Migrating an already frozen demonstration Note was exceptional corrective work and must not become a general way to rewrite archives. Maintaining two equally authoritative texts adds review cost, while this deliberately small verifier does not reproduce every production repository merge and structural check.