# Agent Note：仓库文档 i18n 门禁

Status: implemented

[English](2026-08-24-repository-document-i18n-gate.md) | 中文

## 问题

仓库现在维护三组同等权威的英文和简体中文文档，但已实施流程刻意依靠人工评审而不使用内容 hash。后续编辑可能只更新一种语言，而所有文件和链接看起来仍然有效。只增加一致性记录而不执行检查，会产生可能静默过期的元数据，因此这些记录需要一个负责校验的命令。

本提案部分取代[仓库文档双语化](../../implemented/process/2026-08-24-bilingual-repository-documents.zh.md)中不设 hash 门禁的决策。该决策中的语言命名、完整 `AGENTS.md`、范围和同等权威规则继续有效。

## 决策

仓库在每组受管双语文档旁保留一个规范 YAML 一致性记录。[i18n YAML 规范格式](../bug-fix/2026-08-24-canonical-i18n-yaml-format.zh.md)修正了最初的 JSON 对象表示法，但不改变本门禁的职责与 hash 语义：

```text
README.i18n.yaml
AGENTS.i18n.yaml
examples/README.i18n.yaml
```

每份记录把两个本地 Markdown 基名映射到 CRLF 归一化为 LF 后的 Git blob SHA-1。刷新 hash 表示人工已经评审两份当前文档的语义等价性；不得用刷新 hash 掩盖未同步的翻译。

每个非注释行必须是不加引号的 `<basename>.md: <40位小写十六进制>` 映射。允许空行和 `#` 注释；拒绝 JSON 对象语法、带引号的键、重复键、未知键和格式错误的 hash。

零依赖 `scripts/verify-doc-i18n.mjs` 命令校验声明的三组文档。脚本检查两份文档和一致性记录均存在、记录 hash 与当前内容匹配、语言切换器互相对应、标题层级与 fenced code block 结构对应，以及正文相对链接可解析。链接解析排除 fenced 模板示例。

文档记录的命令是：

```powershell
node scripts/verify-doc-i18n.mjs
```

两份根 `AGENTS` 文档要求修改六份受管 Markdown 中任一文件时，必须更新对应语言、在人工评审后刷新记录并运行该命令。两份根 README 把普通文档门禁与 Agent Note 三件套门禁分别说明。

三份记录只管理根指南、根 Agent 指令和示例索引。示例项目专用文档和 Agent Note 继续遵循现有策略。

## 考虑过的替代方案

**只增加记录而不增加脚本。** 这种方式看起来标准化，却无法在日常工作中检测过期 hash。可执行门禁让记录具有实际作用。

**复用某个示例项目的 Agent Note 校验器。** 这些脚本负责生命周期专用章节、重复主题和归档 manifest。普通仓库文档需要更小的独立校验器，不应伪装成 Agent Note。

**使用 SHA-256 而不是 Git blob SHA-1。** Git blob SHA-1 已经是仓库当前双语一致性约定。SHA-256 继续仅用于冻结归档字节。

**为全部六份文件生成一份中央记录。** 把记录放在每对文档旁边，可以明确职责和刷新范围，也符合现有成对文档约定。

## 验证

第一次聚焦运行 `node scripts/verify-doc-i18n.mjs` 时，由于 `README.i18n.yaml` 不存在而失败，证明每份声明的记录都是必需项。创建三份记录后，该命令验证通过全部三组文档。

随后使用可逆 stale-hash 探针修改英文示例索引，但不更新中文对应文档或记录。同一命令以 `examples/README.i18n.yaml: translation pair hash mismatch` 失败。同步中文说明、评审两份文档并刷新双方 hash 后，该命令再次报告 `Verified 3 bilingual document pair(s).`。

两组根 README 和 AGENTS 均有对应的标题与 fenced block 结构，且无 Markdown 诊断。早期双语文档 Note 把本决策记录为部分取代，同时保留其语言命名、范围、完整 `AGENTS.md` 和同等权威规则。两组 process Note 均通过 Git blob hash 检查，`git diff --check` 未报告空白错误。人工实施验收接受了该门禁和记录。

## 后果

三组仓库文档现在会在对应文档或一致性记录缺失、评审后内容变化但未刷新 hash、语言切换器或文档结构分叉，以及正文相对链接损坏时确定性失败。记录采用与有效 Agent Note 相同的 LF 归一化 Git blob SHA-1 约定，同时与生命周期校验保持独立。

hash 只能证明内容在评审后没有变化，不能证明翻译准确。校验器增加了维护面，如果 Markdown 结构约定变化，脚本也必须演进。结构比较刻意只检查标题和 fenced block，而不比较段落或列表数量，把语义等价性交给人工评审。每次修改受管文档时，贡献者都必须更新两份文档和一份记录。