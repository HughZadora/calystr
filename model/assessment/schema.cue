package assessment

#Verdict: "PASS" | "FAIL" | "BLOCKED" | "UNKNOWN"

#Assessment: {
  id: string & !=""
  verdict: #Verdict
  requirementStatus: #Verdict
  designStatus: #Verdict
  engineeringStatus: #Verdict
  securityStatus: #Verdict
  evidenceStatus: #Verdict
  commercialReadiness: #Verdict
  knownGaps: [...string]
  confidence: number & >=0 & <=1
  targetRevision?: string
  missingEvidence?: [...string]
  invalidEvidence?: [...string]
  untrustedEvidence?: [...string]
}
