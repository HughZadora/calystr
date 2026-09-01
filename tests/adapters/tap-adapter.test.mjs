import test from 'node:test';
import assert from 'node:assert/strict';
import { tapToEvidence } from '../../adapters/junit/tap.mjs';

test('TAP adapter normalises successful native test output', () => {
  const evidence = tapToEvidence('TAP version 13\n# Subtest: x\nok 1 - x\n1..1\n', { commit: 'abc', exitCode: 0 });
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.details.passed, 1);
});

test('TAP adapter marks native failures as FAIL', () => {
  const evidence = tapToEvidence('TAP version 13\nnot ok 1 - x\n1..1\n', { commit: 'abc', exitCode: 1 });
  assert.equal(evidence.status, 'FAIL');
});
