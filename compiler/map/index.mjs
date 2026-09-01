import { loadMappings } from '../../mappings/index.mjs';

export async function mapKnowledge({ requirement, capabilities }) {
  const mappings = await loadMappings();
  const alwaysRelevant = new Set(['intent-resolution', 'context-management', 'harness-contract', 'runtime-contract', 'development-pattern', 'design-requirement', 'design-verification']);
  return {
    requirement,
    capabilities,
    mappings: mappings.filter((mapping) => alwaysRelevant.has(mapping.target))
  };
}
