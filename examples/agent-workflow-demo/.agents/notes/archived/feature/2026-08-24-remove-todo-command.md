# Agent Note: Remove todo command

Status: implemented

Archived: 2026-08-24

English | [中文](2026-08-24-remove-todo-command.zh.md)

Superseded by [Durable todo archive](../../implemented/architecture/2026-08-24-durable-todo-archive.md). This Note records the previously delivered permanent-delete and identifier-reuse decision; it is not current command authority. `remove` now performs no write and directs callers to `archive`.

## Problem

The first release can create and complete todos but cannot remove an item that is obsolete, duplicated, or entered by mistake. Adding destructive behavior requires an explicit decision about confirmation, missing identifiers, and whether completion state restricts deletion.

## Decision

The following decision describes the delivered behavior before the durable archive superseded it.

The CLI provides `remove <id>` as its fourth command. A valid invocation deletes the matching todo immediately and prints `Removed todo <id>.` The command can remove either an open or completed todo.

An invalid identifier or an identifier absent from the document fails without writing the file. The implementation reuses the existing validated JSON read and temporary-file replacement; the stored todo structure does not change. Removing an item does not renumber remaining todos.

Identifiers are unique only within the current document. `add` allocates one greater than the largest remaining identifier, so removing the current maximum permits a later todo to reuse that identifier. This keeps the array document unchanged and avoids introducing format migration solely for historical identifier uniqueness.

## Alternatives considered

**Require `--yes`.** This would add protection against accidental deletion, but the explicit `remove <id>` command already expresses destructive intent. Requiring another flag makes scripts noisier without protecting against selecting the wrong identifier.

**Prompt interactively with `y/N`.** Interactive confirmation is familiar, but it complicates automation, redirected input, cancellation, and tests. The CLI remains non-interactive.

**Treat an absent identifier as idempotent success.** This can simplify cleanup scripts, but it also hides stale or mistyped identifiers. The existing `done` command reports absent identifiers, so matching that behavior keeps command semantics predictable.

**Delete only completed todos.** This would protect open work, but it mixes lifecycle policy into an operation whose purpose is explicit removal. Users may legitimately remove an obsolete open item.

**Persist a monotonic `nextId`.** This would prevent identifier reuse but would change the JSON document from an array or add separate metadata and migration behavior. The accepted requirement only needs identifiers to be unique among current todos.

**Add `clear` at the same time.** Bulk deletion has separate scope, filtering, and confirmation questions. It remains outside this decision.

## Verification

`npm run check` verifies both Agent Notes, compiles the strict TypeScript program, and runs eight Node.js behavior tests. Remove-specific tests prove that open and completed todos can be deleted without renumbering, an unknown identifier leaves the document byte-for-byte unchanged, and deleting the maximum identifier allows the next `add` to reuse it. Invalid remove arguments also fail through the command usage path.

## Consequences

The command remains scriptable and consistent with `done` missing-identifier behavior. It adds no storage migration or runtime dependency and continues using the existing temporary-file replacement.

Deletion has no application-level undo or confirmation. Maximum identifiers can be reused after removal, so external references must not treat an identifier as a permanent historical identity. Full-document rewrites retain the existing concurrent-writer limitation.