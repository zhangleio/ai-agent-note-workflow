# Agent Note: Directory line counts by extension

Status: implemented

English | [中文](2026-08-24-directory-line-count-by-extension.zh.md)

## Problem

The existing `text-stats <file>` command summarizes one UTF-8 file. Users also need to measure the logical lines in selected source and documentation file types under a directory, optionally including nested directories. The feature needs explicit rules for defaults, extension matching, traversal, ordering, failures, and output so that repeated runs are deterministic.

## Decision

The existing single-file invocation and its three-line output remain unchanged. When the first positional path is a directory, the command supports this invocation:

```text
text-stats <directory> [--ext <extension>]... [--no-recursive]
```

Directory scanning recursively includes descendant directories by default. `--no-recursive` limits scanning to direct child files. Traversal never follows symbolic links. Hidden files and hidden directories are treated like other entries; there are no implicit exclusions such as `node_modules`.

When no `--ext` option is present, scan `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.json`, `.md`, `.css`, and `.html` files. Each `--ext` requires a non-empty extension beginning with `.`. One or more explicit `--ext` values replace the entire default set. Duplicate extensions are accepted once, and matching is case-insensitive against the file name's final extension.

Each matching regular file is read as UTF-8 and counted with the existing logical-line rules: an empty file has zero lines, LF and CRLF each separate logical lines, a final separator does not add an empty line, and an interior blank line counts. Directory output lists matching files in ordinal order by their slash-separated path relative to the requested directory, followed by totals:

```text
src/index.ts: 24
test/index.test.ts: 31
Files: 2
Lines: 55
```

With no matches, output contains only `Files: 0` and `Lines: 0`. Invalid options, extra positional paths, a missing path, an unreadable directory entry, or a matching file that cannot be read fail with no stdout, a concise stderr error, and a non-zero exit. The command does not create or modify files.

The implementation separates option parsing, directory discovery, and output formatting. `parseCliArguments` owns defaults and syntax validation, `countDirectory` owns traversal and logical-line aggregation, and `runCli` dispatches by path type and formats output. Tests use temporary directory trees and real built subprocesses.

## Alternatives considered

**Require `--recursive`.** This keeps the default operation bounded but makes the primary repository-wide use case require an extra option. Default recursion matches the requested workflow, while `--no-recursive` preserves direct-child scanning.

**Use comma-separated extensions.** It shortens some commands but requires escaping and empty-item rules. Repeated options are unambiguous and compose naturally in shells.

**Treat explicit extensions as additions to defaults.** This makes a request for only one file type surprisingly broad. Explicit values replacing defaults give the option a direct meaning.

**Print only the total line count.** This is compact but gives no evidence about which files contributed. Sorted per-file rows make matching and totals inspectable.

**Exclude hidden and dependency directories automatically.** Such policy is ecosystem-specific and can silently omit requested content. This proposal makes traversal literal; future include and exclude controls can be proposed separately.

**Follow symbolic links.** This can include content outside the requested tree and create cycles. Not following links gives a finite, local scan.

## Verification

`npm run check` validates two bilingual Agent Note pairs, compiles the strict TypeScript program, and passes twenty-five Node.js tests. Four parser tests cover default extensions, default recursion, repeated case-insensitive extension replacement, `--no-recursive`, option ordering, and invalid syntax. Five directory tests cover recursive defaults, direct-child scanning, multiple extensions, zero matches, sorted relative paths, hidden directories, symbolic links, missing paths, and regular-file rejection. Seven CLI tests cover unchanged single-file output, directory details and totals, non-recursive zero matches, directory options on files, missing and extra arguments, and real file and directory subprocesses. The nine existing infrastructure, pure-counting, and file-access tests also pass.

The first CLI-focused run passed six of seven tests and exposed a regression in the established missing-file error: path dispatch changed `File does not exist` to `Path does not exist`. The implementation now preserves the original error for invocations without directory options while using the general path wording for directory-option invocations. Repeating the focused CLI run passed all seven tests before the complete check passed all twenty-five.

## Consequences

Users can now inspect line counts across selected file types in a directory tree while retaining the original single-file line, word, and character summary. Default recursion supports repository-wide measurement, `--no-recursive` bounds the scan to direct children, and sorted per-file rows make the total inspectable.

Large trees require one directory entry and one full-file read per match, so runtime and memory use grow with repository size and the largest matching file. Literal traversal includes dependency, generated, and hidden directories unless the user limits recursion. Case-insensitive matching may include files that a case-sensitive ecosystem treats as unconventional. Node's UTF-8 decoder replaces malformed byte sequences, and a filesystem mutation during traversal can cause a read failure rather than a snapshot-consistent result.