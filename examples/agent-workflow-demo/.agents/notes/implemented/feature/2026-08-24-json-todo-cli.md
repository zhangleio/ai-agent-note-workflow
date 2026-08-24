# Agent Note: JSON todo CLI

Status: implemented

English | [中文](2026-08-24-json-todo-cli.zh.md)

## Problem

The demonstration needs a feature small enough to implement in one review cycle while still requiring explicit product scope, persistence, command parsing, tests, and a durable decision record.

## Decision

The TypeScript CLI provides exactly three first-release commands: `add`, `list`, and `done`. It stores todos in a JSON file and parses command-line arguments with Node.js `parseArgs`. The storage and command layers are separate, so persistence behavior is tested without launching a subprocess.

The first release does not include deletion or bulk cleanup. Each todo has a stable numeric identifier, text, creation time, and completion state. Writes replace the JSON document through a same-directory temporary file. A missing document reads as an empty versioned document; malformed JSON or an invalid document structure fails without replacing the source document. The current document format and historical identifier rules are owned by [Durable todo archive](../architecture/2026-08-24-durable-todo-archive.md).

## Alternatives considered

**Include `remove` and `clear`.** These commands were not selected because they add destructive behavior before the basic lifecycle is validated. They can be proposed separately with explicit confirmation and missing-id semantics.

**Use SQLite.** SQLite provides transactions and better query growth, but it introduces a native or WASM dependency plus schema migration policy that the first three commands do not need.

**Use Commander.** Commander offers a polished subcommand API, but Node's standard `parseArgs` is sufficient for this deliberately small command surface and avoids a runtime dependency.

**Hand-write argument parsing.** Manual parsing looks small initially but would own option termination, missing values, and help/error consistency. `parseArgs` already supplies those mechanics.

**Keep todos only in memory.** This would avoid storage failure behavior, but a CLI process exits after each command and would therefore be unable to demonstrate a real todo lifecycle.

## Verification

`npm run check` verifies the Agent Note lifecycle and required sections, compiles the strict TypeScript program, and runs the focused Node.js suite. The tests continue to cover add/list/done persistence, missing-file behavior, unknown identifiers without mutation, malformed JSON without replacement, and invalid command arguments alongside later archive coverage.

The first check exposed that TypeScript 6 did not include the installed Node declarations implicitly. The project now declares `types: ["node"]`, and the same complete check passes.

## Consequences

The CLI has no runtime dependencies and its data remains human-readable. Separating command handling from storage keeps behavior directly testable, while temporary-file replacement avoids deliberately exposing partially written JSON.

Every write remains linear in the number of todos. Concurrent processes can overwrite one another because temporary-file replacement is not a cross-process transaction. The accepted first release documents those limits instead of adding database and locking complexity before demand exists.