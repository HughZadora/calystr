import { makeEvidence } from '../evidence.mjs';

function numberAttribute(xml, name) {
  const match = xml.match(new RegExp(`${name}=["'](\\d+)["']`));
  return match ? Number(match[1]) : 0;
}

export function junitToEvidence(xml, { commit, artifact = 'junit.xml' } = {}) {
  if (!xml.includes('<testsuite') && !xml.includes('<testsuites')) throw new Error('Invalid JUnit XML');
  const tests = numberAttribute(xml, 'tests');
  const failures = numberAttribute(xml, 'failures');
  const errors = numberAttribute(xml, 'errors');
  const skipped = numberAttribute(xml, 'skipped');
  return makeEvidence({
    kind: 'tests',
    claim: 'test-execution',
    source: 'junit',
    runner: 'junit-adapter',
    artifact,
    scope: { commit },
    status: failures + errors === 0 ? 'PASS' : 'FAIL',
    details: { tests, failures, errors, skipped }
  });
}
