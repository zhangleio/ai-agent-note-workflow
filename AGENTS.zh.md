# AGENTS.md

[English](AGENTS.md) | 简体中文

本仓库维护一套可复用的 Agent Note 驱动开发工作流，以及位于 `examples/` 下的可运行示例项目。

## 规则范围

- 本文件适用于整个仓库。
- 子目录中的 `AGENTS.md` 可以增加或细化规则；修改该目录时应同时遵守根规则和距离目标文件最近的规则。
- [README.zh.md](README.zh.md) 是工作流语义、生命周期和文档格式的主要说明；本文件将其中要求转换为执行约束。

## 修改原则

- 保持根文档通用，不把某个示例项目的实现细节写成所有项目都必须遵守的规则。
- 修改现有示例时遵循其技术栈、目录结构和局部 `AGENTS.md`，不要顺手重构无关代码。
- 新增示例时，将其放在 `examples/<project-name>/`，提供独立的依赖清单、构建与测试命令、项目 README 和局部 `AGENTS.md`。
- 不提交依赖目录、构建产物、临时文件、凭据或本地环境配置。
- 不修改与当前任务无关的用户改动，不自动创建 Git 提交或分支。

## Agent Note 工作流

非平凡的产品行为、架构、存储格式、协议、流程或测试策略变更必须遵循以下流程：

1. 在 `.agents/notes/proposed/<class>/` 创建英文 `.md`、简体中文 `.zh.md` 和 `.i18n.yaml` 一致性记录三件套。
2. 在提案中记录问题、方案、真实替代方案、验收标准和风险。
3. 获得人工提案批准前，不修改产品代码。
4. 批准后分层实施，每次实质编辑后运行能够推翻当前假设的最小聚焦检查。
5. 完整检查通过后请求独立的人工实施验收；测试通过本身不等于验收完成。
6. 只有人工接受实施后，才将三件套一起迁移到 `implemented/<class>/`，并把计划语态改写为实际决策、验证和后果。
7. 拒绝的提案迁移到 `rejected/<class>/`；被取代且需要冻结的历史迁移到 `archived/<class>/`。

允许不创建 Agent Note 的机械修改包括拼写修复、链接修复、无语义格式调整，以及明确要求直接完成的仓库初始化文件。只要变更需要行为或取舍决策，就不属于机械修改。

## Note 一致性

- 英文和中文 Note 同等权威，标题层级、代码块和链接结构必须对应。
- `.i18n.yaml` 记录两份文档经过 LF 归一化后的 Git blob SHA-1。
- 有效 `.i18n.yaml` 文件必须使用不加引号的 `<basename>.md: <40位小写十六进制>` 映射，除此之外只允许空行和 `#` 注释；JSON 对象语法无效。
- 生命周期迁移必须同时移动英文、中文和一致性记录，不得留下重复主题。
- 不得把旧 Note 改写成不同决策；需求变化时创建新的 proposed Note，并明确取代关系。
- `archived` 三件套已经冻结，除非执行明确的归档流程，否则不得修改。
- Note 类别使用 `feature`、`bug-fix`、`simplification`、`architecture`、`process` 或 `testing`。

## 文档要求

- 根 [README.zh.md](README.zh.md) 说明可复用工作流；[examples/README.zh.md](examples/README.zh.md) 维护示例项目索引。
- `README.md` / `README.zh.md`、`AGENTS.md` / `AGENTS.zh.md` 和 `examples/README.md` / `examples/README.zh.md` 是受管双语文档对。必须同步更新两种语言、评审语义等价性，并刷新相邻的 `.i18n.yaml` 记录。
- 行为变化必须同步更新受影响的 README、命令示例和 Agent Note。
- 文档描述当前可验证事实，不把 proposed Note 当作已经实现的行为。
- 文件路径和命令必须可从其文档声明的工作目录直接使用。

## 验证

- 修改受管仓库文档后，运行 `node scripts/verify-doc-i18n.mjs`。
- 修改示例项目后，在该项目目录运行其 `npm run check` 或局部 `AGENTS.md` 指定的等价完整门禁。
- 修改根 Markdown 文档后检查 Markdown 诊断和相对链接。
- 生命周期迁移后再次运行 Note 门禁，并确认旧生命周期中没有残留副本。
- 报告实际执行的检查及结果；无法运行的检查必须说明原因。