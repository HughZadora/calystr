package evidence

#Evidence: {
  id: string & !=""
  claim: string & !=""
  source: string & !=""
  runner: string & !=""
  command?: string
  exitCode?: int
  artifact?: string
  digest: string & !=""
  timestamp: string & !=""
  scope: [string]: _
}
