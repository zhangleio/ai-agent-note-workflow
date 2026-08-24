# AI Agent 开发工作流

这是一套适合新项目复用的 **Agent Note 驱动开发工作流**。它通过可评审的决策记录，把需求讨论、方案选择、代码实施、测试验证、需求否决、规则取代和历史归档连接起来。

这套工作流解决的核心问题不是“让 Agent 多写文档”，而是确保以下事实可以被长期追溯：

- 为什么要做这项变更；
- 哪些方案被考虑过，为什么没有采用；
- 谁在实施前批准了需求；
- 哪些验证证据证明实现符合决策；
- 当前项目到底遵循哪份规则；
- 旧规则为什么退出，以及以后能否重新提出；
- 中英文决策文档是否保持一致。

完整可运行的参考项目见 [examples](examples/README.md)。其中包含待办事项 CLI 的多生命周期演进示例，以及文本统计 CLI 从需求澄清到实施验收的 feature 示例。

## 1. 核心原则

### 1.1 决策先于非平凡实现

功能、行为、架构、存储格式、协议、流程或测试策略发生非平凡变化时，先建立 Agent Note，再修改代码。

小型机械修改可以豁免，例如拼写修复、无语义格式调整或明确的局部重命名。只要变更需要讨论取舍，就不再属于机械修改。

### 1.2 人类参与关键决策

Agent 可以调查、提出方案、实施和验证，但以下节点由项目负责人决定：

1. 需求语义与边界；
2. 是否批准 proposed Note；
3. 验证通过后是否接受实施；
4. 是否拒绝、取代或归档一项决策。

### 1.3 代码通过不等于决策交付

代码写完或测试通过后，Note 仍保持 `proposed`，直到负责人完成实施验收。验收通过后，才能将完整 Note 组迁移到 `implemented`。

### 1.4 不改写决策历史

需求变化时，不要直接把旧 Note 改成新需求，好像旧规则从未存在。使用新的 proposed Note 扩展、部分取代或完整取代旧决策。

### 1.5 机械门禁优于口头约定

生命周期、必需章节、双语配对、重复主题和归档冻结都应由脚本检查。只写在 README 中、但没有门禁执行的规则容易逐渐失效。

## 2. 推荐目录

```text
.agents/
└── notes/
		├── proposed/
		│   ├── feature/
		│   ├── bug-fix/
		│   ├── simplification/
		│   ├── architecture/
		│   ├── process/
		│   └── testing/
		├── implemented/
		│   └── ...同样的类别目录
		├── rejected/
		│   └── ...同样的类别目录
		└── archived/
				├── manifest.json
				└── ...同样的类别目录
```

每份 Note 的路径格式为：

```text
{lifecycle}/{class}/yyyy-mm-dd-topic.md
```

日期表示主题第一次被提出的日期。生命周期迁移时文件名中的日期不变。

## 3. 生命周期

### `proposed`

表示正在讨论、尚未成为当前规则的提案。

- 可以描述计划、迁移步骤和预期结果；
- 不应被代码或其他文档当作既定事实；
- 获得需求批准后才进入实施；
- 实施验收通过后迁移到 `implemented`；
- 被否决后迁移到 `rejected`。

### `implemented`

表示已经交付、当前有效的决策。

- 当前代码和后续开发应遵守其中规则；
- 使用现在时描述实际行为；
- 必须包含真实验证证据；
- 需求变化时，由新 Note 扩展或取代；
- 完整退出当前指导范围后，可以迁移到 `archived`。

### `rejected`

表示讨论过但没有成为有效规则的提案。

- 状态行应记录简短的否决原因；
- 不应实现该方案；
- 如果条件变化，不要把旧 Note 原地改回 proposed；
- 应创建新 proposed Note，引用旧否决记录并说明前置条件如何变化。

### `archived`

表示历史上实施过，但已经不再指导当前项目的规则。

- 保持 `Status: implemented`；
- 增加 `Archived: YYYY-MM-DD`；
- 只用于历史追溯，不作为当前实现依据；
- 归档后永久冻结，不编辑、不翻译、不重新格式化；
- 如需重新采用旧想法，应创建新 proposed Note，而不是重新激活旧文件。

最简记忆方式：

