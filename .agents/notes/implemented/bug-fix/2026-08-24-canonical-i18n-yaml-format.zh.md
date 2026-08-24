# Agent Note：规范 i18n YAML 格式

Status: implemented

[English](2026-08-24-canonical-i18n-yaml-format.md) | 中文

## 问题

仓库曾把 `.i18n.yaml` 一致性记录写成带大括号、带引号键和逗号的 JSON 对象。JSON 是 YAML 1.2 的子集，但这种表示不符合本工作流要演示的 DeepSeek Harness 约定：先写解释性 YAML 注释，再写精确的 `<basename>.md: <40-hex>` 映射。校验器使用 `JSON.parse` 强化了错误表示，根指南也明确推荐 JSON 语法。

根仓库和两个示例中共有十三份有效或未冻结记录需要迁移。`agent-workflow-demo` 中一份 archived 记录由归档 manifest 冻结，继续保留原始字节。

## 决策

所有 active、proposed、implemented 和 rejected `.i18n.yaml` 记录使用规范 sidecar 格式：

```yaml
# Bilingual-pair consistency record: the git blob hash of each side as of the
# last confirmed-consistent state. Both languages carry equal authority.
example.md: 0123456789abcdef0123456789abcdef01234567
example.zh.md: 89abcdef0123456789abcdef0123456789abcdef
```

键是无引号的本地 Markdown 基名。值是小写 40 位十六进制 Git blob SHA-1。允许空行和以 `#` 开头的注释行；其他每行必须精确匹配 `<basename>.md: <40-hex>`。重复键、未知键、错误 hash、大括号、带引号键、逗号和嵌套 YAML 都被拒绝。

根文档校验器和两个示例 Agent Note 校验器使用零依赖的小型精确格式解析器，不再使用 `JSON.parse`。根校验器和文本统计校验器要求所有记录采用规范 YAML。待办示例校验器要求非 archived 记录采用规范 YAML，只在校验 archived 生命周期时接受冻结的 JSON 格式记录。归档 SHA-256 manifest 保持不变。

十三份既有未冻结记录均已转换为规范映射，并加入适合其所属项目的简洁解释注释和命令。本 implemented Note 增加第十四份规范记录。中英文根指南、根 Agent 指令和早期 implemented process Note 现在规定规范映射语法，不再规定兼容 JSON 的 YAML。同步评审后，已刷新受影响的一致性 hash。

## 考虑过的替代方案

**保留兼容 JSON 的 YAML。** 它可以按 YAML 1.2 解析，但这正是用户报告的缺陷，也没有演示目标 Harness 约定。

**增加通用 YAML 依赖。** 记录只使用注释和两个标量映射。严格的专用解析器更小、更确定，并且会拒绝不支持的 YAML 特性，而不是静默接受。

**重写 archived sidecar 和归档 manifest。** 这会让所有文件视觉统一，但违反仓库的冻结归档保证。历史字节比外观统一更重要。

**所有位置同时接受两种格式。** 这会永久保留错误的有效记录表示。旧格式兼容仅限一份冻结 archived 记录。

## 验证

根校验器切换为规范解析后，`node scripts/verify-doc-i18n.mjs` 以 `consistency record must use canonical YAML mappings` 拒绝原有 JSON 格式的 `README.i18n.yaml`。两个示例校验器切换后，各自的聚焦 Note 检查也以相同错误拒绝首份非 archived JSON 格式记录。这些修复前失败检查证明有效位置不再接受 JSON 对象语法。

迁移后，`node scripts/verify-doc-i18n.mjs` 报告 `Verified 3 bilingual document pair(s).`。完整 `npm --prefix examples/agent-workflow-demo run check` 门禁验证 7 对 Agent Note、成功构建并通过全部 18 项测试。完整 `npm --prefix examples/text-stats-workflow-demo run check` 门禁验证 2 对 Agent Note、成功构建并通过全部 25 项测试。

仓库级格式断言发现 15 份 sidecar：14 份规范记录和恰好 1 份冻结 archived 旧格式记录。待办示例门禁继续验证通过归档 manifest。Markdown 与脚本诊断未报告错误，`git diff --check` 未报告空白错误，独立人工实施评审接受了结果。

## 后果

有效一致性记录现在直观符合 Harness 约定，无需增加依赖即可确定性拒绝不支持的 YAML 形式。解析器刻意只支持注释和两个标量映射，因此未来增加元数据字段时需要新的决策与解析器变更。

待办校验器为冻结 archived JSON 记录保留一个范围严格的生命周期分支。该例外增加少量维护成本，但保留了更强的归档不可变保证，也不会允许有效记录继续使用旧语法。