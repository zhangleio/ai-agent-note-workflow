# Agent Note：MIT License

Status: implemented

[English](2026-08-24-mit-license.md) | 中文

## 问题

仓库原本没有根许可证文件，因此接收者没有获得使用、复制、修改、合并、发布、分发、再许可或销售仓库原创作品的明确授权。预期的开源条款需要写入托管平台和自动扫描工具能够识别的标准文件。

## 决策

根 `LICENSE` 包含标准 MIT License 文本，版权行为：

```text
Copyright (c) 2026 zhangleio
```

除非文件或目录声明其他条款，该许可证适用于本仓库的原创作品。它不会替换第三方声明，也不会重新许可 vendored 内容、依赖项或已经受其他许可证约束的材料。

按照选定范围，英文和中文 README 不增加 License 章节。GitHub 和常见许可证扫描工具可以直接识别根 `LICENSE`，从而把变更限制在所请求的法律文件内。源文件不增加 SPDX 头。

## 考虑过的替代方案

**保持无许可证。** 这会保留默认的完整版权限制，但无法提供预期的广泛复用与贡献权利。

**使用 Apache-2.0。** 它提供明确的专利授权和更多条件，但本次要求的是 MIT，本仓库决策不需要额外条款。

**在 README 中增加 License 章节。** 这会提高可见性，但选定范围是只添加规范根文件，避免无关的双语文档变更。

**为每个源文件添加 SPDX 头。** 这会产生大量机械改动，仓库级 MIT 授权不需要这种做法。

## 验证

聚焦内容检查在归一化 Windows 换行后确认了 `MIT License` 标题、精确的 `Copyright (c) 2026 zhangleio` 行、标准许可授予、声明保留条件、无担保声明和责任限制。Git 状态确认除本 Note 三件套外，`LICENSE` 是唯一实施文件；README、源文件头、第三方声明、vendored 文件和独立许可证均未改变。

`node scripts/verify-doc-i18n.mjs` 验证通过全部 3 组受管双语文档。`npm --prefix examples/agent-workflow-demo run check` 验证 7 对 Agent Note、成功构建并通过全部 18 项测试。`npm --prefix examples/text-stats-workflow-demo run check` 验证 2 对 Agent Note、成功构建并通过全部 25 项测试。`git diff --check` 未报告空白错误。独立人工实施评审接受了结果。

## 后果

接收者现在可以按照 MIT License 的权限和条件使用本仓库原创作品。副本或实质性部分必须保留版权与许可声明，作品按照标准 MIT 条款不附带任何担保。

已经按照 MIT License 授予接收者的副本权利通常无法撤回。根许可证不会覆盖第三方条款或单独声明的条款。由于选定范围不在 README 中增加章节，也不增加源文件头，许可证发现依赖规范根文件名以及托管平台或扫描工具支持。