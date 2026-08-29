# Agent Note: Copyable adoption prompts and Chinese display name

Status: implemented
Date: 2026-08-30

English | [中文](2026-08-30-copyable-adoption-prompts-and-chinese-name.zh.md)

## Problem

The reusable guide defined three `proposedMode` values and a detailed new-project checklist, but a reader still had to translate those rules into a request for Codex or another Agent. The guide also lacked a stable Chinese display name, so Chinese references alternated between a literal repository name, “Agent Note driven development workflow,” and less precise descriptions.

## Decision

“AI Agent 决策记录工作流” is the recommended Chinese display name. `ai-agent-note-workflow` remains beside it when repository identity matters, and the repository name and English terminology remain unchanged. “决策记录” naturally describes the Note's problem, proposal or decision, alternatives, verification, consequences, and lifecycle history.

Both READMEs include a “Copyable adoption prompts” subsection immediately before the detailed new-project checklist. They present exactly three user-facing choices in this order: Chinese mode (`zh-only`), English mode (`en-only`), and bilingual mode (`bilingual`). Chinese mode appears first and is marked “Recommended” for new projects because it minimizes drafting churn while preserving bilingual convergence at the lifecycle boundary. This documentation recommendation does not change verifier compatibility: an existing project without configuration still resolves to `bilingual`.

Each mode has a ready-to-use prompt containing the upstream repository URL, a target-project-path placeholder, selected mode and proposed-stage file behavior, the requirement to complete locked bilingual triplets before lifecycle migration, and instructions to add the configuration, Agent rules, compatible verifier, and project check integration without changing business behavior.

The Chinese README provides Chinese prompts and the English README provides semantically equivalent English prompts. The prompts describe adapting workflow rules into a downstream project; they do not imply a runtime package dependency, telemetry, automatic updates, or continuing synchronization with upstream.

## Alternatives considered

**Use “AI Agent 注记工作流.”** This is closer to the repository basename, but “注记” is less idiomatic and understates that the records govern reviewed decisions and lifecycle history.

**Use “智能体决策留痕工作流.”** This is fully localized, but “留痕” sounds compliance-oriented and “智能体” is less recognizable than the established `AI Agent` term for the intended audience.

**Provide only one generic prompt with a mode placeholder.** This is shorter to maintain, but it makes readers remember mode identifiers and semantics. Three explicit prompts better serve the copy-and-use scenario.

**Recommend bilingual mode because it is the compatibility default.** Compatibility protects existing unconfigured projects, but it should not determine the best onboarding experience. Chinese mode avoids translation and hash churn during active discussion while retaining the same locked bilingual result.

**Put the prompts only in the Chinese README.** This would violate the repository's equal-authority bilingual documentation policy and make the English guide incomplete.

## Verification

`node scripts/verify-doc-i18n.mjs` verified all three governed bilingual document pairs after the README pair and its real Git blob hashes were updated. `node scripts/verify-agent-notes.mjs` verified all eight locked Note pairs while this Note remained a bilingual proposal, and `git diff --check` reported no whitespace errors.

Before final ordering feedback, `npm --prefix examples/agent-workflow-demo run check` passed its Note gate, TypeScript build, and all 18 tests. `npm --prefix examples/text-stats-workflow-demo run check` passed its Note gate, TypeScript build, and all 25 tests. The later change only reordered the three documentation choices and prompts; the focused document and Note gates passed again afterward.

The project owner approved the proposal before implementation, selected Chinese mode as the recommended new-project choice, selected the final Chinese–English–bilingual display order, and accepted the verified implementation on 2026-08-30.

## Consequences

Readers can copy one complete prompt instead of translating workflow semantics into an Agent request. Chinese-first onboarding is visibly recommended, while English-only and continuously bilingual drafting remain equally supported choices. Existing unconfigured projects retain the bilingual compatibility default.

Long prompts can drift when workflow details change, so they remain adjacent to the authoritative checklist and direct users to follow the latest upstream instructions. “Recommended for new projects” and “compatibility default when configuration is missing” remain explicitly distinct. The Chinese display name is descriptive branding, not a repository rename.
