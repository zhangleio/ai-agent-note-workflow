# Example Projects

English | [简体中文](README.zh.md)

This directory contains two independently installable, buildable, and testable Agent Note workflow examples. Use them as structural references when creating a new project.

This index is a governed bilingual document. Update [the Chinese counterpart](README.zh.md) in the same change and run `node ../scripts/verify-doc-i18n.mjs` from this directory after refreshing `README.i18n.yaml`.

## agent-workflow-demo

[agent-workflow-demo](agent-workflow-demo/) is a todo CLI that demonstrates a broad requirement evolution history, including:

- Agent Notes from different classes such as feature, bug-fix, and simplification;
- proposed, implemented, rejected, and archived lifecycles;
- equal-authority English and Chinese documents with a Git blob hash consistency gate;
- persistence format migration, feature withdrawal, and rule supersession;
- focused tests, complete checks, and human implementation acceptance.

Run its complete check:

```powershell
cd agent-workflow-demo
npm install
npm run check
```

## text-stats-workflow-demo

[text-stats-workflow-demo](text-stats-workflow-demo/) is a text statistics CLI that demonstrates the complete feature workflow from requirement clarification and proposal revision through implementation acceptance, including:

- line, word, and Unicode character statistics for one file;
- recursive directory line counts for multiple file extensions;
- boundary decisions about defaults, CLI arguments, error compatibility, and symbolic links;
- focused validation after layered implementation and real subprocess tests;
- moving an Agent Note triplet from proposed to implemented.

See the [project README](text-stats-workflow-demo/README.md) for CLI usage. This example currently provides only that project-specific README.

Run its complete check:

```powershell
cd text-stats-workflow-demo
npm install
npm run check
```

Both examples require Node.js 22 or later. `node_modules` and `dist` are local dependencies and build outputs, not reference source.