import test from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectReleaseProvenanceEvidence } from '../../adapters/provenance/index.mjs';
import { isTrustedEvidence, verifyEvidenceIntegrity } from '../../adapters/evidence.mjs';

async function fakeGh(source) {
  const dir = await mkdtemp(join(tmpdir(), 'calystr-gh-'));
  const path = join(dir, 'gh');
  await writeFile(path, `#!/usr/bin/env node\n${source}\n`);
  await chmod(path, 0o755);
  return { dir, path };
}

test('release provenance delegates verification to gh and produces trusted revision-scoped evidence', async () => {
  const revision = '0123456789abcdef0123456789abcdef01234567';
  const { dir, path } = await fakeGh(`
const args = process.argv.slice(2);
const required = ['attestation', 'verify', 'dist/calystr.tgz', '--repo', 'HughZadora/calystr', '--source-digest', '${revision}', '--predicate-type', 'https://slsa.dev/provenance/v1', '--format', 'json'];
if (required.some((value) => !args.includes(value))) process.exit(9);
process.stdout.write(JSON.stringify([{ verificationResult: { statement: { predicateType: 'https://slsa.dev/provenance/v1' }, verifiedTimestamps: [{ type: 'rekor' }], signature: { certificate: { sourceRepository: 'HughZadora/calystr' } } } }]));
`);

  try {
    const evidence = collectReleaseProvenanceEvidence({
      artifact: 'dist/calystr.tgz',
      repository: 'HughZadora/calystr',
      revision,
      signerWorkflow: 'HughZadora/calystr/.github/workflows/release-provenance.yml',
      ghPath: path
    });

    assert.equal(evidence.kind, 'release-provenance');
    assert.equal(evidence.status, 'PASS');
    assert.equal(evidence.scope.commit, revision);
    assert.equal(evidence.details.attestationCount, 1);
    assert.deepEqual(evidence.details.predicateTypes, ['https://slsa.dev/provenance/v1']);
    assert.equal(evidence.details.verifiedTimestampCount, 1);
    assert.equal(verifyEvidenceIntegrity(evidence), true);
    assert.equal(isTrustedEvidence(evidence), true);
    assert.match(evidence.command, /--source-digest/);
    assert.match(evidence.command, /--signer-workflow/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('failed external provenance verification produces trusted FAIL evidence', async () => {
  const { dir, path } = await fakeGh(`process.stderr.write('verification failed'); process.exit(1);`);
  try {
    const evidence = collectReleaseProvenanceEvidence({
      artifact: 'dist/calystr.tgz',
      repository: 'HughZadora/calystr',
      revision: '0123456789abcdef0123456789abcdef01234567',
      ghPath: path
    });
    assert.equal(evidence.status, 'FAIL');
    assert.equal(evidence.details.error, 'verification failed');
    assert.equal(verifyEvidenceIntegrity(evidence), true);
    assert.equal(isTrustedEvidence(evidence), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
