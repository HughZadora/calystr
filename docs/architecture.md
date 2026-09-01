# Architecture

## Architectural rule

Calystr establishes its repository topology and layer boundaries before feature implementation. Later phases implement contracts inside this topology; they do not introduce parallel frameworks.

## Layer boundaries

### Domain
`src/calystr/model/` contains the canonical product knowledge model. It owns stable domain concepts and their relationships.

### Sources and mappings
`src/calystr/sources/` and `src/calystr/mappings/` contain source knowledge and controlled mappings into the domain model.

### Standard
`src/calystr/standard/` contains standard composition and standard-level semantics.

### Compiler
`src/calystr/compiler/` transforms validated domain and standard knowledge into executable artefacts. Compilation is a boundary, not a place to redefine domain semantics.

### Policy
`src/calystr/policy/` owns policy and assessment constraints. Policy decisions remain explicit and testable.

### Adapters
`src/calystr/adapters/` isolates integrations such as Pi runtime and evidence systems from core domain semantics.

### Tests
`tests/` mirrors architectural boundaries and provides contract, integration and golden-product coverage.

## Phase boundary

Phase 1 establishes the complete topology and the domain foundation. Phase 2 introduces the Agent Runtime Contract. Subsequent phases must consume these boundaries rather than move them.

## Structural change rule

Any change to a top-level architectural boundary requires an Architecture Decision Record under `docs/decisions/` before implementation.
