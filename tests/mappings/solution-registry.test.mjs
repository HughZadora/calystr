import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendSolution, evaluateSolutions } from '../../mappings/solution/index.mjs';

test('payment capability recommends mature Stripe solution', async () => {
  const recommendation = await recommendSolution({ capabilities: ['payments'], projectType: 'saas' });
  assert.equal(recommendation.candidate, 'stripe-payments');
  assert.equal(recommendation.decision, 'ADOPT');
  assert.ok(recommendation.advantages.length > 0);
});

test('unknown capability explicitly produces BUILD rather than fabricated match', async () => {
  const recommendation = await recommendSolution({ capabilities: ['quantum-booking'], projectType: 'saas' });
  assert.equal(recommendation.decision, 'BUILD');
  assert.equal(recommendation.candidate, null);
});

test('disallowed licence prevents adoption', async () => {
  const ranked = await evaluateSolutions({ capabilities: ['authentication'], disallowedLicences: ['Apache-2.0'] });
  const keycloak = ranked.find((item) => item.id === 'keycloak');
  assert.equal(keycloak.fitness.licenceAllowed, false);
});
