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

Commodity engineering gates must use mature ecosystem tools rather than bespoke scripts. Calystr currently standardises on Prettier, ESLint, TypeScript, lint-staged, markdownlint, markdown-link-check, yq, sq, CUE, OPA and Node's built-in test runner. Project-specific invariant tests may contain bespoke assertions, but they must not reimplement generic format, lint, type, link, schema, policy, security or test-runner functionality.

Before introducing a new gate, check the current mainstream tool for the relevant technology and its supported runtime. Agents must make this assessment proactively rather than waiting for a user to name the tool.

## Quality gates

- lint-staged selects changed files from the Git diff in CI and delegates checks to the underlying ecosystem tools.
- lint-staged tasks are non-mutating in CI; formatting is enforced with Prettier `--check` rather than rewriting the worktree.
- Prettier checks formatting; `npm run format:check` remains the full-repository baseline command.
- ESLint checks JavaScript and TypeScript.
- TypeScript performs static type checking of the Pi extension boundary.
- markdownlint checks Markdown structure.
- markdown-link-check checks Markdown links directly; no bespoke link-check wrapper is used.
- yq validates YAML structure in CI.
- sq independently inspects structured JSON registries in CI.
- CUE validates Calystr schemas and constraints.
- OPA is the sole policy and assessment engine.
- Node's built-in test runner executes project-specific behavioural and architecture invariant tests.
- CI uses Node 24 and the current Node-24-compatible major releases of GitHub's official checkout/setup actions.

Dependabot tracks GitHub Actions and npm quality-toolchain releases. CI must remain on supported runtimes without waiting for a user report.
