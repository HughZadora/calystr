export type CompilerStage = 'parse' | 'normalise' | 'map' | 'resolve' | 'compile' | 'validate' | 'package';

export interface CompilerContext {
  sourceVersion: string;
  schemaVersion: string;
  standardVersion: string;
  compilerVersion: string;
  harnessCompatibility: string[];
}

export interface CompilerStageHandler<Input = unknown, Output = unknown> {
  readonly stage: CompilerStage;
  run(input: Input, context: CompilerContext): Promise<Output>;
}
