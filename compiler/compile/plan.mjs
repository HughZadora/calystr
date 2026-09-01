export function createImplementationPlan({ requirement, capabilities, solutions, design, verification, standard }) {
  const capabilityByName = new Map(capabilities.map((capability) => [capability.definition, capability]));
  const solutionByCapabilityId = new Map(solutions.map((solution) => [solution.capabilityId, solution]));
  const verificationByCapability = new Map(verification.map((item) => [item.capability, item]));

  return Object.freeze({
    id: 'PLAN-001',
    requirementId: requirement.id,
    changeClass: requirement.changeClass,
    sequence: ['design', 'implementation', 'test', 'review', 'verify', 'release-readiness'],
    design: {
      surfaces: design.product.surfaces.map((surface) => surface.id),
      requiredInteractionStates: [...design.interaction.requiredStates]
    },
    workstreams: capabilities.map((capability) => {
      const solution = solutionByCapabilityId.get(capability.id);
      const verificationPlan = verificationByCapability.get(capability.definition);
      return {
        capabilityId: capability.id,
        capability: capability.definition,
        dependencies: capability.dependencies.map((name) => capabilityByName.get(name)?.id).filter(Boolean),
        solution: {
          decision: solution?.decision ?? 'BUILD',
          candidate: solution?.candidate ?? null
        },
        implementation:
          solution?.decision === 'ADOPT'
            ? 'integrate-and-configure'
            : solution?.decision === 'ADAPT' || solution?.decision === 'COMBINE'
              ? 'integrate-adapt-and-verify'
              : 'implement-and-verify',
        verification: verificationPlan?.methods ?? []
      };
    }),
    releaseReadiness: {
      requiredEvidence: [...standard.requiredEvidence],
      requiredReview: [...standard.requiredReview]
    }
  });
}
