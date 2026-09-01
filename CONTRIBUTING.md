# Contributing

Calystr is developed through GitHub branches and pull requests.

## Change discipline

- Keep changes inside the established architecture boundaries.
- A top-level structural change requires an ADR before implementation.
- Each commit must represent a coherent architectural or functional unit.
- One-file-per-commit development is prohibited.
- Tests must accompany behavioural changes.
- CI must not modify the working tree.

## Quality gates

- Prettier checks formatting on changed JavaScript, TypeScript, JSON, JSONC, and Markdown files.
- ESLint checks changed JavaScript and TypeScript files through the pinned TypeScript parser toolchain.
- TypeScript 6.0.x is pinned for ESLint parser compatibility until typescript-eslint supports the TypeScript 7 API.
- markdownlint checks changed Markdown files.
- markdown-link-check checks links in changed Markdown files; `npm run lint:links` checks all repository Markdown.
- yq validates YAML structure in CI.
- sq parses array-shaped repository JSON registries in CI as an independent structured-data check.
- CI uses Node 22 for the quality toolchain and Go 1.26 for current yq/sq compatibility.
- `npm run quality:changed` runs the changed-file quality gate used by CI.
