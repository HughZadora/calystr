import { recommendSolution } from '../../mappings/solution/index.mjs';

const registryCapabilities = {
  payments: ['payments'],
  authentication: ['authentication'],
  'relational-storage': ['relational-storage']
};

export async function resolveSolutions({ requirement, capabilities, mappings }) {
  const solutions = [];
  for (const capability of capabilities) {
    const requested = registryCapabilities[capability.definition];
    const recommendation = requested
      ? await recommendSolution({ capabilities: requested, projectType: requirement.context.projectType })
      : { decision: 'BUILD', candidate: null, why: 'No suitable mature registered solution currently covers this capability.' };
    solutions.push({ capabilityId: capability.id, capability: capability.definition, ...recommendation });
  }
  return { requirement, capabilities, mappings, solutions };
}
