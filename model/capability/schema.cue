package capability

#Capability: {
  id: string & !=""
  definition: string & !=""
  dependencies: [...string]
  requirements: [...string]
  solutions: [...string]
  risks: [...string]
  verification: [...string]
}
