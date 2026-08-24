# Agent Note: UTF-8 text statistics CLI

Status: implemented

English | [中文](2026-08-24-utf8-text-statistics-cli.zh.md)

## Problem

Users need a small local command that summarizes a text file without opening an editor or sending its contents to an external service. Line, word, and character counts appear simple, but their results depend on explicit decisions about input encoding, Unicode characters, whitespace, empty files, trailing line separators, output stability, and file failures.

The project also needs one real feature to exercise its Agent Note workflow from a bilingual proposal through implementation and human acceptance.

## Decision

The project provides a Node.js ESM command named `text-stats` with this invocation:

```text
text-stats <file>
```

The command accepts exactly one file path and reads that file as UTF-8. Missing arguments, extra arguments, a missing path, or a path that cannot be read as a regular file fail with a non-zero exit and a concise error on stderr. Failed invocations do not create or modify files.

The command prints exactly three lines:

```text
Lines: <count>
Words: <count>
Characters: <count>
```

Characters are Unicode code points, so a supplementary-plane emoji counts as one character rather than two UTF-16 code units. Words are maximal non-empty sequences separated by one or more Unicode whitespace characters. This deliberately does not perform linguistic segmentation: continuous Chinese text without whitespace is one word.

Lines are logical text lines. An empty file has zero lines. Both LF and CRLF are line separators; a final separator terminates the preceding line but does not create an additional empty line. An interior blank line still counts as a logical line. Character counts include every code point in the decoded file, including line separators; CRLF therefore contributes two characters.

The implementation separates pure text counting from file access and CLI process behavior. It uses only Node.js standard modules and Node's built-in test runner. `countText` owns deterministic string semantics, `countFile` owns regular-file validation and UTF-8 reading, `runCli` owns arguments and stdout, and the executable entry owns stderr and exit status.

## Alternatives considered

**Read standard input.** This supports pipelines, but introduces empty-stream and interactive waiting semantics. A single file path keeps the first release bounded; stdin can be proposed separately.

**Support both files and stdin.** This is convenient but creates source precedence and `-` sentinel questions before either path has demonstrated demand.

**Use `Intl.Segmenter` for words.** It offers linguistic segmentation but requires locale and runtime-data decisions. Unicode whitespace tokens are deterministic and easy to explain.

**Count UTF-16 code units.** JavaScript's `string.length` is inexpensive, but it reports many emoji as two characters, which conflicts with ordinary user expectations for a character counter.

**Report separator count plus one as lines.** This would make an empty file one line and add a trailing empty line after a final newline. Logical lines provide more useful file summaries.

**Output JSON.** JSON is easier for programs to consume, but the selected first release is a human-facing command with only three stable values. Machine output remains a separate feature decision.

## Verification

`npm run check` validates one bilingual Agent Note pair, compiles the strict TypeScript program, and passes twelve Node.js tests. Five pure-function tests cover empty text, Unicode whitespace, supplementary-plane emoji, LF and CRLF logical lines, interior blank lines, final separators, and Chinese token behavior. Three file tests cover UTF-8 success, missing paths, directory rejection, and no filesystem creation on failure. Three CLI tests cover fixed output, missing and extra arguments without stdout, a real built subprocess, missing-file stderr, and exit code 1; one infrastructure test confirms the test runner.

The first focused run exposed a hand-calculated test expectation of twelve code points for `hello\t世界 😀\n`; the implementation correctly returned eleven. Correcting that test value made all five pure counting tests pass before file and CLI work proceeded. The final complete check passes all twelve tests.

## Consequences

Users can inspect local UTF-8 files with deterministic line, whitespace-token, and Unicode code-point counts without external services or runtime dependencies. The pure counting layer remains directly reusable and testable independently of filesystem and process behavior.

The fixed human-readable output is not a versioned machine interface. Unicode whitespace tokenization is deterministic but not linguistically accurate for languages commonly written without spaces. Node's UTF-8 decoding replaces malformed byte sequences rather than rejecting them. Reading the full file into memory limits suitability for very large files, and Windows permission behavior remains governed by the host filesystem.