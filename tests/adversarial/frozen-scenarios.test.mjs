import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';
import { validateCompiledProduct } from '../../compiler/validate/index.mjs';
import { validateProjectBinding } from '../../compiler/package/binding.mjs';
import { validateMappings } from '../../mappings/index.mjs';
import { composeStandard } from '../../standard/index.mjs';
import { makeEvidence, verifyEvidenceIntegrity } from '../../adapters/evidence.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';

async function compiledGolden() {
  return structuredClone((await compileIntent('Build a commercial SaaS for customer booking and online payment')).compiled);
}

test('fake Requirement cannot pass compiler validation', async () => {
  const compiled = await compiledGolden();
  compiled.requirement.intent = '';
  await assert.rejects(() => validateCompiledProduct(compiled), /real Requirement/);
});

test('fake Solution candidate cannot pass compiler validation', async () => {
  const compiled = await compiledGolden();
  compiled.solutions[0] = {
    ...compiled.solutions[0],
    decision: 'ADOPT',
    recommendation: 'ADOPT',
    candidate: 'fabricated-solution',
    candidates: ['fabricated-solution'],
    integration: { approach: 'fabricated' },
    advantages: [],
    disadvantages: []
  };
  await assert.rejects(() => validateCompiledProduct(compiled), /Unknown Solution candidate/);
});

test('fake Evidence from an untrusted runner remains UNKNOWN', async () => {
  const fake = makeEvidence({
    kind: 'git',
    claim: 'fake-revision',
    source: 'agent-claim',
    runner: 'agent',
    scope: { commit: 'abc123' }
  });
  const result = await evaluateAssessment({
    targetRevision: 'abc123',
    standard: { requiredEvidence: ['git'] },
    blockers: [],
    evidence: [fake]
  });
  assert.equal(result.verdict, 'UNKNOWN');
});

test('stale or wrong-revision Evidence cannot satisfy the target revision', async () => {
  const stale = makeEvidence({
    kind: 'git',
    claim: 'repository-revision-observed',
    source: 'git',
    runner: 'git',
    scope: { commit: 'old-revision' }
  });
  const result = await evaluateAssessment({
    targetRevision: 'current-revision',
    standard: { requiredEvidence: ['git'] },
    blockers: [],
    evidence: [stale]
  });
  assert.equal(result.verdict, 'UNKNOWN');
  assert.deepEqual(result.missingEvidence, ['git']);
});

test('modified Evidence artifact invalidates canonical Evidence integrity', () => {
  const evidence = makeEvidence({
    kind: 'tests',
    claim: 'test-execution',
    source: 'tap',
    runner: 'tap-adapter',
    artifact: 'original.tap',
    scope: { commit: 'abc123' }
  });
  assert.equal(verifyEvidenceIntegrity({ ...evidence, artifact: 'modified.tap' }), false);
});

test('invalid package binding cannot disagree between manifest and lock', () => {
  assert.throws(
    () =>
      validateProjectBinding({
        manifest: { standard: '@calystr/std-commercial-product', version: '1.0.0', digest: 'sha256:a', projectType: 'saas' },
        lock: { standard: '@calystr/std-commercial-product', version: '2.0.0', digest: 'sha256:b' }
      }),
    /manifest\/lock mismatch/
  );
});

test('policy weakening to zero required evidence cannot produce PASS', async () => {
  const result = await evaluateAssessment({
    targetRevision: 'abc123',
    requirementCoverage: { required: 1, verified: 1, failed: 0 },
    standard: { requiredEvidence: [] },
    blockers: [],
    evidence: []
  });
  assert.notEqual(result.verdict, 'PASS');
  assert.notEqual(result.commercialReadiness, 'PASS');
});

test('unsupported Standard profile is rejected', async () => {
  await assert.rejects(() => composeStandard({ profile: 'unsupported-standard' }), /Unknown standard profile/);
});

test('invalid Mapping is rejected before compilation', () => {
  assert.throws(
    () =>
      validateMappings([
        {
          id: 'MAP-FAKE',
          source: 'fake',
          sourceLayer: 'agent',
          concept: 'fake',
          target: 'fake',
          meaning: 'fake',
          outputs: []
        }
      ]),
    /must declare outputs/
  );
});

test('missing Verification for any Capability is rejected', async () => {
  const compiled = await compiledGolden();
  compiled.verification = compiled.verification.slice(1);
  await assert.rejects(() => validateCompiledProduct(compiled), /Missing verification/);
});
