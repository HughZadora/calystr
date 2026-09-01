# ADR 0002 — Freeze complete Phase 1 repository framework

## Status
Accepted

## Context
The initial foundation used a partial `src/calystr` layout and deferred several top-level boundaries. This creates the architectural drift Phase 1 is intended to prevent.

## Decision
Phase 1 establishes the complete V1 repository topology from the frozen specification in one coherent structural change. Domain, source, mapping, standard, compiler, policy, adapter, test, example, documentation and package-framework boundaries are present before later phase implementation begins. The competing `src/` and provisional Python framework are removed.

## Consequences
Later phases implement inside these directories. A new top-level framework requires a new ADR and must not create a parallel semantic authority.
