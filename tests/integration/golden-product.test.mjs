import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { junitToEvidence } from '../../adapters/junit/index.mjs';
import { sarifToEvidence } from '../../adapters/sarif/index.mjs';
import { cyclonedxToEvidence } from '../../adapters/cyclonedx/index.mjs';
import { operationsToEvidence } from '../../adapters/operations/index.mjs';
import { designCriteria, verifyDesign } from '../../standard/design/index.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';

test('V1 golden booking/payment SaaS reaches OPA PASS with current external evidence', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.equal(output.compiled.requirement.changeClass, 'HIGH_RISK');
  const payment = output.compiled.solutions.find((item) => item.capability === 'payments');
  assert.equal(payment.candidate, 'stripe-payments');
  const git = collectGitEvidence();
  const commit = git.scope.commit;
  const tests = junitToEvidence('<testsuite tests="12" failures="0" errors="0" skipped="0"></testsuite>', { commit });
  const security = sarifToEvidence({ version: '2.1.0', runs: [{ results: [] }] }, { commit });
  const sbom = cyclonedxToEvidence({ bomFormat: 'CycloneDX', specVersion: '1.6', components: [{ name: 'calystr' }] }, { commit });
  const operations = operationsToEvidence({ deploy: true, rollback: true, monitoring: true, alerting: true, recovery: true, backup: true, upgrade: true, failureHandling: true }, { commit });
  const verification = Object.fromEntries(designCriteria.map((criterion) => [criterion, true]));
  assert.equal(verifyDesign({ verification }).verdict, 'PASS');
  const assessment = await evaluateAssessment({ targetRevision: commit, standard: output.compiled.standard, blockers: [], evidence: [git, tests, security, sbom, operations] });
  assert.equal(assessment.verdict, 'PASS');
  assert.deepEqual(assessment.missingEvidence, []);
});
