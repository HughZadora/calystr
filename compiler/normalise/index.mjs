const dependencyMap = Object.freeze({
  booking: ['authentication', 'relational-storage', 'api'],
  payments: ['authentication', 'api'],
  admin: ['authentication', 'api'],
  notifications: ['api'],
  authentication: [],
  api: [],
  'relational-storage': []
});

const verificationMap = Object.freeze({
  booking: ['booking:behaviour', 'booking:integration', 'booking:browser', 'booking:user-journey'],
  payments: ['payments:behaviour', 'payments:integration', 'payments:security', 'payments:browser', 'payments:production'],
  authentication: ['authentication:behaviour', 'authentication:integration', 'authentication:security', 'authentication:browser'],
  api: ['api:contract', 'api:integration', 'api:security'],
  'relational-storage': ['relational-storage:integration', 'relational-storage:migration', 'relational-storage:backup'],
  admin: ['admin:behaviour', 'admin:integration', 'admin:browser'],
  notifications: ['notifications:behaviour', 'notifications:integration']
});

export function normaliseRequirement(requirement) {
  const normalise = (values = []) => [...new Set(values.filter(Boolean))].sort();
  return Object.freeze({
    ...requirement,
    capabilities: normalise(requirement.capabilities),
    constraints: normalise(requirement.constraints),
    acceptance: normalise(requirement.acceptance),
    risk: normalise(requirement.risk),
    unknowns: normalise(requirement.unknowns)
  });
}

function expandCapabilities(requestedCapabilities) {
  const expanded = new Set(requestedCapabilities);
  const queue = [...requestedCapabilities];
  while (queue.length > 0) {
    const capability = queue.shift();
    for (const dependency of dependencyMap[capability] ?? []) {
      if (expanded.has(dependency)) continue;
      expanded.add(dependency);
      queue.push(dependency);
    }
  }
  return [...expanded].sort();
}

export function buildCapabilityGraph(requirement) {
  const definitions = expandCapabilities(requirement.capabilities);
  return definitions.map((capability, index) => ({
    id: `CAP-${String(index + 1).padStart(3, '0')}`,
    definition: capability,
    dependencies: (dependencyMap[capability] ?? []).filter((dependency) => definitions.includes(dependency)),
    requirements: [requirement.id],
    solutions: [],
    risks: capability === 'payments' ? ['financial-transaction'] : [],
    verification: verificationMap[capability] ?? [`${capability}:behaviour`, `${capability}:integration`]
  }));
}
