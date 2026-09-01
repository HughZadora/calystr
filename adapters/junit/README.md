# JUnit and TAP Adapter

Normalises external test-runner output into canonical Evidence.

- `index.mjs` ingests JUnit XML.
- `tap.mjs` ingests TAP output without treating missing version headers as invalid.
- `node-test.mjs` executes Node's native test runner in an isolated environment and removes inherited `NODE_TEST_CONTEXT` so nested verification produces normal TAP rather than worker-protocol output.

All test Evidence remains revision-scoped and is validated by the central evidence integrity boundary before it can contribute to PASS.
