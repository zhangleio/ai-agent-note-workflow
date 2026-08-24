# Agent Note: Bulk archive completed todos

Status: implemented

English | [中文](2026-08-24-bulk-archive-completed.zh.md)

## Problem

Completed todos required repeated single-item archive commands. The earlier [clear completed proposal](../../rejected/feature/2026-08-24-clear-completed-command.md) was rejected because bulk deletion had no archive, restore, or undo semantics. [Durable todo archive](../architecture/2026-08-24-durable-todo-archive.md) supplies recoverable archived state and stable identifiers, allowing bulk movement without permanent deletion.

## Decision

The CLI provides `archive --completed --yes`. It moves every completed todo from `active` to `archived`, preserves open todos and all identifiers, and prints `Archived N completed todo(s).` The `--completed` and `--yes` boolean options may appear in either order.

The options select a distinct bulk mode. Supplying an identifier together with either option fails without writing; single-item `archive <id>` remains unchanged and accepts neither option. Commands other than `archive` reject both options rather than silently ignoring them.

`--yes` is mandatory even though archived todos are recoverable. It records explicit caller intent for a many-item state transition; restoration remains one item at a time.

When no active completed todos exist, the command succeeds, prints `Archived 0 completed todo(s).`, and does not rewrite an existing document. A non-empty transition writes the version 1 document once through the existing temporary-file replacement.

## Alternatives considered

**Reuse `clear --yes`.** The former name suggests deletion and carries the rejected proposal's semantics. `archive` accurately names the recoverable operation.

**Use `archive completed`.** A positional subcommand is easy to parse, but the selected option form makes completion an explicit filter. The command still owns only one filter.

**Run without `--yes`.** Recovery lowers the consequence of a mistake, but restoring many items requires repeated commands. Explicit confirmation remains appropriate for the broad transition.

**Prompt interactively.** A prompt complicates automation, redirected input, cancellation, and tests. A required boolean flag is deterministic.

**Accept an identifier together with `--completed`.** Interpreting this as a status check or ignoring one input creates an ambiguous third mode. Single and bulk archive are mutually exclusive.

**Report an error when zero items match.** No matching completed todos is a valid stable state. Success makes scheduled and repeated cleanup idempotent.

**Add bulk restore at the same time.** Bulk restoration needs a filter or batch identity. It remains a separate feature decision.

## Verification

`npm run check` validates five Agent Notes, compiles the strict TypeScript program, and passes seventeen Node.js tests. Bulk-specific tests prove both option orders, movement of completed records only, preservation of open and archived state plus `nextId`, exact count output, zero-match byte stability, rejection of incomplete option pairs, rejection of ID-plus-options ambiguity, and rejection of options on another command. Existing single archive, archive list, and restore tests continue to pass.

## Consequences

Completed work can be archived in one recoverable document transition without reintroducing permanent `clear`. The fixed output and order-independent options support scripting, while explicit confirmation distinguishes the broad operation from single-item archive.

Confirmation proves only that the caller supplied `--yes`; it does not show which records were reviewed. Recovery remains one item at a time, so undoing a large bulk archive is tedious. The operation inherits the version 1 document's full-rewrite and concurrent-writer limitations.