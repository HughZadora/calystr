package solution

#Decision: "ADOPT" | "ADAPT" | "COMBINE" | "BUILD"

#Solution: {
  id: string & !=""
  identity: string & !=""
  source: string & !=""
  licence: string & !=""
  capabilities: [...string]
  compatibility: [string]: _
  evidence: [...string]
  maturitySignals: [string]: _
  risks: [...string]
  costs: [string]: _
  fitness: [string]: _
  decision: #Decision
}
