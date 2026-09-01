import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent } from '../../compiler/index.mjs';
import { composeStandard } from '../../standard/index.mjs';

test('UI product contexts require design evidence while non-UI contexts do not invent it', async () => {
  const saas = await composeStandard({ changeClass: 'HIGH_RISK', projectType: 'saas' });
  const web = await composeStandard({ changeClass: 'STANDARD', projectType: 'web' });
  const node = await composeStandard({ changeClass: 'STANDARD', projectType: 'node' });

  assert.ok(saas.requiredEvidence.includes('design'));
  assert.ok(web.requiredEvidence.includes('design'));
  assert.equal(node.requiredEvidence.includes('design'), false);
});

test('golden SaaS compilation carries contextual design evidence into release readiness', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment', {
    businessDecisions: {
      'business:booking-cancellation-policy': 'windowed',
      'business:multiple-service-providers': 'multiple'
    }
  });

  assert.equal(output.compiled.standard.projectType, 'saas');
  assert.ok(output.compiled.standard.requiredEvidence.includes('design'));
  assert.ok(output.compiled.implementationPlan.releaseReadiness.requiredEvidence.includes('design'));
});
