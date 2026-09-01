import test from 'node:test';
import assert from 'node:assert/strict';
import { playwrightReportToDesignEvidence, requiredDesignRunnerDimensions } from '../../adapters/design/index.mjs';
import { compileIntent } from '../../compiler/index.mjs';
import { isTrustedEvidence } from '../../adapters/evidence.mjs';

function reportFor(statusByDimension = {}) {
  return {
    suites: [
      {
        title: 'design verification',
        specs: requiredDesignRunnerDimensions.map((dimension) => ({
          title: `@${dimension} ${dimension} contract`,
          tests: [{ results: [{ status: statusByDimension[dimension] ?? 'passed' }] }]
        }))
      }
    ]
  };
}

test('compiled Design declares external runner verification instead of trusting agent claims', async () => {
  const output = await compileIntent('Build a commercial SaaS for customer booking and online payment');
  assert.equal(output.compiled.design.verification.evidenceAuthority, 'external-runner');
  assert.equal(output.compiled.design.verification.runner, 'playwright');
  assert.equal(output.compiled.design.verification.agentClaimsAreEvidence, false);
  assert.deepEqual(output.compiled.design.verification.dimensions, requiredDesignRunnerDimensions);
});

test('Playwright design evidence requires browser, accessibility, responsive and user-journey dimensions', () => {
  const evidence = playwrightReportToDesignEvidence(reportFor(), {
    commit: 'abc123',
    command: 'pnpm exec playwright test --reporter=json',
    exitCode: 0
  });
  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.kind, 'design');
  assert.equal(isTrustedEvidence(evidence), true);
  assert.deepEqual(Object.keys(evidence.details.dimensions), requiredDesignRunnerDimensions);
});

test('missing design dimensions remain UNKNOWN and failures remain FAIL', () => {
  const missing = playwrightReportToDesignEvidence({ suites: [] }, { commit: 'abc123', exitCode: 0 });
  assert.equal(missing.status, 'UNKNOWN');

  const failed = playwrightReportToDesignEvidence(reportFor({ accessibility: 'failed' }), {
    commit: 'abc123',
    exitCode: 1
  });
  assert.equal(failed.status, 'FAIL');
  assert.equal(failed.details.dimensions.accessibility, 'FAIL');
});
