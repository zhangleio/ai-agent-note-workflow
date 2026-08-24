# Agent Note: Durable todo archive

Status: implemented

English | [中文](2026-08-24-durable-todo-archive.zh.md)

## Problem

The original array document supported permanent `remove` but could not recover deleted todos. That absence caused [bulk clearing](../../rejected/feature/2026-08-24-clear-completed-command.md) to be rejected. Recovery also conflicted with the implemented decision that identifiers could be reused after deleting the current maximum, because restoring an older todo could collide with a newer active identifier.

## Decision

The store uses one versioned document containing a monotonic allocator and active and archived collections:

```json
{
  "version": 1,
  "nextId": 4,
  "active": [],
  "archived": []
}
```

`nextId` is greater than every identifier in either collection and never decreases. `add` consumes it and increments it, so identifiers remain unique for the document's full history. `list` and `done` operate only on `active`.

`archive <id>` moves one active todo into `archived`, `archive list` prints archived todos in identifier order, and `restore <id>` moves one archived todo back into `active`. These transitions preserve identifier, text, creation time, and completion state.

The previous `remove` command is withdrawn. Invoking it fails without writing and directs the user to `archive`; it is neither an alias nor a permanent-delete escape hatch.

### Legacy migration

The reader accepts the former top-level todo array as legacy version 0 and projects it in memory as `{ version: 1, nextId: maxId + 1, active: legacyTodos, archived: [] }`. Reads remain non-mutating. The first successful mutating command writes the projected version 1 document through the existing temporary-file replacement.

Malformed arrays, duplicate or invalid identifiers, invalid version 1 documents, and unsupported versions fail without replacement. Migration preserves every existing todo identifier and field.

### Supersession

This decision keeps the original JSON CLI separation, validation, and atomic replacement, while changing its array document and allocation details. It supersedes the identifier-reuse and permanent-delete behavior recorded by [Remove todo command](../../archived/feature/2026-08-24-remove-todo-command.md); that frozen Note remains linked as history while this Note is current authority.

The archive satisfies the recovery prerequisite named by the rejected clear proposal, but does not add `clear`. Bulk archive remains a separate product decision.

## Alternatives considered

**Keep two files for active and archived todos.** Moving a todo would require two file replacements without a transaction. A crash could duplicate or lose the item across documents.

**Implement only one-step undo.** Undo requires deciding whether its record survives restart and what a second destructive command does to it. A durable archive provides explicit, inspectable state.

**Keep identifier reuse and renumber on restore conflicts.** Renumbering breaks the identity selected for restore. A monotonic allocator removes the collision.

**Keep `remove` as an alias for `archive`.** This leaves two names for one operation and preserves a misleading promise of permanent deletion. A targeted migration error is explicit.

**Keep permanent `remove` alongside archive.** This lets callers bypass recovery. Permanent purge requires a separate retention and confirmation decision.

**Reject legacy arrays.** This would destroy continuity for first-release data even though the old format is deterministic to migrate.

**Rewrite on every legacy read.** That would make `list` unexpectedly mutate user data. Migration occurs only during an already requested successful write.

## Verification

`npm run check` validates four Agent Notes, compiles the strict TypeScript program, and passes fourteen Node.js tests. Storage tests prove non-mutating legacy projection, version 1 round trips, cross-collection duplicate rejection, unsupported-version rejection, and `nextId` validation. CLI tests prove archive/restore visibility and state preservation, invalid transitions without mutation, monotonic allocation, first-write migration, and the non-writing `remove` migration error.

## Consequences

Deleted todos are recoverable and identifiers remain stable across archive and restore. Active and archived state move in one atomic document replacement, and legacy first-release data upgrades without a separate command or mutation during reads.

The versioned format creates an explicit migration obligation for future storage changes. The document still rewrites in full and does not protect against concurrent processes. Archived data grows without a purge operation. Withdrawing `remove` is an intentional command compatibility break in this pre-release demonstration.