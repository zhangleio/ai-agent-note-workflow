# Text Stats Workflow Demo

一个使用 TypeScript 和 Node.js 实现的本地文本统计 CLI。它可以统计单个 UTF-8 文件的行数、词数和字符数，也可以按照文件后缀统计目录树中的代码行数。

项目不上传文件，也不依赖外部服务。

## 环境要求

- Node.js 22 或更高版本
- npm

## 安装和构建

在项目目录中执行：

```powershell
npm install
npm run build
```

构建后的 CLI 入口是 `dist/src/index.js`。

## 统计单个文件

```powershell
node dist/src/index.js <文件路径>
```

例如：

```powershell
node dist/src/index.js .\src\index.ts
```

输出固定为三行：

```text
Lines: 18
Words: 42
Characters: 356
```

- `Lines`：逻辑行数。空文件为 0 行；末尾换行符不会增加额外空行。
- `Words`：由 Unicode 空白字符分隔的非空文本片段数量，不进行语言学分词。
- `Characters`：Unicode code point 数量，因此一个常见 emoji 计为一个字符。

单文件模式不能使用 `--ext` 或 `--no-recursive`，这些选项只适用于目录。

## 统计目录

```powershell
node dist/src/index.js <目录路径>
```

目录模式默认递归扫描全部子目录，并统计以下文件后缀：

```text
.ts .tsx .js .jsx .mjs .cjs .json .md .css .html
```

例如：

```powershell
node dist/src/index.js .\src
```

输出按相对于指定目录的文件路径排序，最后显示文件数和总行数：

```text
cli-options.ts: 58
cli.ts: 43
directory-stats.ts: 61
Files: 3
Lines: 162
```

没有匹配文件时输出：

```text
Files: 0
Lines: 0
```

### 指定多个文件后缀

为每种后缀重复使用 `--ext`：

```powershell
node dist/src/index.js . --ext .ts --ext .js --ext .md
```

只要出现了 `--ext`，显式指定的后缀集合就会整体替换默认后缀，而不是追加到默认值。后缀必须以 `.` 开头，匹配时不区分大小写，重复值只采用一次。

### 只扫描当前目录

使用 `--no-recursive` 禁止进入子目录：

```powershell
node dist/src/index.js . --no-recursive
```

它可以和多个 `--ext` 一起使用：

```powershell
node dist/src/index.js . --ext .ts --ext .tsx --no-recursive
```

## 参数摘要

```text
text-stats <path> [--ext <extension>]... [--no-recursive]
```

| 参数 | 说明 |
| --- | --- |
| `<path>` | 一个 UTF-8 文件或目录；只能提供一个路径 |
| `--ext <extension>` | 目录模式下指定一个后缀；可以重复使用 |
| `--no-recursive` | 目录模式下只统计直接子文件 |

目录遍历不会跟随符号链接。隐藏文件和隐藏目录不会被自动排除，`node_modules` 等目录也不会被自动忽略。

## 错误行为

参数无效、路径不存在、输入类型不受支持或文件读取失败时，CLI 会：

- 在 stderr 输出以 `Error:` 开头的错误信息；
- 不输出部分统计结果到 stdout；
- 使用非零退出码结束；
- 不创建或修改被统计的文件。

## 运行检查

```powershell
npm run check
```

该命令依次验证双语 Agent Note、执行严格 TypeScript 构建并运行全部测试。