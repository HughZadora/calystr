# Calystr

Commercial Product Standard Compiler.

Calystr compiles mature agent-engineering, product-design, commercial-engineering and verification knowledge into an executable product standard for Pi.

## Install in Pi

```bash
pi install git:github.com/HughZadora/calystr@v1.0.0
```

The package wires the Calystr Pi extension and Calystr intent/delivery skills through `package.json`.

## Use in Pi

```text
/calystr Build a commercial SaaS for customer booking and online payment
```

Calystr compiles the intent into Requirement, Capability, mature-solution decisions, Design, verification and the Pi harness contract. Technical facts are inspected by the harness; only business judgement remains for the user.

## CLI

```bash
calystr compile "Build a commercial SaaS for customer booking and online payment"
calystr init "Build a commercial SaaS for customer booking and online payment"
calystr audit
calystr assess assessment-input.json
calystr golden
```

`init` creates only `.calystr/manifest.json` and `.calystr/lock.json` in the target project. Git remains project history. OPA is the final assessment engine; agent claims are not evidence and stale evidence cannot PASS.

## Release provenance

Release packaging is attested with GitHub artifact attestations and Sigstore by the `Release provenance` workflow. Calystr does not implement attestation cryptography itself.

A release artifact can be externally verified with GitHub CLI while binding the verification to the expected repository and source revision:

```bash
gh attestation verify calystr-1.0.0.tgz --repo HughZadora/calystr --source-digest <commit> --format json
```

The Calystr provenance adapter executes this external verification and normalises the result into revision-scoped `release-provenance` Evidence. `CRITICAL` changes therefore require a real verified release attestation rather than an agent claim or an unverified bundle.

## Development

GitHub is the system of record. Architecture is frozen before implementation; later work stays inside established boundaries. Commits are coherent logical units, never file-by-file commits.
