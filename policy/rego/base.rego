package calystr.assessment

required_kinds := {kind | some kind in input.standard.requiredEvidence}

current_trusted_evidence := [e |
  some e in input.evidence
  e.integrityValid == true
  e.trusted == true
  e.digest != ""
  e.scope.commit == input.targetRevision
]

evidence_kinds := {e.kind | some e in current_trusted_evidence}

missing_evidence := required_kinds - evidence_kinds

invalid_evidence := [e.claim |
  some e in input.evidence
  e.integrityValid == false
]

untrusted_evidence := [e.claim |
  some e in input.evidence
  e.integrityValid == true
  e.trusted == false
]

has_blocker if {
  count(input.blockers) > 0
}

has_integrity_failure if {
  count(invalid_evidence) > 0
}

has_untrusted_evidence if {
  count(untrusted_evidence) > 0
}

has_failure if {
  some e in current_trusted_evidence
  e.status == "FAIL"
}

kind_failed(kind) if {
  some e in current_trusted_evidence
  e.kind == kind
  e.status == "FAIL"
}

kind_passed(kind) if {
  kind in required_kinds
  some e in current_trusted_evidence
  e.kind == kind
  e.status == "PASS"
}

kind_status(kind) := "FAIL" if {
  kind_failed(kind)
}

kind_status(kind) := "PASS" if {
  not kind_failed(kind)
  kind_passed(kind)
}

kind_status(kind) := "UNKNOWN" if {
  not kind_failed(kind)
  not kind_passed(kind)
}

default requirement_status := "UNKNOWN"

requirement_status := "FAIL" if {
  input.requirementCoverage.failed > 0
}

requirement_status := "PASS" if {
  input.requirementCoverage.required > 0
  input.requirementCoverage.failed == 0
  input.requirementCoverage.verified >= input.requirementCoverage.required
}

default evidence_status := "UNKNOWN"

evidence_status := "FAIL" if {
  has_integrity_failure
}

evidence_status := "FAIL" if {
  not has_integrity_failure
  has_failure
}

evidence_status := "PASS" if {
  not has_integrity_failure
  not has_failure
  not has_untrusted_evidence
  count(required_kinds) > 0
  count(missing_evidence) == 0
}

default verdict := "UNKNOWN"

verdict := "BLOCKED" if {
  has_blocker
}

verdict := "FAIL" if {
  not has_blocker
  has_integrity_failure
}

verdict := "FAIL" if {
  not has_blocker
  not has_integrity_failure
  has_failure
}

verdict := "UNKNOWN" if {
  not has_blocker
  not has_integrity_failure
  not has_failure
  has_untrusted_evidence
}

verdict := "UNKNOWN" if {
  not has_blocker
  not has_integrity_failure
  not has_failure
  count(missing_evidence) > 0
}

verdict := "PASS" if {
  not has_blocker
  evidence_status == "PASS"
}

design_status := kind_status("design")
engineering_status := kind_status("tests")
security_status := kind_status("security")

default commercial_readiness := "UNKNOWN"

commercial_readiness := "BLOCKED" if {
  verdict == "BLOCKED"
}

commercial_readiness := "FAIL" if {
  verdict == "FAIL"
}

commercial_readiness := "PASS" if {
  verdict == "PASS"
  requirement_status == "PASS"
  design_status == "PASS"
  engineering_status == "PASS"
  security_status == "PASS"
}

missing_evidence_gaps := [sprintf("missing-evidence:%s", [kind]) | some kind in missing_evidence]

requirement_gaps := ["requirement-coverage:unknown" | requirement_status == "UNKNOWN"]
design_gaps := ["design-verification:unknown" | design_status == "UNKNOWN"]
engineering_gaps := ["engineering-verification:unknown" | engineering_status == "UNKNOWN"]
security_gaps := ["security-verification:unknown" | security_status == "UNKNOWN"]

known_gaps := array.concat(
  array.concat(missing_evidence_gaps, requirement_gaps),
  array.concat(array.concat(design_gaps, engineering_gaps), security_gaps),
)

default confidence := 0

confidence := (count(required_kinds) - count(missing_evidence)) / count(required_kinds) if {
  count(required_kinds) > 0
}

result := {
  "id": sprintf("ASM-%s", [input.targetRevision]),
  "verdict": verdict,
  "requirementStatus": requirement_status,
  "designStatus": design_status,
  "engineeringStatus": engineering_status,
  "securityStatus": security_status,
  "evidenceStatus": evidence_status,
  "commercialReadiness": commercial_readiness,
  "knownGaps": known_gaps,
  "confidence": confidence,
  "missingEvidence": sort([kind | some kind in missing_evidence]),
  "invalidEvidence": invalid_evidence,
  "untrustedEvidence": untrusted_evidence,
  "targetRevision": input.targetRevision,
}
