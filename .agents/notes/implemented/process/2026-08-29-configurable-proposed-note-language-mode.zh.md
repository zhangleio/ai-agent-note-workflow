# Agent Note：可配置的 proposed Note 语言模式

Status: implemented
Date: 2026-08-29

[English](2026-08-29-configurable-proposed-note-language-mode.md) | 中文

## 问题

可复用工作流原本要求每份 proposed Agent Note 从一开始就同时维护等权英文文档、简体中文文档和一致性记录。一个下游项目证明，在活跃讨论期间只维护中文草稿可以显著减少翻译与 hash 更新，而英语优先的项目也有对称需求。项目必须重写自身 Agent 指令并派生校验器才能获得其中任一行为，因此可复用工作流没有提供一个明确且可机械执行的选择。

## 决策

工作流使用版本化的项目配置 `.agents/agent-note-workflow.json`，其中 `proposedMode` 可取 `bilingual`、`zh-only` 或 `en-only`。新项目接入指南要求显式选择。为兼容现有采用者，缺少配置时仍等价于 `bilingual`。

模式只影响 `proposed/`。`bilingual` 要求英文 `.md`、中文 `.zh.md` 和记录真实 Git blob hash 的 `.i18n.yaml`；`zh-only` 只要求中文 `.zh.md`；`en-only` 只要求英文 `.md`。单语提案不包含语言切换链接、占位翻译、sidecar 或 `pending` hash。

Note 离开 `proposed/` 前成为带真实 hash 的等权双语三件套。因此 implemented、rejected 和 archived Note 无论采用何种起草模式都保持同一种格式。校验器读取项目配置，拒绝混合或多余的 proposed 文件，并在 `proposed/` 之外执行锁定三件套校验。有活跃提案时修改模式，必须在同一变更中迁移全部活跃提案。

工作流仓库提供一份规范、可复制的校验器。两个可运行示例各自保留完全相同的项目本地副本，并显式选择 `bilingual`，从而保留现有生命周期历史。可复用 `AGENTS.md` 基线把配置指向为事实源，而不是在说明文字中嵌入已选值。

## 考虑过的替代方案

**发布三套独立 AGENTS.md 和校验器模板。** 修复和生命周期变更必须在三份实现间保持同步，而且项目可能选择一种文字模板却复制另一种校验器。

**只在 AGENTS.md 中保存所选模式。** 校验器需要解析不稳定的自然语言或在代码中重复该值，导致策略与执行规则发生漂移。

**允许每份 proposed Note 自选语言模式。** 文件发现会有歧义，评审者也无法从目录推断项目策略。单一项目级模式让契约保持可预测。

**允许未完成的双语提案使用 `pending` hash。** 这会产生第四种中间状态并削弱一致性记录的含义。单语模式已经能够在不使用占位元数据的前提下消除翻译更新成本。

## 验证

`node scripts/verify-doc-i18n.mjs` 验证通过全部三组受管双语文档。`node scripts/verify-agent-notes.mjs` 在显式 `bilingual` 模式下验证通过仓库的七组锁定 Note。

`node --test scripts/verify-agent-notes.test.mjs` 的 9 项测试全部通过，覆盖显式双语模式、缺少配置时的兼容默认值、仅中文和仅英文提案、非法混合状态、离开 proposed 后的锁定三件套要求，以及非法配置值。

使用 `npm ci` 安装各示例的锁定依赖后，`npm --prefix examples/agent-workflow-demo run check` 通过 Note 门禁、TypeScript 构建和全部 18 项测试；`npm --prefix examples/text-stats-workflow-demo run check` 通过 Note 门禁、TypeScript 构建和全部 25 项测试。规范校验器和两个示例本地副本的 SHA-256 完全相同。`git diff --check` 未报告空白错误。

项目负责人在实施前批准提案，并于 2026-08-29 接受通过验证的实施结果。

## 后果

新项目可以一次选择 proposed 起草语言，并由工具和 Agent 指令共同执行同一选择。中文优先和英文优先团队在活跃讨论期间避免翻译与 hash 更新成本，双语团队继续获得实时等权锁定。所有项目都在决策离开 `proposed/` 前收敛为相同的双语真实 hash 表示。

缺少配置的现有项目继续按双语方式校验。复制过旧版校验器的项目必须同时采用配置和兼容校验器；只修改配置不会增加模式支持。有活跃提案时修改项目模式，需要原子迁移这些提案。
