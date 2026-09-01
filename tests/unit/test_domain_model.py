from calystr.model import (
    Assessment,
    Capability,
    Design,
    Evidence,
    Requirement,
    RequirementKind,
    Solution,
    Standard,
)


def test_domain_entities_are_immutable_and_typed():
    requirement = Requirement("REQ-001", "System shall be verifiable.", RequirementKind.FUNCTIONAL)
    capability = Capability("CAP-001", "Verification", "Provides verification.", (requirement.id,))
    solution = Solution("SOL-001", "Reference implementation", (capability.id,))
    design = Design("DSN-001", "Reference design", solution.id)
    evidence = Evidence("EVD-001", "test", design.id, "tests/unit", "sha256:example")
    standard = Standard("STD-001", "Calystr Standard", "0.1.0", (requirement.id,), (capability.id,), (evidence.id,))
    assessment = Assessment("ASM-001", standard.id, solution.id, True, (evidence.id,))

    assert requirement.kind is RequirementKind.FUNCTIONAL
    assert capability.requirement_refs == (requirement.id,)
    assert solution.capability_refs == (capability.id,)
    assert design.solution_ref == solution.id
    assert standard.version == "0.1.0"
    assert assessment.passed is True
