import { parseIntent } from './parse/index.mjs';
import { normaliseRequirement, buildCapabilityGraph } from './normalise/index.mjs';
import { quantifyRequirement } from './quantify/index.mjs';
import { mapKnowledge } from './map/index.mjs';
import { resolveSolutions } from './resolve/index.mjs';
import { resolveBusinessDecisions } from './resolve/advisor.mjs';
import { compileResolved } from './compile/index.mjs';
import { validateCompiledProduct } from './validate/index.mjs';
import { packageCompiledProduct } from './package/index.mjs';

export async function compileIntent(intent, options = {}) {
  const parsed = parseIntent(intent, options);
  const decided = resolveBusinessDecisions(parsed, options.businessDecisions ?? {});
  const requirement = normaliseRequirement(decided);
  const quantification = quantifyRequirement(requirement);
  const capabilities = buildCapabilityGraph(requirement);
  const mapped = await mapKnowledge({ requirement, capabilities });
  const resolved = await resolveSolutions(mapped);
  const compiled = await validateCompiledProduct(await compileResolved({ ...resolved, quantification }));
  return packageCompiledProduct(compiled);
}
