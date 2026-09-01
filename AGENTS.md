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
10. Before adding a gate or generating tool configuration, resolve the current date and platform, inspect official current support, resolve runtime requirements and verify dependency compatibility. Do not reuse stale template versions or wait for the user to name the current tool.
11. Treat user suggestions, agent suggestions and existing repository conventions as hypotheses to evaluate against product requirements and current evidence, not as automatic implementation instructions.
12. Default to the explicitly declared current supported platforms. Do not add compatibility shims, polyfills, legacy package paths or historical runtime support unless a Requirement explicitly requires that compatibility.
13. Do not merge deliberate technical debt. Escape flags, temporary compatibility layers, knowingly obsolete dependencies and deferred correctness work must be removed or treated as release blockers rather than normalized into the codebase.
14. Do not create parallel frameworks when an established repository boundary already exists.
15. Commit coherent functional or architectural units; never commit one file merely because it is one file.
16. Do not ask users for technical facts that can be inspected or derived.
