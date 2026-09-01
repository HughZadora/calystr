export const commercialMaturityDimensions = Object.freeze([
  'functional',
  'design',
  'engineering',
  'security',
  'reliability',
  'operability',
  'maintainability',
  'commercialFit'
]);

export const maturityLevels = Object.freeze(['EXPERIMENTAL', 'FUNCTIONAL', 'PRODUCTION', 'COMMERCIAL', 'CRITICAL']);

const saasWeights = Object.freeze({
  functional: 0.18,
  design: 0.12,
  engineering: 0.14,
  security: 0.14,
  reliability: 0.12,
  operability: 0.12,
  maintainability: 0.08,
  commercialFit: 0.1
});

export function commercialMaturityProfile({ projectType = 'saas', changeClass = 'STANDARD' } = {}) {
  const weights = projectType === 'saas'
    ? saasWeights
    : Object.freeze(Object.fromEntries(commercialMaturityDimensions.map((dimension) => [dimension, 1 / commercialMaturityDimensions.length])));
  const targets = Object.fromEntries(commercialMaturityDimensions.map((dimension) => [dimension, 'COMMERCIAL']));
  if (changeClass === 'CRITICAL') {
    targets.security = 'CRITICAL';
    targets.reliability = 'CRITICAL';
    targets.operability = 'CRITICAL';
  }
  return Object.freeze({
    dimensions: [...commercialMaturityDimensions],
    levels: [...maturityLevels],
    weights: { ...weights },
    targets: Object.freeze(targets),
    aggregateScoreAuthority: false,
    decisionAuthority: 'opa'
  });
}
