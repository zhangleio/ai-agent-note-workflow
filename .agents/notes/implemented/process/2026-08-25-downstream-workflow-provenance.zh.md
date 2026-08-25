# Agent Note：下游工作流来源声明

Status: implemented

[English](2026-08-25-downstream-workflow-provenance.md) | 中文

## 问题

采用本仓库可复用 `AGENTS.md` 基线的项目原本没有简短信息说明工作流来源。显眼品牌、运行时输出、网络检查、遥测或自动更新提示会干扰下游项目，并使其与本仓库耦合。

## 决策

两份根 README 的可复用 `AGENTS.md` 基线包含一条静态来源声明：

```markdown
Agent Note workflow adapted from [ai-agent-note-workflow](https://github.com/zhangleio/ai-agent-note-workflow); local project rules take precedence.
```

该句只出现在复制到下游项目根 `AGENTS.md` 的模板中，不出现在本仓库自己的根 `AGENTS.md` 中，因为本仓库是来源方而不是采用方。

新项目接入说明明确该标记仅提供信息。它不引入运行时依赖、遥测、网络请求、自动更新检查、CI 要求、控制台输出、README 徽章，也不要求跟踪上游变化。下游项目可以独立演进，并以本地规则为准。

## 考虑过的替代方案

**把该句加入本仓库根 `AGENTS.md`。** 这会错误地把来源仓库描述成采用自它自己。

**在每个下游项目 README 中增加徽章或归属章节。** 这种方式更显眼，但会干扰面向产品的文档，对于工作流来源而言过重。

**创建元数据文件。** 独立文件更不容易被 Agent 或开发者读取，还会增加一个需要维护的产物。

**增加自动上游更新检查。** 这会产生网络与维护耦合，不符合避免骚扰下游项目的要求。

## 验证

两份 README 修改后、刷新一致性记录前，`node scripts/verify-doc-i18n.mjs` 以 `README.i18n.yaml: translation pair hash mismatch` 失败，证明受管文档门禁检测到了更新。完成双语评审并刷新 hash 后，同一命令报告 `Verified 3 bilingual document pair(s).`。

两份 README 的 Markdown 诊断均未报告错误，`git diff --check` 未报告空白错误。Git 状态显示只有 README 双语对、`README.i18n.yaml` 和本 Note 三件套发生变化。来源仓库根 `AGENTS.md`、示例项目、运行时代码、CI 配置、遥测、网络行为、徽章和更新行为均保持不变。独立人工实施评审接受了结果。

## 后果

复制文档基线的新项目会带有简洁、可发现的工作流来源链接，同时保持运行上的独立性。本地规则明确优先，因此该标记不会限制项目专用演进。

来源 URL 未来可能变化，使复制到下游的标记过期。GitHub 仓库重定向可以降低该风险，而且即使过期，该标记仍然只是信息说明。采用者可以删除或修改这句话；归属不受机械强制，因为低干扰和下游自主性是有意选择的优先事项。