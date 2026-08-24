# AGENTS.md

This repository demonstrates an Agent Note driven development workflow.

- Record every non-trivial behavioral or architectural decision in `.agents/notes`.
- Maintain every Agent Note as an equal-authority English `.md`, Simplified Chinese `.zh.md`, and `.i18n.yaml` Git blob hash record. Update both languages and refresh the record together.
- Start undecided work in `proposed/`; move the note to `implemented/` only after implementation and checks pass.
- Move all three pair files together across lifecycles. Archived triplets are frozen and must match `.agents/notes/archived/manifest.json`.
- Record real alternatives and why they were not selected.
- Keep changes small and run `npm run check` before review.
- Do not mark a note implemented merely because code was written; verification evidence is required.