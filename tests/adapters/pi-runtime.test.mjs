import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandoff, createRuntimeTrace, validateHarnessCapabilities, requiredHarnessCapabilities } from '../../adapters/pi/runtime-contract.mjs';

test('bounded handoff preserves only contract fields', () => {
  const handoff = createHandoff({ status: 'ACTIVE', summary: 'Booking implementation in progress', verified: ['schema'], nextSteps: ['integration test'] });
  assert.deepEqual(Object.keys(handoff), ['status', 'summary', 'verified', 'openItems', 'blockers', 'nextSteps']);
});

test('runtime trace requires positive round and step', () => {
  assert.throws(() => createRuntimeTrace({ sessionId: 'S1', goalId: 'G1', runId: 'R1', round: 0, step: 1 }));
  assert.equal(createRuntimeTrace({ sessionId: 'S1', goalId: 'G1', runId: 'R1', round: 1, step: 2 }).step, 2);
});

test('harness capability validation reports missing capabilities', () => {
  assert.deepEqual(validateHarnessCapabilities(requiredHarnessCapabilities), []);
  assert.deepEqual(validateHarnessCapabilities(['session']), requiredHarnessCapabilities.slice(1));
});
