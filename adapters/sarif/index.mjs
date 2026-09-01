import { makeEvidence } from '../evidence.mjs';

export function sarifToEvidence(input, { commit, artifact = 'results.sarif' } = {}) {
  const sarif = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(sarif.runs)) throw new Error('Invalid SARIF document');
  const results = sarif.runs.flatMap((run) => run.results ?? []);
  const errors = results.filter((result) => (result.level ?? 'warning') === 'error').length;
  return makeEvidence({
    kind: 'security',
    claim: 'static-security-analysis',
    source: 'sarif',
    runner: 'sarif-adapter',
    artifact,
    scope: { commit },
    status: errors === 0 ? 'PASS' : 'FAIL',
    details: { results: results.length, errors }
  });
}
