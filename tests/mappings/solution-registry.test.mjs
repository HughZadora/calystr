import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendSolution, evaluateSolutions } from '../../mappings/solution/index.mjs';

test('payment capability recommends mature Stripe solution with complete recommendation context', async () => {
  const recommendation = await recommendSolution({ capabilities: ['payments'], projectType: 'saas' });
  assert.equal(recommendation.candidate, 'stripe-payments');
  assert.equal(recommendation.decision, 'ADOPT');
  assert.equal(recommendation.recommendation, 'ADOPT');
  assert.ok(recommendation.advantages.length > 0);
  assert.ok(recommendation.disadvantages.length > 0);
  assert.ok(recommendation.risks.length > 0);
  assert.ok(Object.keys(recommendation.costs).length > 0);
  assert.ok(recommendation.integration?.approach);
});

test('multiple capabilities can produce COMBINE when no single mature solution covers the requirement', async () => {
  const recommendation = await recommendSolution({ capabilities: ['payments', 'authentication'], projectType: 'saas' });
  assert.equal(recommendation.decision, 'COMBINE');
  assert.deepEqual(new Set(recommendation.candidates), new Set(['stripe-payments', 'keycloak']));
  assert.equal(recommendation.fitness.coverage, 1);
});

test('unknown capability explicitly produces BUILD rather than fabricated match', async () => {
  const recommendation = await recommendSolution({ capabilities: ['quantum-booking'], projectType: 'saas' });
  assert.equal(recommendation.decision, 'BUILD');
  assert.equal(recommendation.recommendation, 'BUILD');
  assert.equal(recommendation.candidate, null);
  assert.equal(recommendation.integration, null);
});

test('disallowed licence prevents adoption', async () => {
  const ranked = await evaluateSolutions({ capabilities: ['authentication'], disallowedLicences: ['Apache-2.0'] });
  const keycloak = ranked.find((item) => item.id === 'keycloak');
  assert.equal(keycloak.fitness.licenceAllowed, false);
  assert.equal(keycloak.decision, 'BUILD');
});
