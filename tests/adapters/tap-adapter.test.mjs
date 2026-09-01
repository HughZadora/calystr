import test from 'node:test';
import assert from 'node:assert/strict';
import { tapToEvidence } from '../../adapters/junit/tap.mjs';
import { runNodeTests } from '../../adapters/junit/node-test.mjs';

test('TAP adapter normalises successful native test output', () => {
  const evidence = tapToEvidence('TAP version 13\n# Subtest: x\nok 1 - x\n1..1\n', { commit: 'abc', exitCode: 0 });
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.details.passed, 1);
});

test('TAP adapter accepts valid TAP without an explicit version header', () => {
  const evidence = tapToEvidence('# Subtest: x\nok 1 - x\n1..1\n', { commit: 'abc', exitCode: 0 });
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.details.passed, 1);
});

test('TAP adapter marks native failures as FAIL', () => {
  const evidence = tapToEvidence('TAP version 13\nnot ok 1 - x\n1..1\n', { commit: 'abc', exitCode: 1 });
  assert.equal(evidence.status, 'FAIL');
});

test('TAP adapter rejects unrelated text', () => {
  assert.throws(() => tapToEvidence('not test output', { commit: 'abc' }), /Invalid TAP output/);
});

test('Node test runner produces TAP even when invoked from within node:test', () => {
  const result = runNodeTests(['tests/fixtures/golden-compiler-behaviour.test.mjs']);
  assert.equal(result.status, 0, result.stderr);
  const evidence = tapToEvidence(result.output, { commit: 'abc', exitCode: result.status });
  assert.equal(evidence.status, 'PASS');
  assert.ok(evidence.details.passed >= 1);
});
