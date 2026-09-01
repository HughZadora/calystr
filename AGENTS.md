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
8. Do not create parallel frameworks when an established repository boundary already exists.
9. Commit coherent functional or architectural units; never commit one file merely because it is one file.
10. Do not ask users for technical facts that can be inspected or derived.