```text
proposed    = 尚未决定
implemented = 当前有效
rejected    = 从未生效
archived    = 曾经有效
```

## 4. 决策类别

| 类别 | 使用场景 |
|---|---|
| `feature` | 增加面向用户、模型或调用方的新能力 |
| `bug-fix` | 修正违反既有约定的缺陷，或填补事故复盘发现的缺口 |
| `simplification` | 在不增加能力的前提下移除代码、状态、行为或对外范围 |
| `architecture` | 交付源码的结构性决策，例如模块关系、数据模型和运行时职责 |
| `process` | 代码周边的工具、门禁、依赖管理、发布或工作流 |
| `testing` | 测试基础设施、覆盖策略、快照或端到端验证方式 |

### Feature 与 Bug-fix 的区别

判断问题是：**既有有效决策是否已经承诺该行为？**

- 没有承诺，需要新增能力：`feature`；
- 已经承诺，但实现不符合：`bug-fix`。

Bug-fix 推荐先添加一个必然失败的回归测试，记录修复前的失败证据，再实施最小修复并让同一个测试转为通过。

### Simplification 与 Architecture 的区别

- 改变系统结构并建立新的长期职责模型：`architecture`；
- 删除重复机制、未使用范围或多余状态，且不增加能力：`simplification`。

Simplification 必须证明外部能力没有意外变化，通常依靠既有测试以及针对被删除路径的验证。

## 5. 双语三文件组

每份 Agent Note 由同目录三件套组成：

```text
topic.md
topic.zh.md
topic.i18n.yaml
```

### 同等权威

英文和简体中文具有同等权威。任一语言都可以先起草，但另一侧必须在同一变更中同步，不能把中文定义为可选翻译。

英文文件在状态块后添加：

```markdown
English | [中文](topic.zh.md)
```

中文文件添加：

```markdown
[English](topic.md) | 中文
```

双方应保持：

- 生命周期状态相同；
- 标题层级和顺序相同；
- 事实、约束、备选方案和后果等价；
- 代码块内容一致；
- 除语言切换链接外，链接目标一致；
- 列表和表格结构一致。

### 一致性记录

`.i18n.yaml` 保存双方最后一次人工确认语义一致时的 Git blob hash。建议使用 JSON 语法，因为 JSON 是 YAML 1.2 的子集，也便于零依赖校验：

```json
{
	"topic.md": "<english-git-blob-hash>",
	"topic.zh.md": "<chinese-git-blob-hash>"
}
```

计算方式：

```powershell
git hash-object ".agents/notes/proposed/feature/topic.md"
git hash-object ".agents/notes/proposed/feature/topic.zh.md"
```

当修改任一语言时：

1. 同步修改另一侧；
2. 人工确认语义仍然一致；
3. 重新计算双方 Git blob hash；
4. 更新 `.i18n.yaml`；
5. 运行 Note 门禁。

绿色门禁只能证明“当前内容与上次确认内容一致”，不能证明翻译质量。语义准确性仍由评审负责。

## 6. 标准开发流程

### 阶段 A：需求澄清

1. 找到当前控制该行为的代码与 implemented Note；
2. 明确用户可观察行为、输入、输出和失败语义；
3. 明确数据是否写入、失败时是否保持字节不变；
4. 讨论兼容性、恢复能力、权限、安全和并发限制；
5. 由负责人选择方案。

### 阶段 B：建立 proposed Note

同时创建三件套，正文至少包含：

```markdown
## Problem
## Proposal
## Alternatives considered
## Acceptance criteria
## Risks
```

中文对侧使用等价章节：

```markdown
## 问题
## 提案
## 考虑过的替代方案
## 验收标准
## 风险
```

提案中应记录真实考虑过的方案，而不是为了填章节虚构明显不合理的选项。

### 阶段 C：需求评审

负责人选择：

- 批准实施；
- 要求修改提案；
- 否决提案。

未批准前不修改业务代码。探索性原型如果已经存在，也不能因此跳过评审。

### 阶段 D：实施与聚焦验证

1. 做最小可验证改动；
2. 第一处实质编辑后立即运行最聚焦的验证；
3. bug-fix 先建立失败回归测试；
4. 验证失败操作不产生写入或部分状态；
5. 修复同一局部问题并重复相同验证；
6. 最后运行项目完整门禁。

