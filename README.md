# AI Agent Development Workflow

English | [简体中文](README.zh.md)

This is an **Agent Note driven development workflow** designed for reuse in new projects. Through reviewable decision records, it connects requirement discussions, solution selection, code implementation, test verification, requirement rejection, rule supersession, and historical archiving.

The core purpose of this workflow is not to "make the Agent write more documentation," but to ensure that the following facts remain traceable over time:

- Why a change was made;
- Which alternatives were considered and why they were not selected;
- Who approved the requirement before implementation;
- Which verification evidence demonstrates that the implementation conforms to the decision;
- Which rules the current project actually follows;
- Why an old rule was retired and whether it may be proposed again later;
- Whether the English and Chinese decision documents remain consistent.

See [examples](examples/README.md) for complete, runnable reference projects. They include a multi-lifecycle evolution example for a to-do CLI and a feature example that takes a text statistics CLI from requirement clarification through implementation acceptance.

## 1. Core Principles

### 1.1 Decisions Precede Non-Trivial Implementation

When a feature, behavior, architecture, storage format, protocol, process, or testing strategy changes in a non-trivial way, create an Agent Note before modifying code.

Small mechanical changes may be exempt, such as spelling fixes, formatting changes with no semantic effect, or explicit local renames. As soon as a change requires discussion of tradeoffs, it is no longer mechanical.

### 1.2 Humans Participate in Key Decisions

An Agent may investigate, propose solutions, implement, and verify, but the project owner decides the following:

1. Requirement semantics and boundaries;
2. Whether to approve a proposed Note;
3. Whether to accept the implementation after verification passes;
4. Whether to reject, supersede, or archive a decision.

### 1.3 Passing Code Is Not the Same as Delivering a Decision

After the code is complete or the tests pass, the Note remains `proposed` until the owner completes implementation acceptance. Only after acceptance may the complete Note triplet move to `implemented`.

### 1.4 Do Not Rewrite Decision History

When requirements change, do not directly rewrite an old Note into the new requirement as though the old rule never existed. Use a new proposed Note to extend, partially supersede, or fully supersede the old decision.

### 1.5 Mechanical Gates Are Better Than Verbal Agreements

Lifecycles, required sections, bilingual pairing, duplicate topics, and archive immutability should all be checked by scripts. Rules written only in a README, without an enforcing gate, tend to erode over time.

## 2. Recommended Directory Structure

```text
.agents/
└── notes/
		├── proposed/
		│   ├── feature/
		│   ├── bug-fix/
		│   ├── simplification/
		│   ├── architecture/
		│   ├── process/
		│   └── testing/
		├── implemented/
		│   └── ...the same class directories
		├── rejected/
		│   └── ...the same class directories
		└── archived/
				├── manifest.json
				└── ...the same class directories
```

Each Note uses the following path format:

```text
{lifecycle}/{class}/yyyy-mm-dd-topic.md
```

The date is when the topic was first proposed. It does not change when the file moves between lifecycles.

## 3. Lifecycles

### `proposed`

A proposal that is under discussion and has not yet become a current rule.

- It may describe plans, migration steps, and expected results;
- Code and other documentation must not treat it as established fact;
- Implementation begins only after requirement approval;
- It moves to `implemented` after implementation acceptance;
- It moves to `rejected` if declined.

### `implemented`

A delivered decision that is currently in force.

- Current code and subsequent development must follow its rules;
- It describes actual behavior in the present tense;
- It must include real verification evidence;
- When requirements change, a new Note extends or supersedes it;
- Once it has completely left the scope of current guidance, it may move to `archived`.

### `rejected`

A proposal that was discussed but never became an effective rule.

- Its status line should record a brief reason for rejection;
- The proposal must not be implemented;
- If conditions change, do not change the old Note back to proposed in place;
- Create a new proposed Note that references the old rejection and explains how the prerequisites have changed.

### `archived`

A rule that was implemented historically but no longer guides the current project.

- Keep `Status: implemented`;
- Add `Archived: YYYY-MM-DD`;
- Use it only for historical traceability, not as a basis for current implementation;
- Freeze it permanently after archiving: do not edit, translate, or reformat it;
- To adopt an old idea again, create a new proposed Note instead of reactivating the old file.

The shortest way to remember the lifecycles is:

```text
proposed    = not yet decided
implemented = currently in force
rejected    = never took effect
archived    = previously in force
```

## 4. Decision Classes

