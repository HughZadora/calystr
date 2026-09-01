import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';

test('ambiguous product intent compiles into traceable Pi product standard', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.equal(output.manifest.harness, 'pi');
  assert.ok(output.compiled.requirement.capabilities.includes('booking'));
  assert.ok(output.compiled.requirement.capabilities.includes('payments'));
  assert.ok(output.compiled.requirement.unknowns.every((item) => item.startsWith('business:')));
  assert.ok(output.compiled.verification.every((item) => item.requirementId === output.compiled.requirement.id));
});

test('payments adopt mature Stripe solution while unmatched booking remains BUILD', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  const payment = output.compiled.solutions.find((item) => item.capability === 'payments');
  const booking = output.compiled.solutions.find((item) => item.capability === 'booking');
  assert.equal(payment.candidate, 'stripe-payments');
  assert.equal(payment.decision, 'ADOPT');
  assert.equal(booking.decision, 'BUILD');
});
