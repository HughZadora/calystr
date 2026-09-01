package calystr.assessment

pass_input := {
  "targetRevision": "abc123",
  "standard": {"requiredEvidence": ["git", "tests"]},
  "blockers": [],
  "evidence": [
    {"kind": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "abc123"}},
    {"kind": "tests", "status": "PASS", "digest": "sha256:2", "scope": {"commit": "abc123"}},
  ],
}

test_pass_when_all_required_current_evidence_exists if {
  result.verdict == "PASS" with input as pass_input
}

test_unknown_when_required_evidence_is_missing if {
  result.verdict == "UNKNOWN" with input as object.remove(pass_input, ["evidence"])
}

test_stale_evidence_is_unknown if {
  stale := object.union(pass_input, {"evidence": [{"kind": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "old"}}]})
  result.verdict == "UNKNOWN" with input as stale
}

test_failure_wins_over_missing_evidence if {
  failed := object.union(pass_input, {"evidence": [{"kind": "git", "status": "FAIL", "digest": "sha256:1", "scope": {"commit": "abc123"}}]})
  result.verdict == "FAIL" with input as failed
}

test_blocker_wins_over_failure if {
  blocked := object.union(pass_input, {"blockers": ["business-decision"], "evidence": [{"kind": "git", "status": "FAIL", "digest": "sha256:1", "scope": {"commit": "abc123"}}]})
  result.verdict == "BLOCKED" with input as blocked
}
