import { composeStandard } from '../../standard/index.mjs';
import { classifySurface } from '../../standard/design/index.mjs';

function designFor(requirement) {
  const surfaces = [];
  if (requirement.capabilities.includes('booking') || requirement.capabilities.includes('payments')) surfaces.push({ id: 'surface-customer', kind: 'dashboard', mode: classifySurface({ kind: 'dashboard' }) });
  if (requirement.capabilities.includes('admin')) surfaces.push({ id: 'surface-admin', kind: 'admin', mode: classifySurface({ kind: 'admin' }) });
  return {
    id: 'DSN-001',
    product: { intent: requirement.intent, surfaces },
    experience: { journeys: requirement.capabilities.map((capability) => `journey:${capability}`) },
    interaction: { requiredStates: ['default', 'loading', 'empty', 'error', 'disabled', 'focus', 'recovery'] },
    visual: { authority: 'create-unless-existing-authority-is-detected' },
    accessibility: { required: true },
    responsive: { required: true },
    content: { clarity: 'required', errorRecovery: 'required' }
  };
}

function verificationFor(requirement) {
  return requirement.capabilities.map((capability) => ({
    requirementId: requirement.id,
    capability,
    methods: capability === 'payments'
      ? ['unit', 'integration', 'security', 'browser', 'production']
      : capability === 'booking'
        ? ['unit', 'integration', 'browser', 'user-journey']
        : ['unit', 'integration']
  }));
}

export async function compileResolved(resolved) {
  const standard = await composeStandard({ version: '1.0.0', changeClass: resolved.requirement.changeClass });
  return {
    schemaVersion: '1.0.0',
    compilerVersion: '1.0.0',
    requirement: resolved.requirement,
    capabilities: resolved.capabilities,
    solutions: resolved.solutions,
    design: designFor(resolved.requirement),
    standard,
    verification: verificationFor(resolved.requirement),
    mappings: resolved.mappings.map((mapping) => mapping.id)
  };
}
