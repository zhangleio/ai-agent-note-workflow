# AGENTS.md

English | [简体中文](AGENTS.zh.md)

This repository maintains a reusable Agent Note driven development workflow and runnable example projects under `examples/`.

## Rule scope

- This file applies to the entire repository.
- An `AGENTS.md` in a subdirectory can add or refine rules. When changing that directory, follow both the root rules and the nearest applicable file.
- [README.md](README.md) is the primary description of workflow semantics, lifecycles, and document formats. This file turns those requirements into execution constraints.

## Change principles

- Keep root documentation reusable. Do not turn implementation details from one example into requirements for every project.
- Follow an existing example's technology, directory structure, and local `AGENTS.md`. Do not refactor unrelated code while making a focused change.
- Put new examples under `examples/<project-name>/` and provide an independent dependency manifest, build and test commands, project README, and local `AGENTS.md`.
- Do not commit dependency directories, build outputs, temporary files, credentials, or local environment configuration.
- Do not alter unrelated user changes or create Git commits or branches automatically.

## Agent Note workflow

Every non-trivial product behavior, architecture, storage format, protocol, process, or testing strategy change must follow this workflow:

1. Create an English `.md`, Simplified Chinese `.zh.md`, and `.i18n.yaml` consistency record under `.agents/notes/proposed/<class>/`.
2. Record the problem, proposal, genuine alternatives, acceptance criteria, and risks.
3. Do not modify product code before human proposal approval.
4. After approval, implement in layers and run the smallest focused check that can disprove the current hypothesis after each substantive edit.
5. After the complete check passes, request independent human implementation acceptance. Passing tests does not constitute acceptance.
6. Only after human acceptance, move all three files together to `implemented/<class>/` and rewrite planned behavior as the actual decision, verification, and consequences.
7. Move declined proposals to `rejected/<class>/`. Move superseded history that must be frozen to `archived/<class>/`.

Mechanical changes that may omit an Agent Note include spelling fixes, link repairs, formatting without semantic effect, and explicitly requested repository initialization files. A change that requires a behavioral decision or tradeoff is not mechanical.

## Note consistency

- English and Chinese Notes have equal authority. Their heading levels, code blocks, and link structures must correspond.
- `.i18n.yaml` records the Git blob SHA-1 of both documents after LF normalization.
- Active `.i18n.yaml` files must use unquoted `<basename>.md: <40-character-lowercase-hex>` mappings. Only blank lines and `#` comments may appear otherwise; JSON object syntax is invalid.
- Lifecycle transitions must move the English document, Chinese document, and consistency record together without leaving duplicate topics.
- Never rewrite an old Note into a different decision. Create a new proposed Note for changed requirements and state the supersession relationship.
- Archived triplets are frozen. Do not modify them outside an explicit archival procedure.
- Note classes are `feature`, `bug-fix`, `simplification`, `architecture`, `process`, and `testing`.

## Documentation requirements

- Root [README.md](README.md) describes the reusable workflow; [examples/README.md](examples/README.md) maintains the example index.
- `README.md` / `README.zh.md`, `AGENTS.md` / `AGENTS.zh.md`, and `examples/README.md` / `examples/README.zh.md` are governed bilingual pairs. Update both languages together, review semantic equivalence, and refresh the adjacent `.i18n.yaml` record.
- Behavioral changes update affected READMEs, command examples, and Agent Notes together.
- Documentation states current verifiable facts and does not present a proposed Note as implemented behavior.
- File paths and commands must work from the working directory declared by their document.

## Verification

- After changing a governed repository document, run `node scripts/verify-doc-i18n.mjs`.
- After changing an example project, run its `npm run check` or the equivalent complete gate specified by its local `AGENTS.md`.
- After changing root Markdown documents, check Markdown diagnostics and relative links.
- After a lifecycle transition, rerun the Note gate and confirm no copy remains in the previous lifecycle.
- Report the checks actually run and their results. Explain any check that could not run.