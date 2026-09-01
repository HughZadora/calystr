package evidence

#Status: "PASS" | "FAIL" | "UNKNOWN"

#Evidence: {
  id?: string
  kind: string & !=""
  claim: string & !=""
  source: string & !=""
  runner: string & !=""
  status: #Status
  command?: string
  exitCode?: int
  artifact?: string
  digest: string & !=""
  timestamp: string & !=""
  scope: [string]: _
  details: [string]: _
}
