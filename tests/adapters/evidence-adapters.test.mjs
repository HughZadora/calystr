import test from 'node:test';
import assert from 'node:assert/strict';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { junitToEvidence } from '../../adapters/junit/index.mjs';
import { sarifToEvidence } from '../../adapters/sarif/index.mjs';
import { cyclonedxToEvidence } from '../../adapters/cyclonedx/index.mjs';

test('Git evidence is revision-scoped and digested', () => {
  const evidence = collectGitEvidence();
  assert.match(evidence.scope.commit, /^[0-9a-f]{40}$/);
  assert.match(evidence.digest, /^sha256:/);
});

test('JUnit failures produce FAIL evidence', () => {
  const evidence = junitToEvidence('<testsuite tests="2" failures="1" errors="0" skipped="0"></testsuite>', { commit: 'abc' });
  assert.equal(evidence.status, 'FAIL');
  assert.equal(evidence.details.failures, 1);
});

test('SARIF error results produce FAIL security evidence', () => {
  const evidence = sarifToEvidence({ version: '2.1.0', runs: [{ results: [{ level: 'error' }] }] }, { commit: 'abc' });
  assert.equal(evidence.kind, 'security');
  assert.equal(evidence.status, 'FAIL');
});

test('CycloneDX BOM produces SBOM evidence', () => {
  const evidence = cyclonedxToEvidence({ bomFormat: 'CycloneDX', specVersion: '1.6', components: [{ name: 'x' }] }, { commit: 'abc' });
  assert.equal(evidence.kind, 'sbom');
  assert.equal(evidence.details.components, 1);
});
