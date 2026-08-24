# Agent Note: MIT License

Status: implemented

English | [中文](2026-08-24-mit-license.zh.md)

## Problem

The repository had no root license file, so recipients did not have an explicit grant to use, copy, modify, merge, publish, distribute, sublicense, or sell the repository's original work. The intended open-source terms needed to be stated in a standard file that hosting platforms and automated scanners can recognize.

## Decision

The root `LICENSE` contains the standard MIT License text with:

```text
Copyright (c) 2026 zhangleio
```

The license applies to original work in this repository unless a file or directory states different terms. It does not replace or relicense third-party notices, vendored content, dependencies, or material already governed by another license.

Per the selected scope, the English and Chinese READMEs do not add a License section. GitHub and common license scanners can identify the root `LICENSE` directly, keeping the change limited to the requested legal artifact. Source files do not receive SPDX headers.

## Alternatives considered

**Remain unlicensed.** This would preserve full default copyright restrictions but prevent the intended broad reuse and contribution rights.

**Use Apache-2.0.** It provides an explicit patent grant and more conditions, but the requested license is MIT and the additional terms are not needed for this repository decision.

**Add README License sections.** This would improve visibility, but the selected scope is to add only the canonical root file and avoid unrelated bilingual documentation changes.

**Add SPDX headers to every source file.** This would create broad mechanical churn and is unnecessary for a repository-level MIT grant.

## Verification

A focused content check confirmed the `MIT License` title, the exact `Copyright (c) 2026 zhangleio` line, the standard permission grant, notice-retention condition, warranty disclaimer, and liability limitation after normalizing Windows line endings. Git status confirmed that `LICENSE` was the only implementation file beyond this Note triplet; no README, source header, third-party notice, vendored file, or separate license changed.

`node scripts/verify-doc-i18n.mjs` verified all 3 governed bilingual document pairs. `npm --prefix examples/agent-workflow-demo run check` verified 7 Agent Note pairs, built successfully, and passed all 18 tests. `npm --prefix examples/text-stats-workflow-demo run check` verified 2 Agent Note pairs, built successfully, and passed all 25 tests. `git diff --check` reported no whitespace errors. Separate human implementation review accepted the result.

## Consequences

Recipients now have the permissions and conditions of the MIT License for the repository's original work. Copies or substantial portions must preserve the copyright and permission notices, and the work is provided without warranty under the standard MIT terms.

Rights already granted to recipients under the MIT License cannot reliably be withdrawn from their copies. The root license does not override third-party or separately stated terms. Because the selected scope omits README sections and source headers, license discovery relies on the conventional root filename and hosting or scanning support.