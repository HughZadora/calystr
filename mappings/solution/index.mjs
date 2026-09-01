import { readFile } from 'node:fs/promises';

const registryUrl = new URL('./registry.json', import.meta.url);

export async function loadSolutionRegistry() {
  const registry = JSON.parse(await readFile(registryUrl, 'utf8'));
  const ids = new Set();
  for (const item of registry) {
    for (const field of ['id', 'identity', 'source', 'licence', 'capabilities', 'compatibility', 'evidence', 'maturitySignals', 'risks', 'costs', 'fitness', 'integration']) {
      if (item[field] === undefined) throw new Error(`Invalid solution registry entry ${item.id ?? '<unknown>'}: missing ${field}`);
    }
    if (ids.has(item.id)) throw new Error(`Duplicate solution id: ${item.id}`);
    ids.add(item.id);
  }
  return registry;
}

function dimension(value) {
  return value === 'high' ? 1 : value === 'medium' ? 0.65 : value === 'low' ? 0.35 : 0.5;
}

function score(item) {
  return (item.fitness.licenceAllowed ? 1 : 0) *
    (item.fitness.coverage * 0.5 + item.fitness.compatibility * 0.2 + item.fitness.maturity * 0.3);
}

function combineCandidates(ranked, requested) {
  const eligible = ranked.filter((item) => item.fitness.licenceAllowed && item.fitness.compatibility === 1 && item.coveredCapabilities.length > 0);
  let best = null;
  for (let left = 0; left < eligible.length; left += 1) {
    for (let right = left + 1; right < eligible.length; right += 1) {
      const pair = [eligible[left], eligible[right]];
      const coverage = new Set(pair.flatMap((item) => item.coveredCapabilities));
      if (![...requested].every((capability) => coverage.has(capability))) continue;
      const pairScore = pair.reduce((total, item) => total + score(item), 0);
      if (!best || pairScore > best.score) best = { pair, score: pairScore };
    }
  }
  return best?.pair ?? null;
}

export async function evaluateSolutions({ capabilities, projectType = 'saas', disallowedLicences = [] }) {
  const requested = new Set(capabilities);
  const registry = await loadSolutionRegistry();
  return registry
    .map((candidate) => {
      const covered = candidate.capabilities.filter((capability) => requested.has(capability));
      const coverage = requested.size === 0 ? 0 : covered.length / requested.size;
      const compatibility = candidate.compatibility?.[projectType] ? 1 : 0;
      const maturity =
        (dimension(candidate.maturitySignals.productionUse) +
          dimension(candidate.maturitySignals.documentation) +
          dimension(candidate.maturitySignals.ecosystem)) /
        3;
      const licenceAllowed = !disallowedLicences.includes(candidate.licence);
      const fitness = { ...candidate.fitness, coverage, compatibility, maturity, licenceAllowed };
      const decision = !licenceAllowed
        ? 'BUILD'
        : coverage === 1 && compatibility === 1
          ? 'ADOPT'
          : coverage > 0
            ? 'ADAPT'
            : 'BUILD';
      return { ...candidate, fitness, decision, coveredCapabilities: covered };
    })
    .sort((a, b) => score(b) - score(a));
}

function buildRecommendation() {
  return {
    decision: 'BUILD',
    recommendation: 'BUILD',
    candidate: null,
    candidates: [],
    why: 'No suitable mature registered solution covers the requested capability under the supplied constraints.',
    advantages: [],
    disadvantages: [],
    risks: [],
    costs: {},
    integration: null,
    fitness: { coverage: 0, compatibility: 0, maturity: 0, licenceAllowed: true }
  };
}

export async function recommendSolution(input) {
  const ranked = await evaluateSolutions(input);
  const requested = new Set(input.capabilities ?? []);
  const best = ranked.find(
    (item) => item.fitness.coverage === 1 && item.fitness.compatibility === 1 && item.fitness.licenceAllowed
  );
  if (best) {
    return {
      decision: 'ADOPT',
      recommendation: 'ADOPT',
      candidate: best.id,
      candidates: [best.id],
      why: `${best.identity} covers ${best.coveredCapabilities.join(', ')} with ${best.maturitySignals.productionUse} production maturity.`,
      advantages: best.advantages,
      disadvantages: best.disadvantages,
      risks: best.risks,
      costs: best.costs,
      integration: best.integration,
      fitness: best.fitness
    };
  }

  if (requested.size > 1) {
    const combination = combineCandidates(ranked, requested);
    if (combination) {
      return {
        decision: 'COMBINE',
        recommendation: 'COMBINE',
        candidate: null,
        candidates: combination.map((item) => item.id),
        why: `No single registered solution covers the requested capabilities; ${combination.map((item) => item.identity).join(' + ')} jointly cover them.`,
        advantages: [...new Set(combination.flatMap((item) => item.advantages))],
        disadvantages: [...new Set(combination.flatMap((item) => item.disadvantages))],
        risks: [...new Set(combination.flatMap((item) => item.risks))],
        costs: Object.fromEntries(combination.map((item) => [item.id, item.costs])),
        integration: Object.fromEntries(combination.map((item) => [item.id, item.integration])),
        fitness: { coverage: 1, compatibility: 1, maturity: Math.min(...combination.map((item) => item.fitness.maturity)), licenceAllowed: true }
      };
    }
  }

  const partial = ranked.find((item) => item.fitness.coverage > 0 && item.fitness.licenceAllowed);
  if (!partial) return buildRecommendation();
  return {
    decision: 'ADAPT',
    recommendation: 'ADAPT',
    candidate: partial.id,
    candidates: [partial.id],
    why: `${partial.identity} partially covers ${partial.coveredCapabilities.join(', ')} and requires adaptation for the remaining capability gap.`,
    advantages: partial.advantages,
    disadvantages: partial.disadvantages,
    risks: partial.risks,
    costs: partial.costs,
    integration: partial.integration,
    fitness: partial.fitness
  };
}
