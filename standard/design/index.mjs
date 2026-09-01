const designModes = Object.freeze(['PERSUADE', 'OPERATE', 'READ', 'EXPERIENCE']);

export const designCriteria = Object.freeze([
  'purpose', 'clarity', 'hierarchy', 'consistency', 'accessibility', 'responsiveness',
  'interaction', 'content', 'recovery', 'craft', 'performance', 'implementationIntegrity'
]);

export function classifySurface({ kind }) {
  const map = {
    landing: 'PERSUADE', marketing: 'PERSUADE', dashboard: 'OPERATE', admin: 'OPERATE',
    documentation: 'READ', article: 'READ', portfolio: 'EXPERIENCE', showcase: 'EXPERIENCE'
  };
  return map[kind] ?? 'OPERATE';
}

export function verifyDesign(design) {
  const checks = {};
  for (const criterion of designCriteria) {
    const value = design?.verification?.[criterion];
    checks[criterion] = value === true ? 'PASS' : value === false ? 'FAIL' : 'UNKNOWN';
  }
  const statuses = Object.values(checks);
  const verdict = statuses.includes('FAIL') ? 'FAIL' : statuses.includes('UNKNOWN') ? 'UNKNOWN' : 'PASS';
  return { verdict, checks };
}

export function requiredInteractionStates(surfaceMode) {
  if (!designModes.includes(surfaceMode)) throw new Error(`Unknown design mode: ${surfaceMode}`);
  return ['default', 'loading', 'empty', 'error', 'disabled', 'focus', 'recovery'];
}
