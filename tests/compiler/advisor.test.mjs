import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';

test('booking intent surfaces only business decisions with recommendation and trade-offs', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.equal(output.compiled.advice.length, 2);
  assert.equal(output.compiled.quantification.readiness, 'BUSINESS_DECISION_REQUIRED');
  for (const decision of output.compiled.advice) {
    assert.equal(decision.type, 'business');
    assert.ok(decision.question);
    assert.ok(decision.options.length >= 2);
    assert.ok(decision.options.every((option) => option.tradeOffs.length > 0));
    assert.ok(decision.recommendation);
    assert.ok(decision.reason);
  }
});

test('confirmed business decisions close Requirement unknowns and make delivery readiness explicit', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment', {
    businessDecisions: {
      'business:booking-cancellation-policy': 'windowed',
      'business:multiple-service-providers': 'multiple'
    }
  });

  assert.deepEqual(output.compiled.requirement.unknowns, []);
  assert.deepEqual(output.compiled.advice, []);
  assert.equal(output.compiled.quantification.readiness, 'READY_FOR_DELIVERY');
  assert.equal(
    output.compiled.requirement.context.businessDecisions['business:booking-cancellation-policy'],
    'windowed'
  );
  assert.ok(
    output.compiled.requirement.constraints.includes(
      'business-decision:business:multiple-service-providers=multiple'
    )
  );
});

test('invalid or irrelevant business decisions are rejected instead of silently accepted', async () => {
  await assert.rejects(
    () =>
      compileIntent('Build a commercial SaaS for customer booking', {
        businessDecisions: { 'business:booking-cancellation-policy': 'never-heard-of-it' }
      }),
    /Invalid option/
  );
  await assert.rejects(
    () =>
      compileIntent('Build an authentication API', {
        businessDecisions: { 'business:booking-cancellation-policy': 'windowed' }
      }),
    /not required by this Requirement/
  );
});
