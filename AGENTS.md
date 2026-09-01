# Calystr Agent Development Contract

## Authority

The frozen Calystr V1.1 specification is the product authority. Repository structure and architecture boundaries are established in Phase 1 and must not drift during later implementation.

## Rules

1. Preserve Pi-only V1 runtime.
2. Preserve Requirement → Capability → Solution → Design → Implementation → Verification → Evidence → Assessment traceability.
3. Keep Runtime State separate from Product State.
4. Agent claims are not evidence.
5. CUE owns shape, constraint, compilation and validation; OPA owns policy decisions.
6. Git owns code revision and project history.
7. Prefer mature external solutions over hand-rolled replacements.
8. Generic engineering quality gates must use established ecosystem tooling for the project stack. Do not hand-roll formatters, linters, type-checkers, Markdown/link checkers, test runners, schema validators, policy engines, dependency scanners, security scanners, SBOM generators or equivalent commodity gates when a mature tool exists.
9. Thin configuration and composition of standard tools is allowed. Bespoke code is reserved for Calystr-specific product or architecture invariants that cannot be expressed by an established tool, and such checks must live as project tests rather than masquerading as generic tooling.
10. Before adding a gate, survey the stack's current mainstream tools and current supported CI/runtime versions; do not wait for the user to name them.
11. Do not create parallel frameworks when an established repository boundary already exists.
12. Commit coherent functional or architectural units; never commit one file merely because it is one file.
13. Do not ask users for technical facts that can be inspected or derived.
