import { parseIntent } from './parse/index.mjs';
import { normaliseRequirement, buildCapabilityGraph } from './normalise/index.mjs';
import { mapKnowledge } from './map/index.mjs';
import { resolveSolutions } from './resolve/index.mjs';
import { compileResolved } from './compile/index.mjs';
import { validateCompiledProduct } from './validate/index.mjs';
import { packageCompiledProduct } from './package/index.mjs';

export async function compileIntent(intent, options = {}) {
  const parsed = parseIntent(intent, options);
  const requirement = normaliseRequirement(parsed);
  const capabilities = buildCapabilityGraph(requirement);
  const mapped = await mapKnowledge({ requirement, capabilities });
  const resolved = await resolveSolutions(mapped);
  const compiled = validateCompiledProduct(await compileResolved(resolved));
  return packageCompiledProduct(compiled);
}