### 阶段 E：实施验收

向负责人报告：

- 实际实现了什么；
- 哪些测试在修复前失败；
- 哪些测试在修复后通过；
- 是否存在残余限制或兼容性影响；
- Note、构建、类型检查和测试的实际结果。

由负责人选择接受、要求修改或撤回。

### 阶段 F：迁移到 implemented

验收通过后，同时移动三件套，并同步修改正文：

```text
Proposal             -> Decision
Acceptance criteria  -> Verification
Risks                -> Consequences
```

将计划语气改成当前事实，写入真实验证结果，然后重新计算两种语言的 Git blob hash。

迁移后检查旧 lifecycle 是否残留同名文件。某些文件移动工具可能复制目标但保留源文件，因此门禁必须拒绝跨生命周期同名主题。

## 7. 需求变化流程

implemented 中的需求发生变化时，先分类变化规模。

### 纯文档修正

拼写、链接或不改变语义的澄清，可以同步修改中英文和一致性记录，无需新决策。

### 兼容性扩展

旧规则继续有效，只增加独立能力：创建新的 feature Note。旧 Note 和新 Note 同时保持 implemented。

### 部分取代

新 Note 只改变旧 Note 的部分规则：

- 新 Note 明确指出取代哪一条规则；
- 旧 Note 保持 implemented；
- 旧 Note 添加部分 superseded 链接；
- 仍有效的其他规则继续由旧 Note 持有。

### 完整取代

新决策接管旧决策全部职责，实施并验收后：

1. 新 Note 进入 implemented；
2. 修复所有当前权威链接；
3. 旧 Note 三件套进入 archived；
4. 更新归档 manifest；
5. 再次运行完整门禁。

在新方案真正实施前，不要提前归档旧 Note，否则会产生“旧规则退出、新规则尚未交付”的权威空窗。

## 8. Rejected 方案重新提出

旧 rejected Note 永远保留当时的否决结论。如果后来前置条件改变：

1. 阅读旧 Note 的问题、替代方案和否决原因；
2. 创建新的 proposed Note；
3. 链接旧 rejected Note；
4. 明确哪些前置条件已经变化；
5. 设计符合当前架构的新语义；
6. 重新完成批准、实施和验收。

可以重新使用旧想法，但不能直接复用旧决策状态。

## 9. 归档流程

只有 implemented Note 可以归档。归档前确认：

- 核心规则已被新的 implemented Note 完整接管；
- 当前代码和测试不再依赖旧行为；
- 所有入站链接已更新；
- 三文件组完整且配对一致。

归档时：

1. 英文和中文增加相同的 `Archived: YYYY-MM-DD`；
2. 更新双方 Git blob hash；
3. 三个文件一起移到 `archived/{class}/`；
4. 为三个文件分别计算原始 SHA-256；
5. 将三条摘要写入 `archived/manifest.json`；
6. 运行归档冻结门禁。

示例 manifest：

```json
{
	"feature/topic.i18n.yaml": "<sha256>",
	"feature/topic.md": "<sha256>",
	"feature/topic.zh.md": "<sha256>"
}
```

归档后不要编辑。如果需要重新采用旧能力，创建新 proposed Note，并引用归档记录作为历史输入。

## 10. 推荐门禁

项目至少应提供一个统一检查命令，例如：

```json
{
	"scripts": {
		"verify:notes": "node scripts/verify-agent-notes.mjs",
		"check": "npm run verify:notes && npm run build && npm test"
	}
}
```

Note 校验器至少检查：

- 生命周期和类别属于封闭集合；
- 每个英文 Note 都有中文与一致性记录；
- 不存在孤立 `.zh.md` 或 `.i18n.yaml`；
- 中英文状态匹配所在生命周期；
- 双方包含对应的必需章节；
- 双向语言切换链接存在；
- Git blob hash 匹配一致性记录；
- 标题、代码块和链接结构一致；
- 同一主题不能跨生命周期重复；
- archived 三件套与 manifest 的 SHA-256 一致；
- manifest 不包含已不存在文件的条目。

