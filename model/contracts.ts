export type ChangeClass = 'TRIVIAL' | 'SMALL' | 'STANDARD' | 'HIGH_RISK' | 'CRITICAL';
export type Verdict = 'PASS' | 'FAIL' | 'BLOCKED' | 'UNKNOWN';
export type SolutionDecision = 'ADOPT' | 'ADAPT' | 'COMBINE' | 'BUILD';

export interface Requirement { id: string; intent: string; context: Record<string, unknown>; capabilities: string[]; constraints: string[]; acceptance: string[]; risk: string[]; changeClass: ChangeClass; unknowns: string[]; }
export interface Capability { id: string; definition: string; dependencies: string[]; requirements: string[]; solutions: string[]; risks: string[]; verification: string[]; }
export interface Solution { id: string; identity: string; source: string; licence: string; capabilities: string[]; compatibility: Record<string, unknown>; evidence: string[]; maturitySignals: Record<string, unknown>; risks: string[]; costs: Record<string, unknown>; fitness: Record<string, unknown>; decision: SolutionDecision; }
export interface Design { id: string; product: Record<string, unknown>; experience: Record<string, unknown>; interaction: Record<string, unknown>; visual: Record<string, unknown>; accessibility: Record<string, unknown>; responsive: Record<string, unknown>; content: Record<string, unknown>; }
export interface Standard { id: string; version: string; requiredOutcomes: string[]; requiredQuality: string[]; requiredVerification: string[]; applicableConstraints: string[]; }
export interface Evidence { id: string; kind: string; claim: string; source: string; runner: string; status?: 'PASS' | 'FAIL' | 'UNKNOWN'; command?: string; exitCode?: number; artifact?: string; digest: string; timestamp: string; scope: { commit?: string; [key: string]: unknown }; }
export interface Assessment { id: string; requirementStatus: Verdict; designStatus: Verdict; engineeringStatus: Verdict; securityStatus: Verdict; evidenceStatus: Verdict; commercialReadiness: Verdict; knownGaps: string[]; confidence: number; }
