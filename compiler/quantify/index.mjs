export function quantifyRequirement(requirement) {
  if (!requirement?.id) throw new Error('Requirement quantification requires a Requirement');

  const coverageObligations = requirement.acceptance.map((criterion, index) => ({
    id: `QNT-${String(index + 1).padStart(3, '0')}`,
    requirementId: requirement.id,
    criterion
  }));

  return Object.freeze({
    requirementId: requirement.id,
    changeClass: requirement.changeClass,
    coverage: {
      denominatorSource: 'requirement.acceptance',
      required: coverageObligations.length,
      obligations: coverageObligations
    },
    scope: {
      requestedCapabilities: requirement.capabilities.length,
      constraints: requirement.constraints.length,
      riskSignals: requirement.risk.length
    },
    unresolvedBusinessDecisions: requirement.unknowns.length,
    readiness: requirement.unknowns.length === 0 ? 'READY_FOR_DELIVERY' : 'BUSINESS_DECISION_REQUIRED'
  });
}
