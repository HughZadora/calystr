# Architecture

Phase 1 fixes the repository topology and framework before later implementation.

## Core ownership

- `model/`: Calystr domain truth.
- `sources/`: source metadata and provenance.
- `mappings/`: external-knowledge-to-Calystr meaning.
- `standard/`: executable product-standard semantics.
- `compiler/`: Source → Mapping → Model → Standard → Package.
- `policy/`: OPA decision boundary.
- `adapters/`: Pi and external evidence/runtime integrations.
- `tests/`: boundary, integration and adversarial verification.

Runtime state is Session/Goal/Run/Round/Step/Handoff. Product state is Requirement/Design/Implementation/Evidence/Assessment. They remain separate.
