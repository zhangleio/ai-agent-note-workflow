# Agent Note: Downstream workflow provenance

Status: implemented

English | [中文](2026-08-25-downstream-workflow-provenance.zh.md)

## Problem

Projects that adopted this repository's reusable `AGENTS.md` baseline had no concise indication of where the workflow originated. Prominent branding, runtime output, network checks, telemetry, or automatic update prompts would make provenance intrusive and couple downstream projects to this repository.

## Decision

The reusable `AGENTS.md` baseline in both root READMEs contains one static provenance sentence:

```markdown
Agent Note workflow adapted from [ai-agent-note-workflow](https://github.com/zhangleio/ai-agent-note-workflow); local project rules take precedence.
```

The sentence appears only in the template copied into a downstream project's root `AGENTS.md`. It is not present in this repository's own root `AGENTS.md`, because this repository is the source rather than an adopter.

The new-project adoption guidance states that the marker is informational only. It introduces no runtime dependency, telemetry, network request, automatic update check, CI requirement, console output, README badge, or requirement to track upstream changes. A downstream project may evolve independently, and its local rules take precedence.

## Alternatives considered

**Add the sentence to this repository's root `AGENTS.md`.** This would incorrectly describe the source repository as adapted from itself.

**Add a README badge or attribution section to every downstream project.** This is more visible but intrudes on product-facing documentation and is disproportionate for workflow provenance.

**Create a metadata file.** A dedicated file is less likely to be read by Agents or developers and adds another artifact to maintain.

**Add automated upstream update checks.** This would create network and maintenance coupling, which conflicts with the requirement to avoid disturbing downstream projects.

## Verification

After both READMEs changed but before their consistency record was refreshed, `node scripts/verify-doc-i18n.mjs` failed with `README.i18n.yaml: translation pair hash mismatch`, proving that the governed-document gate detected the update. After bilingual review and hash refresh, the same command reported `Verified 3 bilingual document pair(s).`

Markdown diagnostics reported no errors for either README, and `git diff --check` reported no whitespace errors. Git status showed changes only to the README pair, `README.i18n.yaml`, and this Note triplet. The source repository's root `AGENTS.md`, example projects, runtime code, CI configuration, telemetry, network behavior, badges, and update behavior remained unchanged. Separate human implementation review accepted the result.

## Consequences

New projects that copy the documented baseline carry a concise, discoverable link to the workflow source while remaining operationally independent. Their local rules explicitly take precedence, so the marker does not constrain project-specific evolution.

The source URL may eventually change, leaving copied downstream markers stale. GitHub repository redirects reduce this risk, and the marker remains informational even when stale. Adopters may remove or edit the sentence; attribution is not mechanically enforced because low interference and downstream autonomy are intentional priorities.