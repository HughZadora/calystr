# Changelog

## Unreleased

- Made current date/platform discovery, official support lookup, runtime resolution and dependency compatibility mandatory before configuration generation.
- Standardised commodity quality gates on maintained stack-native ecosystem tooling and moved GitHub Actions onto Node-24-compatible action generations.
- Added GitHub/Sigstore release provenance generation and `gh attestation verify` evidence normalisation so `CRITICAL` changes can satisfy the required `release-provenance` gate without custom cryptography.
- Migrated the repository to pnpm 12.1.0 with Node 24.20.0 runtime pinning, frozen dependency locking, one-day package maturity enforcement and no legacy peer-dependency escape paths.
- Replaced ceremonial yq/sq CI checks with stack-specific actionlint, zizmor, Gitleaks, OSV-Scanner, Knip, publint, c8 and native pnpm CycloneDX SBOM verification.
- Advanced the CUE validation toolchain and module language target from 0.14 to the current stable 0.17 line.

## 1.0.0

- Frozen complete repository architecture before feature implementation.
- Added canonical Requirement/Capability/Solution/Design/Standard/Evidence/Assessment contracts.
- Added Pi runtime contract and bounded handoff semantics.
- Added CUE schemas and OPA-only assessment gate.
- Added agent/design/commercial mappings and mature-solution registry.
- Added Git, JUnit, SARIF and CycloneDX evidence adapters.
- Added deterministic design verification.
- Added executable compiler, CLI, Pi extension/skills and golden booking/payment SaaS flow.
