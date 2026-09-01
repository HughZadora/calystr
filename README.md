# Calystr

Commercial Product Standard Compiler.

Calystr compiles mature agent-engineering, product-design, commercial-engineering and verification knowledge into executable product standards for Pi.

## V1 architecture

The repository structure is frozen before feature implementation. Domain, source, mapping, standard, compiler, policy, adapter, test, example and documentation boundaries are established in Phase 1 and later phases implement within them.

## Runtime

Pi is the only V1 harness runtime.

## Development

- GitHub is the system of record.
- Work is developed on branches and integrated through pull requests.
- Commits represent coherent logical changes; file-by-file commits are prohibited.
- Structural changes require an ADR.
- Unknown verification state must remain UNKNOWN rather than becoming PASS.

See `docs/architecture/README.md` and `docs/development-plan.md`.
