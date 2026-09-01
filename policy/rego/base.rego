package calystr.assessment

required_kinds := {kind | some kind in input.standard.requiredEvidence}

evidence_kinds := {e.kind |
  some e in input.evidence
  e.integrityValid == true
  e.trusted == true
  e.digest != ""
  e.scope.commit == input.targetRevision
}

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
  some e in input.evidence
  e.integrityValid == true
  e.trusted == true
  e.status == "FAIL"
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
  not has_integrity_failure
  not has_failure
  not has_untrusted_evidence
  count(required_kinds) > 0
  count(missing_evidence) == 0
}

result := {
  "verdict": verdict,
  "missingEvidence": sort([kind | some kind in missing_evidence]),
  "invalidEvidence": invalid_evidence,
  "untrustedEvidence": untrusted_evidence,
  "targetRevision": input.targetRevision,
}
