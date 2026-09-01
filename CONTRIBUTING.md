# Contributing

Calystr is developed through GitHub branches and pull requests.

## Change discipline

- Keep changes inside the established architecture boundaries.
- A top-level structural change requires an ADR before implementation.
- Each commit must represent a coherent architectural or functional unit.
- One-file-per-commit development is prohibited.
- Tests must accompany behavioural changes.
- CI must not modify the working tree.
- Deliberate technical debt is not an acceptable merge strategy. Temporary compatibility layers, obsolete dependencies, escape flags and deferred correctness work must be removed before merge or recorded as release blockers.
- Compatibility is requirement-driven. Calystr targets explicitly declared current supported platforms and does not preserve undeclared historical runtime or dependency compatibility.

## Tooling policy

Commodity engineering gates must use mature ecosystem tools rather than bespoke scripts. Project-specific invariant tests may contain bespoke assertions, but they must not reimplement generic format, lint, type, link, schema, policy, security or test-runner functionality.

Before introducing a new gate or generating its configuration, resolve the current date and platform, check the relevant tool's official current support, resolve runtime requirements and verify dependency compatibility. User suggestions, existing repository conventions and agent memory are inputs to assess rather than automatic authority.

Package updates are not selected by version number alone. Calystr requires supported, compatible and supply-chain-mature releases. The pnpm workspace enforces a minimum release age; when the newest release is too young or has a known regression, use the newest mature compatible release instead of adding a permanent exception.

## Package and runtime baseline

- pnpm is the package manager. CI uses pnpm 12.1.0 and `pnpm-lock.yaml` with frozen installs.
- Node 24.20.0 is the development runtime and is declared once through `devEngines.runtime`.
- Dependency installation in CI ignores lifecycle scripts and never uses legacy peer-dependency escape flags.
- pnpm's minimum-release-age policy rejects freshly published packages until they have aged for at least one day.

## Quality and security gates

- lint-staged selects changed files from the Git diff in CI and delegates checks to the underlying ecosystem tools.
- Prettier checks formatting with a 120-column print width.
- ESLint checks JavaScript and TypeScript.
- TypeScript performs static type checking of the Pi extension boundary.
- markdownlint checks Markdown structure.
- markdown-link-check checks Markdown links directly; no bespoke link-check wrapper is used.
- Knip detects unused files, exports and dependency drift.
- publint verifies the package publication contract.
- c8 measures native V8 test coverage; coverage thresholds are derived from the measured repository baseline rather than invented before measurement.
- actionlint validates GitHub Actions syntax, expressions and shell integration.
- zizmor audits GitHub Actions security; third-party actions are pinned to immutable commit SHAs.
- Gitleaks scans repository history only after a synthetic canary proves the installed scanner can detect a known fake secret shape.
- OSV-Scanner checks the frozen pnpm lockfile for known dependency vulnerabilities.
- pnpm's native `sbom` command generates the CycloneDX SBOM; Calystr does not install a redundant npm-specific CycloneDX generator.
- CUE validates Calystr schemas and constraints.
- OPA is the sole policy and assessment engine. Its downloaded binary is checksum-verified before execution.
- Node's built-in test runner executes project-specific behavioural and architecture invariant tests.

Dependabot tracks GitHub Actions and package-toolchain releases. Automated updates remain candidates: they are merged only after current support, compatibility, maturity, known-regression review and full CI evidence are verified.
