# Agent Note: Configurable proposed Note language mode

Status: implemented
Date: 2026-08-29

English | [中文](2026-08-29-configurable-proposed-note-language-mode.zh.md)

## Problem

The reusable workflow required every proposed Agent Note to maintain an equal-authority English document, Simplified Chinese document, and consistency record from the start. A downstream project demonstrated that maintaining only a Chinese draft during active discussion substantially reduced translation and hash churn, while English-first projects had the symmetric need. Projects had to rewrite their Agent instructions and fork the verifier to obtain either behavior, so the reusable workflow did not provide one explicit, mechanically enforced choice.

## Decision

The workflow uses a versioned `.agents/agent-note-workflow.json` project configuration with a `proposedMode` value of `bilingual`, `zh-only`, or `en-only`. New-project guidance requires an explicit selection. A missing configuration remains equivalent to `bilingual` for compatibility with existing adopters.

The mode affects only `proposed/`. `bilingual` requires the English `.md`, Chinese `.zh.md`, and `.i18n.yaml` record with real Git blob hashes. `zh-only` requires only the Chinese `.zh.md`; `en-only` requires only the English `.md`. A monolingual proposal has no language switcher, placeholder translation, sidecar, or `pending` hash.

Before a Note leaves `proposed/`, it becomes an equal-authority bilingual triplet with real hashes. Implemented, rejected, and archived Notes therefore retain one format regardless of draft mode. The verifier reads the project configuration, rejects mixed or extra proposed artifacts, and applies the locked-triplet checks outside `proposed/`. Changing modes while proposals exist requires migrating every active proposal in the same change.

The workflow repository provides one canonical, copyable verifier. Both runnable examples keep project-local identical copies and explicitly select `bilingual`, preserving their existing lifecycle history. The reusable `AGENTS.md` baseline points to the configuration as the source of truth instead of embedding a selected value in prose.

## Alternatives considered

**Publish three independent AGENTS.md and verifier templates.** This would require fixes and lifecycle changes to remain synchronized across three implementations, and projects could select one prose template while copying another verifier.

**Store the selected mode only in AGENTS.md.** A verifier would have to parse unstable prose or duplicate the value in code, allowing policy and enforcement to drift.

**Allow each proposed Note to choose its own language mode.** File discovery would become ambiguous and reviewers could not infer project policy from the directory. A single project-level mode keeps the contract predictable.

**Allow `pending` hashes for incomplete bilingual proposals.** This would create a fourth intermediate state and weaken the meaning of the consistency record. Monolingual modes remove translation churn without placeholder metadata.

## Verification

`node scripts/verify-doc-i18n.mjs` verified all three governed bilingual document pairs. `node scripts/verify-agent-notes.mjs` verified the repository's seven locked Note pairs in explicit `bilingual` mode.

`node --test scripts/verify-agent-notes.test.mjs` passed all 9 tests covering explicit bilingual mode, the missing-configuration compatibility default, Chinese-only and English-only proposals, invalid mixed states, locked-triplet requirements after proposed, and invalid configuration values.

After installing each example's locked dependencies with `npm ci`, `npm --prefix examples/agent-workflow-demo run check` passed its Note gate, TypeScript build, and all 18 tests. `npm --prefix examples/text-stats-workflow-demo run check` passed its Note gate, TypeScript build, and all 25 tests. The canonical verifier and both example-local copies had identical SHA-256 values. `git diff --check` reported no whitespace errors.

The project owner approved the proposal before implementation and accepted the verified implementation on 2026-08-29.

## Consequences

New projects can select the proposed drafting language once and have the same choice enforced by tooling and Agent instructions. Chinese-first and English-first teams avoid translation and hash churn during active discussion, while bilingual teams retain continuous equal-authority locking. All projects converge on the same bilingual, real-hash representation before a decision leaves `proposed/`.

Existing projects without configuration continue to validate as bilingual. Projects that copied an older verifier must adopt the configuration and compatible verifier together; changing only the configuration does not add mode support. Changing a project's mode with active proposals requires an atomic migration of those proposals.
