export const runtimeStates = Object.freeze(['ACTIVE', 'COMPLETE', 'BLOCKED', 'CANCELLED']);

export const requiredHarnessCapabilities = Object.freeze([
  'session', 'goal', 'context', 'skill-loading', 'tool-execution', 'subagent', 'resume', 'handoff'
]);

export function createHandoff({ status, summary, verified = [], openItems = [], blockers = [], nextSteps = [] }) {
  if (!runtimeStates.includes(status)) throw new Error(`Invalid handoff status: ${status}`);
  if (!summary?.trim()) throw new Error('Handoff summary is required');
  return Object.freeze({ status, summary, verified: [...verified], openItems: [...openItems], blockers: [...blockers], nextSteps: [...nextSteps] });
}

export function createRuntimeTrace({ sessionId, goalId, runId, round, step }) {
  if (![sessionId, goalId, runId].every(Boolean)) throw new Error('Session, Goal and Run identifiers are required');
  if (!Number.isInteger(round) || round < 1) throw new Error('Round must be a positive integer');
  if (!Number.isInteger(step) || step < 1) throw new Error('Step must be a positive integer');
  return Object.freeze({ sessionId, goalId, runId, round, step });
}

export function validateHarnessCapabilities(capabilities) {
  const available = new Set(capabilities);
  return requiredHarnessCapabilities.filter((capability) => !available.has(capability));
}
