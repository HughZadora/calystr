const standardImpactKeys = ['schema', 'policy', 'requirements', 'verification', 'advisor', 'mappings', 'skills'];

export function validateCompiledProduct(compiled) {
  if (!compiled.requirement?.id) throw new Error('Compiled product requires a Requirement');
  if (!Array.isArray(compiled.capabilities) || compiled.capabilities.length === 0) {
    throw new Error('Compiled product requires at least one Capability');
  }

  const capabilityIds = new Set(compiled.capabilities.map((capability) => capability.id));
  for (const solution of compiled.solutions) {
    if (!capabilityIds.has(solution.capabilityId)) throw new Error(`Solution references unknown capability ${solution.capabilityId}`);
  }

  if (compiled.quantification?.requirementId !== compiled.requirement.id) {
    throw new Error('Requirement quantification must trace to Requirement');
  }
  if (compiled.quantification.coverage.denominatorSource !== 'requirement.acceptance') {
    throw new Error('Coverage denominator must come from Requirement acceptance');
  }
  for (const obligation of compiled.quantification.coverage.obligations) {
    if (obligation.requirementId !== compiled.requirement.id) {
      throw new Error('Coverage obligations must trace to Requirement');
    }
  }

  for (const verification of compiled.verification) {
    if (verification.requirementId !== compiled.requirement.id) throw new Error('Verification must trace to Requirement');
    if (!capabilityIds.has(verification.capabilityId)) throw new Error('Verification must trace to Capability');
  }

  if (compiled.implementationPlan?.requirementId !== compiled.requirement.id) {
    throw new Error('Implementation plan must trace to Requirement');
  }
  const plannedCapabilities = new Set(compiled.implementationPlan.workstreams.map((workstream) => workstream.capabilityId));
  for (const capabilityId of capabilityIds) {
    if (!plannedCapabilities.has(capabilityId)) throw new Error(`Implementation plan is missing capability ${capabilityId}`);
  }

  if (compiled.standard.harness.runtime !== 'pi') throw new Error('V1 compiled standards must target Pi');
  if (compiled.versions?.schema !== compiled.schemaVersion) throw new Error('Schema version metadata must be explicit');
  if (compiled.versions?.compiler !== compiled.compilerVersion) throw new Error('Compiler version metadata must be explicit');
  if (compiled.versions?.standard !== compiled.standard.identity.version) throw new Error('Standard version metadata must be explicit');
  if (compiled.versions?.harnessCompatibility !== compiled.standard.harness.compatibility) {
    throw new Error('Harness compatibility metadata must be explicit');
  }
  if (Object.values(compiled.versions?.sources ?? {}).some((version) => version === 'UNKNOWN')) {
    throw new Error('Mapped source versions must resolve to source provenance');
  }
  for (const key of standardImpactKeys) {
    if (!(key in (compiled.standard.impact ?? {}))) throw new Error(`Standard impact metadata is missing ${key}`);
  }
  return compiled;
}
