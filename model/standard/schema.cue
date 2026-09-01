package standardmodel

#Standard: {
  id: string & !=""
  version: string & !=""
  requiredOutcomes: [...string]
  requiredQuality: [...string]
  requiredVerification: [...string]
  applicableConstraints: [...string]
}
