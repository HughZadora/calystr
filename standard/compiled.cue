package standard

#CompiledStandard: {
  identity: {
    name: string & !=""
    version: string & !=""
    digest?: string
  }
  requirements: [...string]
  outcomes: [...string]
  verification: [...string]
  constraints: [...string]
  harness: {
    runtime: "pi"
    requiredCapabilities: [...string]
  }
}
