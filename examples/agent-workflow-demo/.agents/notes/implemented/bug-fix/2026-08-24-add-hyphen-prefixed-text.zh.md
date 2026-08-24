# Agent Note：保留连字符开头的 add 文本

Status: implemented

[English](2026-08-24-add-hyphen-prefixed-text.md) | 中文

## 问题

已实施的 [JSON 待办 CLI](../feature/2026-08-24-json-todo-cli.md) 定义了 `add <text>`，但没有为 `add` 保留选项名称。命令解析器仍然在分派命令前用严格全局选项解析整个调用。因此，`add --urgent task` 会以 `ERR_PARSE_ARGS_UNKNOWN_OPTION` 失败，而不是保存字面文本 `--urgent task`。

这是既有文本约定中的缺陷，不是新的命令能力。它还与 `archive` 选项产生意外冲突：`add --completed review` 会被归档选项所有权规则拒绝，尽管 `add` 后的每个 token 都应属于待办文本。

## 决策

CLI 在执行命令专属解析前，先将第一个 token 识别为命令。对于 `add`，它连接所有剩余 token、去除结果两端空白，并且不把任何后续 token 解释为选项。`add --urgent task` 保存 `--urgent task`，而 `add --completed review` 保存 `--completed review`。

所有非 `add` 命令继续使用严格 `parseArgs` 处理。`--completed` 和 `--yes` 在这些路径中仍只归批量归档模式所有，未知选项仍然报错，archive、restore、list 和 done 的行为都不改变。

回归测试在修改实现前加入。它复现了 `ERR_PARSE_ARGS_UNKNOWN_OPTION`：十七项既有测试通过，只有新增用例失败。将既有 add 路径移到严格解析之前，使同一测试通过且不改变存储行为。

## 考虑过的替代方案

**要求 `add -- --urgent task`。** Node.js 的选项终止符符合惯例，但已实施的命令约定没有记录这一要求，而且 `add` 不拥有选项。要求调用方转义普通待办文本会保留这个意外的解析限制。

**全局设置 `strict: false`。** 这样可以允许该文本，但也会削弱所有其他命令的拼写错误检测和选项所有权。

**增加 `--text` 选项。** 这会引入第二种输入形式和转义问题，却没有产品收益；位置形式的 `<text>` 约定已经足够。

**手工解析每个命令。** 只有 `add` 需要不透明的尾部文本。对带选项和固定位置参数的命令保留 `parseArgs`，可以在必要位置继续使用标准严格验证。

## 验证

修复前，聚焦的构建与测试运行通过十七项测试，新增的 `preserves hyphen-prefixed text after add` 回归因 `ERR_PARSE_ARGS_UNKNOWN_OPTION` 失败。修复后，`npm run check` 验证六篇 Agent Note、检查归档 Note hash、编译严格 TypeScript 程序，并通过全部十八项测试。

回归测试会持久化并准确列出 `--urgent task` 和 `--completed review`。现有测试继续证明空 add 被拒绝、无效参数保持严格、归档选项所有权、两种批量选项顺序以及存储行为不变。

## 后果

待办文本可以连字符开头或与选项名相同，无需使用 `--` 转义。所有非 add 命令仍保留严格解析和拼写错误检测。

如果未来要为 `add` 增加选项，就必须明确修改约定，因为每个尾部 token 目前都是文本。命令识别现在有一个小型的解析前分支，而去除两端空白的行为与之前一致。