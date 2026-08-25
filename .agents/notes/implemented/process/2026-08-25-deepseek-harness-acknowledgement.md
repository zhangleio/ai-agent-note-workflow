# Agent Note: DeepSeek Harness acknowledgement

Status: implemented

English | [中文](2026-08-25-deepseek-harness-acknowledgement.zh.md)

## Problem

This workflow was inspired by traceable development practices in DeepSeek Harness, but the repository did not acknowledge that influence. Without a clear statement, readers could not distinguish the project's inspiration from its independent implementation or understand that no official affiliation or endorsement was claimed.

## Decision

Section 16, `Acknowledgements / 致谢`, appears at the end of the English and Chinese root READMEs.

English wording:

```markdown
This project was inspired by the traceable development practices in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It independently adapts those ideas into a reusable Agent Note driven workflow and is not affiliated with or endorsed by DeepSeek.
```

Chinese wording:

```markdown
本项目受到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 中可追溯开发实践的启发，并独立将相关理念整理为一套可复用的 Agent Note 驱动工作流。本项目与 DeepSeek 不存在隶属关系，也不代表 DeepSeek 官方立场或获得其官方背书。
```

The acknowledgement describes methodological inspiration only. It does not claim a fork, code derivation, partnership, sponsorship, or endorsement, and it is not copied into downstream projects. The downstream provenance marker continues to point directly to this repository.

This acknowledgement joined the same pending README change and eventual commit as the downstream provenance update while retaining a separate Agent Note because the two changes record distinct attribution decisions.

## Alternatives considered

**Use only `Inspired by DeepSeek Harness`.** This is concise but leaves independence and non-endorsement ambiguous.

**Describe the project as based on or derived from DeepSeek Harness.** Those terms imply a stronger implementation relationship than the stated methodological inspiration.

**Add DeepSeek Harness to the downstream `AGENTS.md` marker.** Downstream projects directly adopt this workflow, not DeepSeek Harness, so transitive attribution would add noise and blur the source relationship.

**Add a NOTICE or third-party license file.** Methodological inspiration alone does not require a new distribution artifact. If copied code or substantial text is identified later, its license obligations must be handled separately.

## Verification

After the acknowledgement changed both READMEs but before their consistency record was refreshed, `node scripts/verify-doc-i18n.mjs` failed with `README.i18n.yaml: translation pair hash mismatch`, proving that the governed-document gate detected the update. After bilingual review and final hash refresh, the same command reported `Verified 3 bilingual document pair(s).`

Each README contains exactly one link to `https://github.com/deepseek-ai/deepseek-harness`. Markdown diagnostics reported no errors for either README, and `git diff --check` reported no whitespace errors. No downstream template content changed as part of this acknowledgement, and no example project, runtime code, CI configuration, or license file changed. Separate human implementation review accepted the result.

## Consequences

Readers can now identify DeepSeek Harness as a methodological inspiration while seeing in the same paragraph that this workflow is independently adapted and not affiliated with or endorsed by DeepSeek. The acknowledgement remains separate from the direct provenance marker copied by downstream projects.

The acknowledgement could still be misinterpreted if quoted without its independence sentence, so both ideas remain in one paragraph. This decision covers methodological inspiration only; it does not substitute for license compliance if copied or modified upstream material is later found.