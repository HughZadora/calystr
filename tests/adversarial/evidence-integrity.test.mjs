import test from 'node:test';
import assert from 'node:assert/strict';
import { isTrustedEvidence, makeEvidence, verifyEvidenceIntegrity } from '../../adapters/evidence.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';

test('modified canonical evidence is detected and cannot PASS', async () => {
  const evidence = makeEvidence({
    kind: 'git',
    claim: 'repository-revision-observed',
    source: 'git',
    runner: 'git',
    scope: { commit: 'abc123' }
  });
  assert.equal(verifyEvidenceIntegrity(evidence), true);
  const tampered = { ...evidence, scope: { commit: 'different' } };
  assert.equal(verifyEvidenceIntegrity(tampered), false);
  const result = await evaluateAssessment({
    targetRevision: 'abc123',
    standard: { requiredEvidence: ['git'] },
    blockers: [],
    evidence: [tampered]
  });
  assert.equal(result.verdict, 'FAIL');
});

test('fake runner evidence remains UNKNOWN rather than PASS', async () => {
  const fake = makeEvidence({
    kind: 'git',
    claim: 'fake-revision',
    source: 'attacker',
    runner: 'fake-runner',
    scope: { commit: 'abc123' }
  });
  const result = await evaluateAssessment({
    targetRevision: 'abc123',
    standard: { requiredEvidence: ['git'] },
    blockers: [],
    evidence: [fake]
  });
  assert.equal(result.verdict, 'UNKNOWN');
  assert.ok(result.untrustedEvidence.includes('fake-revision'));
});

test('release provenance trusts only the GitHub attestation verifier boundary', () => {
  const trusted = makeEvidence({
    kind: 'release-provenance',
    claim: 'release-artifact-provenance-verified',
    source: 'github-attestations',
    runner: 'gh-attestation-verify',
    scope: { commit: 'abc123' }
  });
  const imitation = { ...trusted, runner: 'calystr-provenance-check' };
  assert.equal(isTrustedEvidence(trusted), true);
  assert.equal(isTrustedEvidence(imitation), false);
});
