# Agent Note: Preserve hyphen-prefixed add text

Status: implemented

English | [中文](2026-08-24-add-hyphen-prefixed-text.zh.md)

## Problem

The implemented [JSON todo CLI](../feature/2026-08-24-json-todo-cli.md) defines `add <text>` without reserving option names for `add`. The command parser nevertheless parsed the entire invocation with strict global options before dispatching the command. As a result, `add --urgent task` failed with `ERR_PARSE_ARGS_UNKNOWN_OPTION` instead of storing the literal text `--urgent task`.

This was a defect in the existing text contract rather than a new command capability. It also created an accidental collision with `archive` options: `add --completed review` was rejected by archive option ownership even though every token after `add` belongs to todo text.

## Decision

The CLI recognizes the first token as the command before command-specific parsing. For `add`, it joins every remaining token, trims the resulting text, and interprets no trailing token as an option. `add --urgent task` stores `--urgent task`, while `add --completed review` stores `--completed review`.

All non-`add` commands continue through strict `parseArgs` handling. The `--completed` and `--yes` options remain owned exclusively by archive bulk mode there, unknown options remain errors, and no archive, restore, list, or done behavior changes.

The regression test was added before the implementation change. It reproduced `ERR_PARSE_ARGS_UNKNOWN_OPTION` with seventeen existing tests passing and only the new case failing. Moving the existing add path before strict parsing made the same test pass without changing storage behavior.

## Alternatives considered

**Require `add -- --urgent task`.** Node's option terminator is conventional, but the implemented command contract did not document it and `add` owns no options. Requiring callers to escape ordinary todo text would preserve the accidental parser limitation.

**Set `strict: false` globally.** This would allow the text but also weaken typo detection and option ownership for every other command.

**Add an `--text` option.** This introduces a second input form and escaping questions for no product benefit; the positional `<text>` contract is sufficient.

**Manually parse every command.** Only `add` needs opaque trailing text. Retaining `parseArgs` for option-bearing and fixed-positional commands keeps standard strict validation where it matters.

## Verification

Before the fix, the focused build and test run passed seventeen tests and failed the new `preserves hyphen-prefixed text after add` regression with `ERR_PARSE_ARGS_UNKNOWN_OPTION`. After the fix, `npm run check` validates six Agent Notes, verifies the archived Note hash, compiles the strict TypeScript program, and passes all eighteen tests.

The regression persists and lists both `--urgent task` and `--completed review` exactly. Existing tests continue to prove empty add rejection, strict invalid arguments, archive option ownership, both bulk option orders, and unchanged storage behavior.

## Consequences

Todo text can begin with a hyphen or match an option name without requiring a `--` escape. Strict parsing and typo detection remain intact for every non-add command.

`add` cannot gain options later without an explicit contract change because every trailing token is text. Command recognition now has a small pre-parse branch, while trimming retains the prior leading and trailing whitespace behavior.