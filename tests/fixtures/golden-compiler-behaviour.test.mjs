import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';

test('golden intent produces booking and payment capability decisions', async () => {
  const result = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.ok(result.compiled.requirement.capabilities.includes('booking'));
  assert.ok(result.compiled.requirement.capabilities.includes('payments'));
  assert.equal(result.compiled.solutions.find((item) => item.capability === 'payments').candidate, 'stripe-payments');
});