| Class | When to use it |
|---|---|
| `feature` | Add a new capability for users, models, or callers |
| `bug-fix` | Correct a defect that violates an existing agreement, or close a gap found during an incident review |
| `simplification` | Remove code, state, behavior, or public scope without adding capabilities |
| `architecture` | Make a structural decision about delivered source code, such as module relationships, data models, or runtime responsibilities |
| `process` | Change surrounding tools, gates, dependency management, releases, or workflows |
| `testing` | Change test infrastructure, coverage strategy, snapshots, or end-to-end verification methods |

### Feature vs. Bug-fix

The deciding question is: **Does an existing effective decision already promise this behavior?**

- If not, and a new capability is required: `feature`;
- If yes, but the implementation does not conform: `bug-fix`.

For a bug-fix, first add a regression test that is guaranteed to fail, record the pre-fix failure evidence, then implement the smallest fix and make the same test pass.

### Simplification vs. Architecture

- Change the system structure and establish a new long-term responsibility model: `architecture`;
- Remove duplicate mechanisms, unused scope, or redundant state without adding capabilities: `simplification`.

A simplification must prove that external capabilities did not change unintentionally, usually through existing tests plus verification focused on the removed path.

## 5. Bilingual Three-File Groups

Each Agent Note consists of three files in the same directory:

```text
topic.md
topic.zh.md
topic.i18n.yaml
```

### Equal Authority

English and Simplified Chinese have equal authority. Either language may be drafted first, but the other side must be synchronized in the same change. Chinese must not be treated as an optional translation.

After the status block, the English file adds:

```markdown
English | [中文](topic.zh.md)
```

The Chinese file adds:

```markdown
[English](topic.md) | 中文
```

Both sides must preserve:

- The same lifecycle status;
- The same heading levels and order;
- Equivalent facts, constraints, alternatives, and consequences;
- Identical code block content;
- The same link targets except for the language switch links;
- The same list and table structure.

### Consistency Record

The `.i18n.yaml` stores the Git blob hashes from the last time both documents were manually confirmed to be semantically consistent. It uses a strict YAML mapping with one unquoted Markdown basename and one lowercase 40-character hash per line. Comments and blank lines are allowed; JSON object syntax, quoted keys, duplicate or unknown keys, nested values, and trailing punctuation are rejected:

```yaml
# Bilingual-pair consistency record
topic.md: <english-git-blob-hash>
topic.zh.md: <chinese-git-blob-hash>
```

Calculate the hashes with:

```powershell
git hash-object ".agents/notes/proposed/feature/topic.md"
git hash-object ".agents/notes/proposed/feature/topic.zh.md"
```

When either language changes:

1. Update the other side in sync;
2. Manually confirm that their semantics remain consistent;
3. Recalculate both Git blob hashes;
4. Update `.i18n.yaml`;
5. Run the Note gate.

A green gate proves only that the current content matches the content confirmed last time. It does not prove translation quality. Semantic accuracy remains the reviewer's responsibility.

### Repository Document Consistency

The root guide, root Agent instructions, and example index also use adjacent `.i18n.yaml` records:

```text
README.i18n.yaml
AGENTS.i18n.yaml
examples/README.i18n.yaml
```

After updating either language in one of these pairs, review both documents, refresh both LF-normalized Git blob hashes, and run:

```powershell
node scripts/verify-doc-i18n.mjs
```

This zero-dependency gate checks the three records, reciprocal language switchers, corresponding heading and fenced-block structures, and real relative links outside fenced examples. These ordinary-document records are separate from Agent Note lifecycle validation.

## 6. Standard Development Process

### Stage A: Requirement Clarification

1. Locate the code and implemented Note that currently control the behavior;
2. Define user-observable behavior, inputs, outputs, and failure semantics;
3. Determine whether data is written and whether it remains byte-for-byte unchanged on failure;
4. Discuss compatibility, recoverability, permissions, security, and concurrency constraints;
5. Have the owner select the solution.

### Stage B: Create a Proposed Note

Create all three files together. The body must include at least:

```markdown
## Problem
## Proposal
## Alternatives considered
## Acceptance criteria
## Risks
```

The Chinese counterpart uses equivalent sections:

```markdown
## 问题
## 提案
## 考虑过的替代方案
## 验收标准
## 风险
```

Record alternatives that were genuinely considered. Do not invent obviously unreasonable options merely to fill the section.

### Stage C: Requirement Review

The owner chooses one of the following:

- Approve implementation;
- Request revisions to the proposal;
- Reject the proposal.

Do not modify product code before approval. An exploratory prototype, even if one already exists, does not justify skipping review.

### Stage D: Implementation and Focused Verification

