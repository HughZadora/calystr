import { recommendSolution } from '../../mappings/solution/index.mjs';

export async function resolveSolutions({ requirement, capabilities, mappings }) {
  const solutions = [];
  for (const capability of capabilities) {
    const recommendation = await recommendSolution({
      capabilities: [capability.definition],
      projectType: requirement.context.projectType
    });
    solutions.push({ capabilityId: capability.id, capability: capability.definition, ...recommendation });
  }
  return { requirement, capabilities, mappings, solutions };
}
