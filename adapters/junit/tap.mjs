import { makeEvidence } from '../evidence.mjs';

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

export function tapToEvidence(tap, { commit, artifact = 'tests.tap', exitCode = 0 } = {}) {
  if (typeof tap !== 'string' || !/TAP version\s+\d+/i.test(tap)) throw new Error('Invalid TAP output');
  const failed = countMatches(tap, /^not ok\s+/gm);
  const passed = countMatches(tap, /^ok\s+/gm);
  const status = exitCode === 0 && failed === 0 ? 'PASS' : 'FAIL';
  return makeEvidence({
    kind: 'tests',
    claim: 'test-execution',
    source: 'tap',
    runner: 'tap-adapter',
    artifact,
    exitCode,
    scope: { commit },
    status,
    details: { passed, failed }
  });
}
