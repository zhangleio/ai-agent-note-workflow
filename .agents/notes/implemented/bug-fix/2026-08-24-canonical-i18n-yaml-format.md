# Agent Note: Canonical i18n YAML format

Status: implemented

English | [中文](2026-08-24-canonical-i18n-yaml-format.zh.md)

## Problem

The repository wrote `.i18n.yaml` consistency records as JSON objects with braces, quoted keys, and commas. JSON is a YAML 1.2 subset, but this representation did not match the DeepSeek Harness convention this workflow is intended to demonstrate: explanatory YAML comments followed by exact `<basename>.md: <40-hex>` mappings. The validators reinforced the wrong representation by calling `JSON.parse`, and the root guide explicitly recommended JSON syntax.

Thirteen active or non-frozen records across the root repository and both examples required migration. One archived record in `agent-workflow-demo` is frozen by its archive manifest and retains its original bytes.

## Decision

Every active, proposed, implemented, and rejected `.i18n.yaml` record uses the canonical sidecar format:

```yaml
# Bilingual-pair consistency record: the git blob hash of each side as of the
# last confirmed-consistent state. Both languages carry equal authority.
example.md: 0123456789abcdef0123456789abcdef01234567
example.zh.md: 89abcdef0123456789abcdef0123456789abcdef
```

Keys are unquoted local Markdown basenames. Values are lowercase 40-character hexadecimal Git blob SHA-1 values. Blank lines and comment lines beginning with `#` are allowed; every other line must match exactly `<basename>.md: <40-hex>`. Duplicate keys, unknown keys, malformed hashes, braces, quoted keys, commas, and nested YAML are rejected.

The root document validator and both example Agent Note validators use small zero-dependency parsers for this exact format instead of `JSON.parse`. The root and text-statistics validators require canonical YAML for every record. The todo example validator requires canonical YAML for non-archived records and accepts the frozen archived JSON-form record only when validating the archived lifecycle. Its archive SHA-256 manifest remains unchanged.

The thirteen pre-existing non-frozen records were converted to canonical mappings with concise explanatory comments and commands appropriate to their owning project. This implemented Note adds the fourteenth canonical record. The English and Chinese root guides, root Agent instructions, and the earlier implemented process Note now specify canonical mapping syntax instead of JSON-compatible YAML. Affected consistency hashes were refreshed after synchronized review.

## Alternatives considered

**Keep JSON-compatible YAML.** It parses as YAML 1.2, but it was the reported defect and did not demonstrate the intended Harness convention.

**Add a general YAML dependency.** The records use only comments and two scalar mappings. A strict format-specific parser is smaller, deterministic, and rejects unsupported YAML features rather than silently accepting them.

**Rewrite the archived sidecar and archive manifest.** This would make every file visually uniform but violate the repository's frozen archive guarantee. Historical bytes take precedence over cosmetic uniformity.

**Accept both formats everywhere.** This would preserve the incorrect active representation indefinitely. Legacy acceptance is limited to the one frozen archived record.

## Verification

After the root validator switched to canonical parsing, `node scripts/verify-doc-i18n.mjs` rejected the existing JSON-form `README.i18n.yaml` with `consistency record must use canonical YAML mappings`. After both example validators switched, their focused Note checks rejected the first non-archived JSON-form records with the same error. These failing-before checks proved that active JSON object syntax was no longer accepted.

After migration, `node scripts/verify-doc-i18n.mjs` reported `Verified 3 bilingual document pair(s).` The complete `npm --prefix examples/agent-workflow-demo run check` gate verified 7 Agent Note pairs, built successfully, and passed all 18 tests. The complete `npm --prefix examples/text-stats-workflow-demo run check` gate verified 2 Agent Note pairs, built successfully, and passed all 25 tests.

A repository-wide format assertion found 15 sidecars: 14 canonical records and exactly one frozen archived legacy record. The archived manifest continued to pass the todo example gate. Markdown and script diagnostics reported no errors, `git diff --check` reported no whitespace errors, and separate human implementation review accepted the result.

## Consequences

Active consistency records now visibly match the Harness convention and reject unsupported YAML forms deterministically without adding a dependency. Future metadata fields require a new decision and parser change because the parser intentionally supports only comments and two scalar mappings.

The todo validator retains one narrowly scoped lifecycle branch for the frozen archived JSON record. This exception adds a small maintenance cost but preserves the stronger archive immutability guarantee and does not permit legacy syntax in active records.