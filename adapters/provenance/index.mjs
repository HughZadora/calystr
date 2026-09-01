import { spawnSync } from 'node:child_process';
import { makeEvidence } from '../evidence.mjs';

const SLSA_PROVENANCE_V1 = 'https://slsa.dev/provenance/v1';

function assertInput(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Release provenance requires ${name}`);
}

function summariseVerification(stdout) {
  let results;
  try {
    results = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`gh attestation verify returned invalid JSON: ${error.message}`);
  }
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('gh attestation verify returned no verified attestations');
  }

  const predicateTypes = [...new Set(results.map((item) => item?.verificationResult?.statement?.predicateType).filter(Boolean))];
  const verifiedTimestamps = results.reduce(
    (count, item) =>
      count + (Array.isArray(item?.verificationResult?.verifiedTimestamps) ? item.verificationResult.verifiedTimestamps.length : 0),
    0
  );

  return {
    attestationCount: results.length,
    predicateTypes,
    verifiedTimestampCount: verifiedTimestamps
  };
}

export function collectReleaseProvenanceEvidence({ artifact, repository, revision, signerWorkflow, cwd = process.cwd(), ghPath = 'gh' }) {
  assertInput(artifact, 'artifact');
  assertInput(repository, 'repository');
  assertInput(revision, 'revision');

  const args = [
    'attestation',
    'verify',
    artifact,
    '--repo',
    repository,
    '--source-digest',
    revision,
    '--predicate-type',
    SLSA_PROVENANCE_V1,
    '--format',
    'json'
  ];
  if (signerWorkflow) args.push('--signer-workflow', signerWorkflow);

  const run = spawnSync(ghPath, args, { cwd, encoding: 'utf8' });
  if (run.error) throw new Error(`GitHub CLI is required for release provenance verification: ${run.error.message}`);

  const command = [ghPath, ...args].join(' ');
  if (run.status !== 0) {
    return makeEvidence({
      kind: 'release-provenance',
      claim: 'release-artifact-provenance-verified',
      source: 'github-attestations',
      runner: 'gh-attestation-verify',
      status: 'FAIL',
      command,
      exitCode: run.status,
      artifact,
      scope: { commit: revision },
      details: {
        repository,
        signerWorkflow: signerWorkflow ?? null,
        error: run.stderr.trim() || 'gh attestation verify failed'
      }
    });
  }

  const summary = summariseVerification(run.stdout);
  return makeEvidence({
    kind: 'release-provenance',
    claim: 'release-artifact-provenance-verified',
    source: 'github-attestations',
    runner: 'gh-attestation-verify',
    status: 'PASS',
    command,
    exitCode: 0,
    artifact,
    scope: { commit: revision },
    details: {
      repository,
      signerWorkflow: signerWorkflow ?? null,
      predicateType: SLSA_PROVENANCE_V1,
      ...summary
    }
  });
}
