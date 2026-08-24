# 示例项目

[English](README.md) | 简体中文

本目录提供两个可以独立安装、构建和测试的 Agent Note 工作流示例，适合作为创建新项目时的结构参考。

本索引是受管双语文档。必须在同一变更中更新[英文对应文档](README.md)，刷新 `README.i18n.yaml` 后，从本目录运行 `node ../scripts/verify-doc-i18n.mjs`。

## agent-workflow-demo

[agent-workflow-demo](agent-workflow-demo/) 是一个待办事项 CLI，演示较完整的需求演进过程，包括：

- feature、bug-fix 和 simplification 等不同类别的 Agent Note；
- proposed、implemented、rejected 和 archived 生命周期；
- 中英文同等权威文档及 Git blob hash 一致性门禁；
- 持久化格式迁移、功能撤回和规则取代；
- 聚焦测试、完整检查和人工实施验收。

运行完整检查：

```powershell
cd agent-workflow-demo
npm install
npm run check
```

## text-stats-workflow-demo

[text-stats-workflow-demo](text-stats-workflow-demo/) 是一个文本统计 CLI，演示从需求澄清、提案修改到实施验收的 feature 全流程，包括：

- 单文件行数、词数和 Unicode 字符数统计；
- 按多个文件后缀递归统计目录行数；
- 默认值、CLI 参数、错误兼容性和符号链接等边界决策；
- 分层实现后的聚焦验证和真实子进程测试；
- Agent Note 从 proposed 到 implemented 的三件套迁移。

CLI 的具体使用方法见 [项目 README](text-stats-workflow-demo/README.md)。该示例目前只提供这一份项目专用 README。

运行完整检查：

```powershell
cd text-stats-workflow-demo
npm install
npm run check
```

两个示例均要求 Node.js 22 或更高版本。`node_modules` 和 `dist` 是本地依赖与构建产物，不属于参考源码。