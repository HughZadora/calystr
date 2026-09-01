# Contributing

Calystr is developed through GitHub branches and pull requests.

## Change discipline

- Keep changes inside the established architecture boundaries.
- A top-level structural change requires an ADR before implementation.
- Each commit must represent a coherent architectural or functional unit.
- One-file-per-commit development is prohibited.
- Tests must accompany behavioural changes.
- CI must not modify the working tree.

## Tooling policy

Commodity engineering gates must use mature ecosystem tools rather than bespoke scripts. Calystr currently standardises on Prettier, ESLint, TypeScript, markdownlint, markdown-link-check, yq, sq, CUE, OPA and Node's built-in test runner. Project-specific invariant tests may contain bespoke assertions, but they must not reimplement generic format, lint, type, link, schema, policy, security or test-runner functionality.

Before introducing a new gate, check the current mainstream tool for the relevant technology and its supported runtime. Agents must make this assessment proactively rather than waiting for a user to name the tool.

## Quality gates

- Prettier checks repository formatting.
- ESLint checks JavaScript and TypeScript.
- TypeScript performs static type checking of the Pi extension boundary.
- markdownlint checks Markdown structure.
- markdown-link-check checks repository Markdown links directly; no wrapper implementation is used.
- yq validates YAML structure in CI.
- sq independently inspects structured JSON registries in CI.
- CUE validates Calystr schemas and constraints.
- OPA is the sole policy and assessment engine.
- Node's built-in test runner executes project-specific behavioural and architecture invariant tests.
- CI uses Node 24 and the current Node-24-compatible major releases of GitHub's official checkout/setup actions.

Run `npm run quality` for the standard JavaScript/TypeScript/Markdown quality suite and `npm test` for project tests.
