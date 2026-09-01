import { readFile } from 'node:fs/promises';

const registryUrl = new URL('./registry.json', import.meta.url);

async function loadSolutionRegistry() {
  const registry = JSON.parse(await readFile(registryUrl, 'utf8'));
  const ids = new Set();
  for (const item of registry) {
    if (!item.id || !item.identity || !item.source || !item.licence) throw new Error('Invalid solution registry entry');
    if (ids.has(item.id)) throw new Error(`Duplicate solution id: ${item.id}`);
    ids.add(item.id);
  }
  return registry;
}

function dimension(value) {
  return value === 'high' ? 1 : value === 'medium' ? 0.65 : value === 'low' ? 0.35 : 0.5;
}

export async function evaluateSolutions({ capabilities, projectType = 'saas', disallowedLicences = [] }) {
  const requested = new Set(capabilities);
  const registry = await loadSolutionRegistry();
  return registry.map((candidate) => {
    const covered = candidate.capabilities.filter((capability) => requested.has(capability));
    const coverage = requested.size === 0 ? 0 : covered.length / requested.size;
    const compatibility = candidate.compatibility?.[projectType] ? 1 : 0;
    const maturity = (dimension(candidate.maturitySignals.productionUse) + dimension(candidate.maturitySignals.documentation) + dimension(candidate.maturitySignals.ecosystem)) / 3;
    const licenceAllowed = !disallowedLicences.includes(candidate.licence);
    const fitness = { coverage, compatibility, maturity, licenceAllowed };
    const decision = !licenceAllowed ? 'BUILD' : coverage === 1 && compatibility === 1 ? 'ADOPT' : coverage > 0 ? 'ADAPT' : 'BUILD';
    return { ...candidate, fitness, decision, coveredCapabilities: covered };
  }).sort((a, b) => {
    const score = (item) => (item.fitness.licenceAllowed ? 1 : 0) * (item.fitness.coverage * 0.5 + item.fitness.compatibility * 0.2 + item.fitness.maturity * 0.3);
    return score(b) - score(a);
  });
}

export async function recommendSolution(input) {
  const ranked = await evaluateSolutions(input);
  const best = ranked.find((item) => item.fitness.coverage > 0 && item.fitness.licenceAllowed);
  if (!best) return { decision: 'BUILD', candidate: null, why: 'No suitable mature registered solution covers the requested capability under the supplied constraints.' };
  return {
    decision: best.decision,
    candidate: best.id,
    why: `${best.identity} covers ${best.coveredCapabilities.join(', ')} with ${best.maturitySignals.productionUse} production maturity.`,
    advantages: best.advantages,
    disadvantages: best.disadvantages,
    risks: best.risks,
    costs: best.costs,
    fitness: best.fitness
  };
}
