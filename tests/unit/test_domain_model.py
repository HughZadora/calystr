import pytest

from calystr.model import (
    Assessment,
    Capability,
    Design,
    Evidence,
    Requirement,
    RequirementKind,
    Solution,
    Standard,
    validate_entities,
)


def make_graph():
    requirement = Requirement("REQ-001", "System shall be verifiable.", RequirementKind.FUNCTIONAL)
    capability = Capability("CAP-001", "Verification", "Provides verification.", (requirement.id,))
    solution = Solution("SOL-001", "Reference implementation", (capability.id,))
    design = Design("DSN-001", "Reference design", solution.id)
    evidence = Evidence("EVD-001", "test", design.id, "tests/unit", "sha256:example")
    standard = Standard("STD-001", "Calystr Standard", "0.1.0", (requirement.id,), (capability.id,), (evidence.id,))
    assessment = Assessment("ASM-001", standard.id, solution.id, True, (evidence.id,))
    return requirement, capability, solution, design, evidence, standard, assessment


def test_complete_domain_graph_validates():
    validate_entities(make_graph())


def test_unknown_collection_reference_is_rejected():
    requirement = Requirement("REQ-001", "System shall be verifiable.", RequirementKind.FUNCTIONAL)
    capability = Capability("CAP-001", "Verification", "Provides verification.", ("REQ-404",))
    with pytest.raises(ValueError, match="unknown ids"):
        validate_entities((requirement, capability))


def test_unknown_singular_reference_is_rejected():
    design = Design("DSN-001", "Reference design", "SOL-404")
    with pytest.raises(ValueError, match="unknown id"):
        validate_entities((design,))


def test_duplicate_ids_are_rejected():
    first = Requirement("REQ-001", "First", RequirementKind.FUNCTIONAL)
    second = Requirement("REQ-001", "Second", RequirementKind.CONSTRAINT)
    with pytest.raises(ValueError, match="Duplicate"):
        validate_entities((first, second))


def test_empty_evidence_digest_is_rejected():
    evidence = Evidence("EVD-001", "test", "DSN-001", "tests/unit", "")
    with pytest.raises(ValueError, match="digest"):
        validate_entities((evidence,))
