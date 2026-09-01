import { loadSolutionRegistry } from '../../mappings/solution/index.mjs';

const standardImpactKeys = ['schema', 'policy', 'requirements', 'verification', 'advisor', 'mappings', 'skills'];
const solutionDecisions = new Set(['ADOPT', 'ADAPT', 'COMBINE', 'BUILD']);

function assertRequirement(compiled) {
  const requirement = compiled.requirement;
  if (!requirement?.id || !requirement.intent?.trim()) throw new Error('Compiled product requires a real Requirement');
  if (!Array.isArray(requirement.acceptance) || requirement.acceptance.length === 0) {
    throw new Error('Requirement must define acceptance criteria');
  }
  if (!requirement.unknowns.every((item) => item.startsWith('business:'))) {
    throw new Error('Requirement unknowns exposed to the user must be business decisions');
  }
}

async function assertSolutions(compiled, capabilityIds) {
  if (compiled.solutions.length !== capabilityIds.size) throw new Error('Every Capability requires exactly one Solution decision');
  const registeredCandidates = new Set((await loadSolutionRegistry()).map((candidate) => candidate.id));
  const seen = new Set();
  for (const solution of compiled.solutions) {
    if (!capabilityIds.has(solution.capabilityId)) throw new Error(`Solution references unknown capability ${solution.capabilityId}`);
    if (seen.has(solution.capabilityId)) throw new Error(`Duplicate Solution decision for ${solution.capabilityId}`);
    seen.add(solution.capabilityId);
    if (!solutionDecisions.has(solution.decision) || solution.recommendation !== solution.decision) {
      throw new Error(`Invalid Solution decision for ${solution.capabilityId}`);
    }
    if (!solution.why?.trim()) throw new Error(`Solution decision ${solution.capabilityId} requires rationale`);
    if (solution.decision === 'ADOPT' || solution.decision === 'ADAPT') {
      if (!solution.candidate || !solution.candidates?.includes(solution.candidate)) {
        throw new Error(`${solution.decision} requires a registered candidate`);
      }
      if (!registeredCandidates.has(solution.candidate)) throw new Error(`Unknown Solution candidate ${solution.candidate}`);
      if (!solution.integration || !Array.isArray(solution.advantages) || !Array.isArray(solution.disadvantages)) {
        throw new Error(`${solution.decision} requires integration and trade-off context`);
      }
    }
    if (solution.decision === 'COMBINE') {
      if (!Array.isArray(solution.candidates) || solution.candidates.length < 2) throw new Error('COMBINE requires multiple candidates');
      if (solution.candidates.some((candidate) => !registeredCandidates.has(candidate))) {
        throw new Error('COMBINE contains an unknown Solution candidate');
      }
    }
    if (solution.decision === 'BUILD' && solution.candidate !== null) throw new Error('BUILD cannot claim an adopted candidate');
  }
}

export async function validateCompiledProduct(compiled) {
  assertRequirement(compiled);
  if (!Array.isArray(compiled.capabilities) || compiled.capabilities.length === 0) {
    throw new Error('Compiled product requires at least one Capability');
  }

  const capabilityIds = new Set();
  for (const capability of compiled.capabilities) {
    if (!capability.id || !capability.definition) throw new Error('Capability requires identity and definition');
    if (capabilityIds.has(capability.id)) throw new Error(`Duplicate Capability id ${capability.id}`);
    if (!capability.requirements?.includes(compiled.requirement.id)) throw new Error('Capability must trace to Requirement');
    capabilityIds.add(capability.id);
  }
  await assertSolutions(compiled, capabilityIds);

  if (compiled.quantification?.requirementId !== compiled.requirement.id) {
    throw new Error('Requirement quantification must trace to Requirement');
  }
  if (compiled.quantification.coverage.denominatorSource !== 'requirement.acceptance') {
    throw new Error('Coverage denominator must come from Requirement acceptance');
  }
  if (compiled.quantification.coverage.required !== compiled.requirement.acceptance.length) {
    throw new Error('Coverage denominator must equal Requirement acceptance');
  }
  const acceptance = new Set(compiled.requirement.acceptance);
  for (const obligation of compiled.quantification.coverage.obligations) {
    if (obligation.requirementId !== compiled.requirement.id || !acceptance.has(obligation.criterion)) {
      throw new Error('Coverage obligations must trace to Requirement acceptance');
    }
  }

  const verifiedCapabilities = new Set();
  for (const verification of compiled.verification) {
    if (verification.requirementId !== compiled.requirement.id) throw new Error('Verification must trace to Requirement');
    if (!capabilityIds.has(verification.capabilityId)) throw new Error('Verification must trace to Capability');
    if (!Array.isArray(verification.methods) || verification.methods.length === 0) throw new Error('Verification methods are required');
    verifiedCapabilities.add(verification.capabilityId);
  }
  for (const capabilityId of capabilityIds) {
    if (!verifiedCapabilities.has(capabilityId)) throw new Error(`Missing verification for ${capabilityId}`);
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
