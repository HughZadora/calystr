export function validateCompiledProduct(compiled) {
  if (!compiled.requirement?.id) throw new Error('Compiled product requires a Requirement');
  if (!Array.isArray(compiled.capabilities) || compiled.capabilities.length === 0) throw new Error('Compiled product requires at least one Capability');
  const capabilityIds = new Set(compiled.capabilities.map((capability) => capability.id));
  for (const solution of compiled.solutions) {
    if (!capabilityIds.has(solution.capabilityId)) throw new Error(`Solution references unknown capability ${solution.capabilityId}`);
  }
  for (const verification of compiled.verification) {
    if (verification.requirementId !== compiled.requirement.id) throw new Error('Verification must trace to Requirement');
  }
  if (compiled.standard.harness.runtime !== 'pi') throw new Error('V1 compiled standards must target Pi');
  return compiled;
}
