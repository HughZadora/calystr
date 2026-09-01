package calystr.assessment

required_kinds := {kind | some kind in input.standard.requiredEvidence}

evidence_kinds := {e.kind |
  some e in input.evidence
  e.digest != ""
  e.scope.commit == input.targetRevision
}

missing_evidence := required_kinds - evidence_kinds

has_blocker if {
  count(input.blockers) > 0
}

has_failure if {
  some e in input.evidence
  e.status == "FAIL"
}

default verdict := "UNKNOWN"

verdict := "BLOCKED" if {
  has_blocker
}

verdict := "FAIL" if {
  not has_blocker
  has_failure
}

verdict := "UNKNOWN" if {
  not has_blocker
  not has_failure
  count(missing_evidence) > 0
}

verdict := "PASS" if {
  not has_blocker
  not has_failure
  count(required_kinds) > 0
  count(missing_evidence) == 0
}

result := {
  "verdict": verdict,
  "missingEvidence": sort([kind | some kind in missing_evidence]),
  "targetRevision": input.targetRevision,
}
