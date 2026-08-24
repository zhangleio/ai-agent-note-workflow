# Agent Note: Bilingual repository documents

Status: implemented

Partially superseded by [Repository document i18n gate](2026-08-24-repository-document-i18n-gate.md) for ordinary-document hash validation. Language naming, scope, complete `AGENTS.md`, and equal-authority rules remain current.

English | [中文](2026-08-24-bilingual-repository-documents.zh.md)

## Problem

The repository guide, root Agent instructions, and example index currently exist only in Simplified Chinese. English-speaking readers cannot use the workflow without translation, while agents and tooling still need the conventional `README.md` and `AGENTS.md` entry points. The repository needs an explicit naming and synchronization policy before duplicating these substantial documents.

## Decision

The repository provides equal-authority English and Simplified Chinese versions of these three document groups:

```text
README.md                 README.zh.md
AGENTS.md                 AGENTS.zh.md
examples/README.md        examples/README.zh.md
```

Each conventional unsuffixed entry point uses English and each `.zh.md` counterpart uses Simplified Chinese. Every document has a language switcher immediately below its top-level heading:

```text
English | [简体中文](README.zh.md)
[English](README.md) | 简体中文
```

Each pair has equal authority and preserves corresponding heading levels, code blocks, tables, links, commands, examples, and normative meaning. Language-local prose may use natural wording rather than sentence-by-sentence literal translation. Relative links target the appropriate language when a translated counterpart exists; links to source files and shared artifacts remain identical.

`AGENTS.md` remains a complete English instruction file because agents and tools discover the conventional name. `AGENTS.zh.md` is the complete Chinese counterpart for readers; `AGENTS.md` must not become a language-selection stub.

These ordinary documents do not have `.i18n.yaml` records or a root translation-hash gate. Synchronization relies on paired language switchers, matching document structure, Markdown diagnostics, relative-link checks, and human review. Agent Notes continue using their bilingual triplet and Git blob hash rules.

Cross-document references use the matching language where a counterpart exists. Source code, earlier Agent Note history, package metadata, generated output, and the example projects' project-specific documents remain outside this decision.

## Alternatives considered

**Keep Chinese in conventional file names and add `.en.md` files.** This minimizes movement of current content but makes the default GitHub and agent entry points Chinese-only. English conventional entry points are more interoperable for a reusable public workflow repository.

**Turn unsuffixed files into language-selection stubs.** This avoids choosing a default language, but `AGENTS.md` must contain executable instructions for automatic discovery, and a stub makes both README entry points less useful.

**Add `.i18n.yaml` hash records and a root validation script.** This provides mechanical drift detection but was explicitly declined for ordinary repository documents. Structural review and link checks keep this initial bilingual documentation change lighter; a future process Note can add a gate if drift becomes costly.

**Translate every README and AGENTS file under examples.** This would broaden the change into project-specific documentation and require decisions for each demo. The selected scope establishes bilingual repository navigation and policy first.

## Verification

All six documents have no Markdown diagnostics. A structure check confirms matching heading levels and code-fence counts for all three pairs. A fenced-code-aware link check confirms that every real relative link resolves, and a separate check confirms all three bidirectional language switchers.

An independent bilingual review found no missing sections, steps, table rows, commands, or broken links. It identified weaker Chinese wording for several normative requirements, an inaccurate `three pair files` phrase in the copyable English baseline, English placeholders inside the Chinese Note template on the English page, and a Chinese-only explanation in the example index. Both sides were corrected before the structure, link, Markdown, and whitespace checks passed again. Human implementation acceptance approved the resulting six documents.

The existing example project source and project-specific documentation were not changed, so their previously passing complete checks remain applicable and no new example behavior was introduced.

## Consequences

English and Chinese readers now have complete repository guides, Agent instructions, and example navigation. Conventional unsuffixed files provide interoperable English defaults while every top-level entry offers an immediate Chinese switcher. `AGENTS.md` remains complete for automatic discovery.

Without a translation hash gate, later edits can update only one language and create semantic drift. Structural checks cannot detect normative-strength differences such as `must` versus `should`, so bilingual human review remains necessary. GitHub and most automatic tooling show English by default, while `AGENTS.zh.md` is primarily a reader-facing counterpart.