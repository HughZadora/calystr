import { composeStandard } from '../../standard/index.mjs';
import { classifySurface, designVerificationContract } from '../../standard/design/index.mjs';
import { adviseUnknowns, assertBusinessOnlyQuestions } from '../resolve/advisor.mjs';
import { createImplementationPlan } from './plan.mjs';

function designFor(requirement) {
  const surfaces = [];
  if (requirement.capabilities.includes('booking') || requirement.capabilities.includes('payments')) {
    surfaces.push({ id: 'surface-customer', kind: 'dashboard', mode: classifySurface({ kind: 'dashboard' }) });
  }
  if (requirement.capabilities.includes('admin')) {
    surfaces.push({ id: 'surface-admin', kind: 'admin', mode: classifySurface({ kind: 'admin' }) });
  }
  return {
    id: 'DSN-001',
    product: { intent: requirement.intent, surfaces },
    experience: { journeys: requirement.capabilities.map((capability) => `journey:${capability}`) },
    interaction: { requiredStates: ['default', 'loading', 'empty', 'error', 'disabled', 'focus', 'recovery'] },
    visual: { authority: 'create-unless-existing-authority-is-detected' },
    accessibility: { required: true },
    responsive: { required: true },
    content: { clarity: 'required', errorRecovery: 'required' },
    verification: designVerificationContract()
  };
}

function verificationMethods(capability) {
  const methods = {
    payments: ['unit', 'integration', 'security', 'browser', 'production'],
    booking: ['unit', 'integration', 'browser', 'user-journey'],
    authentication: ['unit', 'integration', 'security', 'browser'],
    api: ['contract', 'integration', 'security'],
    'relational-storage': ['integration', 'migration', 'backup'],
    admin: ['unit', 'integration', 'browser'],
    notifications: ['unit', 'integration']
  };
  return methods[capability] ?? ['unit', 'integration'];
}

function verificationFor(requirement, capabilities) {
  return capabilities.map((capability) => ({
    requirementId: requirement.id,
    capabilityId: capability.id,
    capability: capability.definition,
    methods: verificationMethods(capability.definition)
  }));
}

export async function compileResolved(resolved) {
  const standard = await composeStandard({ version: '1.0.0', changeClass: resolved.requirement.changeClass });
  const advice = assertBusinessOnlyQuestions(adviseUnknowns(resolved.requirement.unknowns));
  const design = designFor(resolved.requirement);
  const verification = verificationFor(resolved.requirement, resolved.capabilities);
  const implementationPlan = createImplementationPlan({
    requirement: resolved.requirement,
    capabilities: resolved.capabilities,
    solutions: resolved.solutions,
    design,
    verification,
    standard
  });

  return {
    schemaVersion: '1.0.0',
    compilerVersion: '1.0.0',
    requirement: resolved.requirement,
    quantification: resolved.quantification,
    capabilities: resolved.capabilities,
    solutions: resolved.solutions,
    advice,
    design,
    implementationPlan,
    engineering: { initialization: standard.engineeringConfiguration },
    standard,
    verification,
    mappings: resolved.mappings.map((mapping) => mapping.id)
  };
}
