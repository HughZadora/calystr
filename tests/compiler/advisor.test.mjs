import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';

test('booking intent surfaces only business decisions with recommendation and trade-offs', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.equal(output.compiled.advice.length, 2);
  for (const decision of output.compiled.advice) {
    assert.equal(decision.type, 'business');
    assert.ok(decision.question);
    assert.ok(decision.options.length >= 2);
    assert.ok(decision.options.every((option) => option.tradeOffs.length > 0));
    assert.ok(decision.recommendation);
    assert.ok(decision.reason);
  }
});
