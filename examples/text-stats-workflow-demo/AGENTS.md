# AGENTS.md

This repository uses an Agent Note driven development workflow.

- Record every non-trivial behavioral, architectural, process, or testing decision in `.agents/notes`.
- Read `.agents/agent-note-workflow.json` before creating a proposed Note. This example selects `bilingual`.
- Maintain every Note outside `proposed/`, and every bilingual proposal, as an equal-authority English `.md`, Simplified Chinese `.zh.md`, and `.i18n.yaml` Git blob hash record.
- Start undecided work in `proposed/`; do not change product code before proposal approval.
- Move a Note to `implemented/` only after implementation, focused checks, complete checks, and human acceptance.
- Move all three pair files together across lifecycles.
- Never rewrite an old Note into a different decision; create a new Note and link supersession explicitly.
- Keep rejected decisions as history when their rationale prevents a likely mistake.
- Archived triplets are frozen and must match `.agents/notes/archived/manifest.json`.
- Record real alternatives and concrete verification evidence.
- Run `npm run check` before implementation review and after every lifecycle migration.
