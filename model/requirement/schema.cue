package requirement

#ChangeClass: "TRIVIAL" | "SMALL" | "STANDARD" | "HIGH_RISK" | "CRITICAL"

#Requirement: {
  id: string & !=""
  intent: string & !=""
  context: [string]: _
  capabilities: [...string]
  constraints: [...string]
  acceptance: [...string]
  risk: [...string]
  changeClass: #ChangeClass
  unknowns: [...string]
}
