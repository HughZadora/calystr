import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySurface, designCriteria, verifyDesign, requiredInteractionStates } from '../../standard/design/index.mjs';

test('surface mode is attached to surface context', () => {
  assert.equal(classifySurface({ kind: 'landing' }), 'PERSUADE');
  assert.equal(classifySurface({ kind: 'dashboard' }), 'OPERATE');
});

test('complete deterministic design verification passes', () => {
  const verification = Object.fromEntries(designCriteria.map((criterion) => [criterion, true]));
  assert.equal(verifyDesign({ verification }).verdict, 'PASS');
});

test('unknown design evidence remains UNKNOWN', () => {
  const result = verifyDesign({ verification: { accessibility: true } });
  assert.equal(result.verdict, 'UNKNOWN');
});

test('explicit failed accessibility fails design verification', () => {
  const verification = Object.fromEntries(designCriteria.map((criterion) => [criterion, true]));
  verification.accessibility = false;
  assert.equal(verifyDesign({ verification }).verdict, 'FAIL');
});

test('interaction contract includes recovery and loading states', () => {
  const states = requiredInteractionStates('OPERATE');
  assert.ok(states.includes('recovery'));
  assert.ok(states.includes('loading'));
});