推荐在 CI 和本地提交前运行统一 `check`。门禁失败时修复实际不一致，不要直接刷新 hash 来掩盖未同步翻译。

## 11. 可复制的 AGENTS.md 基线

新项目可以从以下规则开始，再按技术栈补充构建和测试命令：

```markdown
# AGENTS.md

This repository uses an Agent Note driven development workflow.

- Record every non-trivial behavioral, architectural, process, or testing decision in `.agents/notes`.
- Maintain each Agent Note as an equal-authority English `.md`, Simplified Chinese `.zh.md`, and `.i18n.yaml` Git blob hash record.
- Start undecided work in `proposed/`; do not change product code before proposal approval.
- Move a Note to `implemented/` only after implementation, focused checks, complete checks, and human acceptance.
- Move all three pair files together across lifecycles.
- Never rewrite an old Note into a different decision; create a new Note and link supersession explicitly.
- Keep rejected decisions as history when their rationale prevents a likely mistake.
- Archived triplets are frozen and must match `.agents/notes/archived/manifest.json`.
- Record real alternatives and concrete verification evidence.
- Run the project check command before implementation review and after every lifecycle migration.
```

## 12. Proposed Note 模板

英文：

```markdown
# Agent Note: <title>

Status: proposed

English | [中文](yyyy-mm-dd-topic.zh.md)

## Problem

<Describe the problem independently of the solution.>

## Proposal

<Describe the proposed behavior, ownership, failure semantics, and migration.>

## Alternatives considered

**<Alternative>.** <Why it was not selected.>

## Acceptance criteria

- <Observable completion condition.>

## Risks

<Tradeoffs, compatibility impact, and intentional omissions.>
```

中文：

```markdown
# Agent Note：<标题>

Status: proposed

[English](yyyy-mm-dd-topic.md) | 中文

## 问题

<独立于解决方案描述问题。>

## 提案

<描述拟议行为、职责、失败语义和迁移。>

## 考虑过的替代方案

**<替代方案>。** <未选择的原因。>

## 验收标准

- <可观察的完成条件。>

## 风险

<取舍、兼容性影响和有意不做的范围。>
```

## 13. Implemented Note 模板

```markdown
# Agent Note: <title>

Status: implemented

English | [中文](yyyy-mm-dd-topic.zh.md)

## Problem

<Problem that motivated the decision.>

## Decision

<Current implemented behavior and ownership.>

## Alternatives considered

**<Alternative>.** <Why it was not selected.>

## Verification

<Commands run, failure-before evidence where relevant, and passing results.>

## Consequences

<Benefits, costs, remaining limits, and compatibility effects.>
```

中文文件使用 `问题 / 决策 / 考虑过的替代方案 / 验证 / 后果` 的镜像章节。

## 14. 新项目接入清单

1. 创建 `.agents/notes/{proposed,implemented,rejected,archived}`；
2. 在每个生命周期下创建六种类别目录；
3. 创建 `archived/manifest.json`，初始内容为 `{}`；
4. 将本页的 `AGENTS.md` 基线加入项目；
5. 添加 Note 配对与归档校验脚本；
6. 将 `verify:notes` 接入项目统一检查命令；
7. 用一个小型真实需求走完 proposed 到 implemented；
8. 用一个真实缺陷演示 bug-fix 的红绿测试；
9. 在出现完整取代时再演示 archived，不为展示目录而人为归档仍有价值的决策；
10. 让项目负责人实际参与提案批准和实施验收。

## 15. 最终判断规则

遇到新工作时，可以按以下顺序判断：

```text
是否改变行为、结构、流程或测试策略？
	否 -> 机械修改，可以不写 Note
	是 -> 是否已有 implemented Note 承诺该行为？
				 是，但实现不符合 -> bug-fix
				 否，需要增加能力 -> feature
				 只删除机制且不增加能力 -> simplification
				 改变源码结构职责 -> architecture
				 改变开发工具或工作流 -> process
				 改变测试基础设施或策略 -> testing

决策是否已经批准并交付？
	否 -> proposed
	是 -> implemented
	被否决 -> rejected
	曾交付但不再指导当前项目 -> archived
```

这套流程的目标是让 Agent 提高实现速度的同时，不绕过人的产品判断，也不牺牲项目决策的可追溯性。
