import { makeEvidence } from '../evidence.mjs';

const operationalChecks = ['deploy', 'rollback', 'monitoring', 'alerting', 'recovery', 'backup', 'upgrade', 'failureHandling'];

export function operationsToEvidence(checks, { commit, artifact } = {}) {
  const missing = operationalChecks.filter((check) => checks?.[check] !== true);
  return makeEvidence({
    kind: 'operations',
    claim: 'operational-readiness-verification',
    source: 'operations-verification',
    runner: 'calystr-operations-verifier',
    artifact,
    scope: { commit },
    status: missing.length === 0 ? 'PASS' : 'FAIL',
    details: { checks: Object.fromEntries(operationalChecks.map((check) => [check, checks?.[check] === true])), missing }
  });
}
