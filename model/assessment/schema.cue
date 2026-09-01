package assessment

#Verdict: "PASS" | "FAIL" | "BLOCKED" | "UNKNOWN"
#MaturityLevel: "EXPERIMENTAL" | "FUNCTIONAL" | "PRODUCTION" | "COMMERCIAL" | "CRITICAL"

#Assessment: {
  id: string & !=""
  requirementStatus: #Verdict
  designStatus: #Verdict
  engineeringStatus: #Verdict
  securityStatus: #Verdict
  evidenceStatus: #Verdict
  maturityStatus: #Verdict
  maturity: [string]: #MaturityLevel
  commercialReadiness: #Verdict
  knownGaps: [...string]
  confidence: number & >=0 & <=1
}
