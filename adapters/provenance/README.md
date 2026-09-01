# Release provenance adapter

Calystr does not implement attestation cryptography itself. Release provenance is verified by GitHub CLI against GitHub artifact attestations and Sigstore, then normalised into revision-scoped Calystr Evidence.

The adapter executes `gh attestation verify` with the repository, expected source commit and SLSA provenance predicate pinned as verification policy. A successful external verification becomes trusted `release-provenance` Evidence; a failed verification becomes trusted FAIL Evidence.

For stronger identity binding, callers should also provide the expected signer workflow. Calystr never converts an unverified attestation bundle or agent claim directly into PASS evidence.