1. Make the smallest verifiable change;
2. Immediately run the most focused verification after the first substantive edit;
3. For a bug-fix, establish a failing regression test first;
4. Verify that failed operations produce no writes or partial state;
5. Fix the same local issue and repeat the same verification;
6. Finally, run the project's complete gate.

### Stage E: Implementation Acceptance

Report the following to the owner:

- What was actually implemented;
- Which tests failed before the fix;
- Which tests passed after the fix;
- Whether any residual limitations or compatibility effects remain;
- The actual results of Note validation, builds, type checking, and tests.

The owner chooses whether to accept, request revisions, or withdraw the implementation.

### Stage F: Move to Implemented

After acceptance, move all three files together and update the body in sync:

```text
Proposal             -> Decision
Acceptance criteria  -> Verification
Risks                -> Consequences
```

Change planned language into current facts, record real verification results, and then recalculate the Git blob hashes for both languages.

After the move, check whether files with the same name remain in the old lifecycle. Some file-moving tools may copy to the destination while leaving the source behind, so the gate must reject duplicate topics across lifecycles.

## 7. Requirement Change Process

When a requirement in an implemented Note changes, first classify the scale of the change.

### Documentation-Only Correction

Spelling, links, or clarifications that do not change semantics may update the English, Chinese, and consistency record together without a new decision.

### Compatible Extension

If the old rule remains valid and only an independent capability is added, create a new feature Note. Both the old and new Notes remain implemented.

### Partial Supersession

If a new Note changes only part of an old Note's rules:

- The new Note explicitly identifies which rule it supersedes;
- The old Note remains implemented;
- The old Note adds a partial supersession link;
- The old Note continues to own all other rules that remain valid.

### Full Supersession

When a new decision takes over all responsibilities of an old decision, after implementation and acceptance:

1. Move the new Note to implemented;
2. Fix all current authoritative links;
3. Move the old Note triplet to archived;
4. Update the archive manifest;
5. Run the complete gate again.

Do not archive the old Note before the new solution is actually implemented. Doing so creates an authority gap in which the old rule has retired but the new rule has not yet been delivered.

## 8. Re-Proposing a Rejected Solution

An old rejected Note permanently retains the rejection decision made at that time. If the prerequisites later change:

1. Read the old Note's problem, alternatives, and reason for rejection;
2. Create a new proposed Note;
3. Link to the old rejected Note;
4. State which prerequisites have changed;
5. Design new semantics that fit the current architecture;
6. Complete approval, implementation, and acceptance again.

An old idea may be reused, but its old decision status must not be reused directly.

## 9. Archiving Process

Only an implemented Note may be archived. Before archiving, confirm that:

- The core rules have been fully taken over by a new implemented Note;
- Current code and tests no longer depend on the old behavior;
- All inbound links have been updated;
- The three-file group is complete and consistently paired.

When archiving:

1. Add the same `Archived: YYYY-MM-DD` to the English and Chinese files;
2. Update both Git blob hashes;
3. Move all three files together to `archived/{class}/`;
4. Calculate the raw SHA-256 of each of the three files;
5. Write all three digests to `archived/manifest.json`;
6. Run the archive immutability gate.

Example manifest:

```json
{
	"feature/topic.i18n.yaml": "<sha256>",
	"feature/topic.md": "<sha256>",
	"feature/topic.zh.md": "<sha256>"
}
```

Do not edit files after archiving. To adopt an old capability again, create a new proposed Note and reference the archived record as historical input.

## 10. Recommended Gates

The project should provide at least one unified check command, for example:

```json
{
	"scripts": {
		"verify:notes": "node scripts/verify-agent-notes.mjs",
		"check": "npm run verify:notes && npm run build && npm test"
	}
}
```

The Note validator should check at least the following:

- Lifecycles and classes belong to closed sets;
- Every English Note has a Chinese counterpart and a consistency record;
- No orphaned `.zh.md` or `.i18n.yaml` files exist;
- English and Chinese statuses match their lifecycle locations;
- Both sides contain corresponding required sections;
- Bidirectional language switch links exist;
- Git blob hashes match the consistency record;
- Heading, code block, and link structures match;
- The same topic does not appear in multiple lifecycles;
- Archived triplets match the SHA-256 values in the manifest;
- The manifest contains no entries for files that no longer exist.

Run the unified `check` in CI and before local commits. When a gate fails, fix the actual inconsistency instead of merely refreshing hashes to conceal an unsynchronized translation.

## 11. Reusable AGENTS.md Baseline

A new project can begin with the following rules, then add build and test commands for its technology stack:

