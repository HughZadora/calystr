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

test('golden capability graph derives authentication, API and database support', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  const capabilities = new Set(output.compiled.capabilities.map((item) => item.definition));
  assert.ok(capabilities.has('booking'));
  assert.ok(capabilities.has('payments'));
  assert.ok(capabilities.has('authentication'));
  assert.ok(capabilities.has('api'));
  assert.ok(capabilities.has('relational-storage'));
});

test('requirement quantification derives the coverage denominator from Requirement acceptance', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  const quantification = output.compiled.quantification;
  assert.equal(quantification.requirementId, output.compiled.requirement.id);
  assert.equal(quantification.coverage.denominatorSource, 'requirement.acceptance');
  assert.equal(quantification.coverage.required, output.compiled.requirement.acceptance.length);
  assert.ok(quantification.coverage.obligations.every((item) => item.requirementId === output.compiled.requirement.id));
  assert.equal(quantification.readiness, 'BUSINESS_DECISION_REQUIRED');
});

test('implementation plan covers the full capability graph and required release evidence', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  const planned = new Set(output.compiled.implementationPlan.workstreams.map((item) => item.capabilityId));
  assert.equal(planned.size, output.compiled.capabilities.length);
  assert.ok(output.compiled.capabilities.every((capability) => planned.has(capability.id)));
  assert.deepEqual(
    output.compiled.implementationPlan.releaseReadiness.requiredEvidence,
    output.compiled.standard.requiredEvidence
  );
});

test('payments adopt mature Stripe solution while unmatched booking remains BUILD', async () => {
  const output = await compileIntent('Customer booking and online payment SaaS');
  const payment = output.compiled.solutions.find((item) => item.capability === 'payments');
  const booking = output.compiled.solutions.find((item) => item.capability === 'booking');
  assert.equal(payment.candidate, 'stripe-payments');
  assert.equal(payment.decision, 'ADOPT');
  assert.equal(booking.decision, 'BUILD');
});
