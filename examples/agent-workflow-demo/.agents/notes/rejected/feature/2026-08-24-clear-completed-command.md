# Agent Note: Clear completed command

Status: rejected — bulk deletion requires archive, restore, or undo semantics before it can be delivered safely

English | [中文](2026-08-24-clear-completed-command.zh.md)

Later work delivered [bulk archive completed todos](../../implemented/feature/2026-08-24-bulk-archive-completed.md), a recoverable state transition rather than the permanent `clear` operation rejected here. This rejection remains unchanged.

## Problem

Removing completed todos one identifier at a time becomes repetitive as the list grows. A bulk operation is more destructive than `remove`, so its scope, confirmation mechanism, and empty-result behavior need an explicit product decision.

## Proposal

Add `clear --yes`. It removes every completed todo, preserves every open todo and its identifier, and prints `Cleared <count> completed todo(s).` The mandatory `--yes` flag makes bulk deletion explicit while retaining non-interactive scripting.

Running `clear --yes` when no completed todos exist succeeds, reports zero, and does not rewrite the data document. Running `clear` without `--yes`, with positionals, or with unsupported options fails without writing. Other commands reject `--yes` rather than silently ignoring it.

The command reuses the current validated JSON read and temporary-file replacement. It does not add undo history, a trash document, or a new storage format.

## Alternatives considered

**Delete every todo.** A full reset is easy to describe but can destroy unfinished work. Clearing completed items satisfies routine cleanup without expanding into database reset semantics.

**Run without confirmation.** The command name expresses cleanup intent, but one invocation can delete many records. Requiring `--yes` distinguishes bulk deletion from the accepted direct single-item `remove` behavior.

**Prompt interactively with `y/N`.** A prompt can prevent casual mistakes, but it complicates automation, redirected input, cancellation, and tests. An explicit flag provides deterministic confirmation.

**Fail when there is nothing to clear.** No matching records is not an invalid request. Treating it as success makes scheduled and repeated cleanup idempotent.

**Move completed todos to a trash or archive file.** This would provide recovery but introduces another durable document, retention policy, restore command, and consistency behavior. Those capabilities require a separate persistence proposal.

**Continue using repeated `remove`.** Existing functionality can achieve the same final state, but callers must first parse `list`, identify completed records, and issue multiple writes. The CLI owns completion state and can perform this operation atomically at its current document granularity.

## Acceptance criteria

- `clear --yes` removes all completed todos and preserves open todos without renumbering.
- The command reports the number removed with correct singular/plural wording.
- With no completed todos, it reports zero and leaves an existing document byte-for-byte unchanged.
- Missing `--yes`, unexpected positionals, unsupported options, and `--yes` on another command fail without writing.
- Focused tests cover mixed state, empty matching state, missing confirmation, and option ownership.
- `npm run check` passes before this note moves to `implemented/`.

## Risks

Bulk deletion has no application-level undo. Confirmation proves that the caller supplied a flag, not that the caller reviewed each matching todo. The operation inherits the existing full-document rewrite and concurrent-writer limitations.