```markdown
# AGENTS.md

This repository uses an Agent Note driven development workflow.

Agent Note workflow adapted from [ai-agent-note-workflow](https://github.com/zhangleio/ai-agent-note-workflow); local project rules take precedence.

- Record every non-trivial behavioral, architectural, process, or testing decision in `.agents/notes`.
- Maintain each Agent Note as an equal-authority English `.md`, Simplified Chinese `.zh.md`, and `.i18n.yaml` Git blob hash record.
- Start undecided work in `proposed/`; do not change product code before proposal approval.
- Move a Note to `implemented/` only after implementation, focused checks, complete checks, and human acceptance.
- Move all three files together across lifecycles.
- Never rewrite an old Note into a different decision; create a new Note and link supersession explicitly.
- Keep rejected decisions as history when their rationale prevents a likely mistake.
- Archived triplets are frozen and must match `.agents/notes/archived/manifest.json`.
- Record real alternatives and concrete verification evidence.
- Run the project check command before implementation review and after every lifecycle migration.
```

## 12. Proposed Note Template

English:

```markdown
# Agent Note: <title>

Status: proposed

English | [中文](yyyy-mm-dd-topic.zh.md)

## Problem

<Describe the problem independently of the solution.>

## Proposal

<Describe the proposed behavior, ownership, failure semantics, and migration.>

## Alternatives considered

**<Alternative>.** <Why it was not selected.>

## Acceptance criteria

- <Observable completion condition.>

## Risks

<Tradeoffs, compatibility impact, and intentional omissions.>
```

Chinese:

```markdown
# Agent Note：<标题>

Status: proposed

[English](yyyy-mm-dd-topic.md) | 中文

## 问题

<独立于解决方案描述问题。>

## 提案

<描述拟议行为、职责、失败语义和迁移。>

## 考虑过的替代方案

**<替代方案>。** <未选择的原因。>

## 验收标准

- <可观察的完成条件。>

## 风险

<取舍、兼容性影响和有意不做的范围。>
```

## 13. Implemented Note Template

```markdown
# Agent Note: <title>

Status: implemented

English | [中文](yyyy-mm-dd-topic.zh.md)

## Problem

<Problem that motivated the decision.>

## Decision

<Current implemented behavior and ownership.>

## Alternatives considered

**<Alternative>.** <Why it was not selected.>

## Verification

<Commands run, failure-before evidence where relevant, and passing results.>

## Consequences

<Benefits, costs, remaining limits, and compatibility effects.>
```

The Chinese file uses the mirrored sections `问题 / 决策 / 考虑过的替代方案 / 验证 / 后果`.

## 14. New Project Adoption Checklist

1. Create `.agents/notes/{proposed,implemented,rejected,archived}`;
2. Create all six class directories under each lifecycle;
3. Create `archived/manifest.json` with initial content `{}`;
4. Add the `AGENTS.md` baseline from this page to the project;
5. Add a Note pairing and archive validation script;
6. Integrate `verify:notes` into the project's unified check command;
7. Take one small, real requirement from proposed through implemented;
8. Use a real defect to demonstrate the red-green testing process for a bug-fix;
9. Demonstrate archived only when full supersession occurs; do not artificially archive a decision that remains valuable merely to populate the directory;
10. Have the project owner actually participate in proposal approval and implementation acceptance.

The provenance sentence in the baseline is informational only. It creates no runtime dependency, telemetry, network request, automatic update check, CI requirement, console output, badge, or obligation to track upstream changes. Downstream projects remain independent, and their local rules take precedence.

## 15. Final Decision Rules

For new work, make decisions in the following order:

```text
Does it change behavior, structure, process, or testing strategy?
	No -> mechanical change; a Note may be omitted
	Yes -> Does an implemented Note already promise the behavior?
				 Yes, but the implementation does not conform -> bug-fix
				 No, a new capability is required -> feature
				 It only removes mechanisms without adding capabilities -> simplification
				 It changes source-code structure or responsibilities -> architecture
				 It changes development tools or workflows -> process
				 It changes test infrastructure or strategy -> testing

Has the decision been approved and delivered?
	No -> proposed
	Yes -> implemented
	It was declined -> rejected
	It was delivered but no longer guides the current project -> archived
```

The goal of this workflow is to let Agents increase implementation speed without bypassing human product judgment or sacrificing the traceability of project decisions.

## 16. Acknowledgements

This project was inspired by the traceable development practices in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It independently adapts those ideas into a reusable Agent Note driven workflow and is not affiliated with or endorsed by DeepSeek.
