export const ENGINEERING_CONFIGURATION_SEQUENCE = Object.freeze([
  'identify-current-date-and-platform',
  'query-official-current-support',
  'resolve-runtime-requirements',
  'resolve-dependency-compatibility',
  'generate-configuration-once'
]);

const REQUIRED_DISCOVERY_FIELDS = Object.freeze([
  'currentDate',
  'platform',
  'officialSupport',
  'runtimeRequirements',
  'dependencyCompatibility'
]);

function assertRecord(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Engineering discovery ${field} must be a non-empty record`);
  }
  if (Object.keys(value).length === 0) {
    throw new Error(`Engineering discovery ${field} must not be empty`);
  }
}

export function engineeringConfigurationContract() {
  return Object.freeze({
    sequence: [...ENGINEERING_CONFIGURATION_SEQUENCE],
    sourcePolicy: 'official-current-support-first',
    versionPolicy: 'no-unverified-template-defaults',
    compatibilityPolicy: 'runtime-and-dependencies-must-resolve-before-generation',
    generationPolicy: 'single-pass-after-complete-resolution',
    commodityGatePolicy: 'mainstream-stack-native-tools-first-no-hand-rolled-gates'
  });
}

export function resolveEngineeringConfiguration(discovery) {
  if (!discovery || typeof discovery !== 'object' || Array.isArray(discovery)) {
    throw new Error('Engineering discovery is required before configuration generation');
  }

  for (const field of REQUIRED_DISCOVERY_FIELDS) {
    if (!(field in discovery)) {
      throw new Error(`Engineering discovery missing ${field}`);
    }
  }

  if (!Number.isFinite(Date.parse(discovery.currentDate))) {
    throw new Error('Engineering discovery currentDate must be a valid date');
  }
  if (typeof discovery.platform !== 'string' || !discovery.platform.trim()) {
    throw new Error('Engineering discovery platform must be a non-empty string');
  }

  assertRecord(discovery.officialSupport, 'officialSupport');
  assertRecord(discovery.runtimeRequirements, 'runtimeRequirements');
  assertRecord(discovery.dependencyCompatibility, 'dependencyCompatibility');

  return Object.freeze({
    status: 'READY_TO_GENERATE',
    ...engineeringConfigurationContract(),
    discovery: Object.freeze({ ...discovery })
  });
}
