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

export function buildCapabilityGraph(requirement) {
  return requirement.capabilities.map((capability, index) => ({
    id: `CAP-${String(index + 1).padStart(3, '0')}`,
    definition: capability,
    dependencies: capability === 'booking' && requirement.capabilities.includes('relational-storage') ? ['relational-storage'] : [],
    requirements: [requirement.id],
    solutions: [],
    risks: capability === 'payments' ? ['financial-transaction'] : [],
    verification: [`${capability}:behaviour`, `${capability}:integration`]
  }));
}
