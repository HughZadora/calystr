package calystr.assessment

pass_input := {
  "targetRevision": "abc123",
  "standard": {"requiredEvidence": ["git", "tests"]},
  "blockers": [],
  "evidence": [
    {"kind": "git", "claim": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "tests", "claim": "tests", "status": "PASS", "digest": "sha256:2", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
  ],
}

critical_input := {
  "targetRevision": "abc123",
  "standard": {"requiredEvidence": ["git", "tests", "security", "sbom", "operations", "release-provenance"]},
  "blockers": [],
  "evidence": [
    {"kind": "git", "claim": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "tests", "claim": "tests", "status": "PASS", "digest": "sha256:2", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "security", "claim": "security", "status": "PASS", "digest": "sha256:3", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "sbom", "claim": "sbom", "status": "PASS", "digest": "sha256:4", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "operations", "claim": "operations", "status": "PASS", "digest": "sha256:5", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "release-provenance", "claim": "release", "status": "PASS", "digest": "sha256:6", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
  ],
}

commercial_targets := {
  "functional": "COMMERCIAL",
  "design": "COMMERCIAL",
  "engineering": "COMMERCIAL",
  "security": "COMMERCIAL",
  "reliability": "COMMERCIAL",
  "operability": "COMMERCIAL",
  "maintainability": "COMMERCIAL",
  "commercialFit": "COMMERCIAL",
}

commercial_maturity := {
  "functional": "COMMERCIAL",
  "design": "COMMERCIAL",
  "engineering": "COMMERCIAL",
  "security": "COMMERCIAL",
  "reliability": "COMMERCIAL",
  "operability": "COMMERCIAL",
  "maintainability": "COMMERCIAL",
  "commercialFit": "COMMERCIAL",
}

commercial_input := {
  "targetRevision": "abc123",
  "requirementCoverage": {"required": 2, "verified": 2, "failed": 0},
  "standard": {"requiredEvidence": ["git", "tests", "security", "design"], "maturity": {"targets": commercial_targets}},
  "maturity": commercial_maturity,
  "blockers": [],
  "evidence": [
    {"kind": "git", "claim": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "tests", "claim": "tests", "status": "PASS", "digest": "sha256:2", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "security", "claim": "security", "status": "PASS", "digest": "sha256:3", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
    {"kind": "design", "claim": "design", "status": "PASS", "digest": "sha256:4", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true},
  ],
}

test_pass_when_all_required_current_evidence_exists if {
  result.verdict == "PASS" with input as pass_input
}

test_critical_pass_requires_release_provenance if {
  result.verdict == "PASS" with input as critical_input
}

test_critical_unknown_without_release_provenance if {
  without_release := object.union(critical_input, {"evidence": array.slice(critical_input.evidence, 0, 5)})
  result.verdict == "UNKNOWN" with input as without_release
  result.missingEvidence == ["release-provenance"] with input as without_release
}

test_unknown_when_required_evidence_is_missing if {
  missing := object.union(pass_input, {"evidence": []})
  result.verdict == "UNKNOWN" with input as missing
}

test_stale_evidence_is_unknown if {
  stale := object.union(pass_input, {"evidence": [{"kind": "git", "claim": "git", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "old"}, "integrityValid": true, "trusted": true}]})
  result.verdict == "UNKNOWN" with input as stale
}

test_tampered_evidence_fails if {
  tampered := object.union(pass_input, {"evidence": [{"kind": "git", "claim": "git", "status": "PASS", "digest": "sha256:bad", "scope": {"commit": "abc123"}, "integrityValid": false, "trusted": true}]})
  result.verdict == "FAIL" with input as tampered
}

test_untrusted_evidence_never_passes if {
  fake := object.union(pass_input, {"evidence": [{"kind": "git", "claim": "fake", "status": "PASS", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": false}]})
  result.verdict == "UNKNOWN" with input as fake
}

test_failure_wins_over_missing_evidence if {
  failed := object.union(pass_input, {"evidence": [{"kind": "git", "claim": "git", "status": "FAIL", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true}]})
  result.verdict == "FAIL" with input as failed
}

test_blocker_wins_over_failure if {
  blocked := object.union(pass_input, {"blockers": ["business-decision"], "evidence": [{"kind": "git", "claim": "git", "status": "FAIL", "digest": "sha256:1", "scope": {"commit": "abc123"}, "integrityValid": true, "trusted": true}]})
  result.verdict == "BLOCKED" with input as blocked
}

test_commercial_readiness_requires_all_product_dimensions_and_maturity_targets if {
  result.requirementStatus == "PASS" with input as commercial_input
  result.designStatus == "PASS" with input as commercial_input
  result.engineeringStatus == "PASS" with input as commercial_input
  result.securityStatus == "PASS" with input as commercial_input
  result.evidenceStatus == "PASS" with input as commercial_input
  result.maturityStatus == "PASS" with input as commercial_input
  result.commercialReadiness == "PASS" with input as commercial_input
  result.knownGaps == [] with input as commercial_input
}

test_below_target_maturity_prevents_commercial_readiness if {
  immature := object.union(commercial_input, {"maturity": object.union(commercial_maturity, {"security": "PRODUCTION"})})
  result.maturityStatus == "FAIL" with input as immature
  result.commercialReadiness == "FAIL" with input as immature
  "maturity:security:below-target" in result.knownGaps with input as immature
}

test_evidence_pass_does_not_hide_unknown_product_dimensions if {
  result.verdict == "PASS" with input as pass_input
  result.commercialReadiness == "UNKNOWN" with input as pass_input
  "requirement-coverage:unknown" in result.knownGaps with input as pass_input
  "design-verification:unknown" in result.knownGaps with input as pass_input
}
