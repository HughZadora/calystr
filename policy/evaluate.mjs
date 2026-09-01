import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { annotateEvidenceForAssessment } from '../adapters/evidence.mjs';

export async function evaluateAssessment(input, { opaPath = 'opa' } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'calystr-opa-'));
  const inputPath = join(dir, 'input.json');
  const annotatedInput = { ...input, evidence: (input.evidence ?? []).map(annotateEvidenceForAssessment) };
  try {
    await writeFile(inputPath, JSON.stringify(annotatedInput));
    const run = spawnSync(opaPath, ['eval', '--format=json', '--data', 'policy/rego', '--input', inputPath, 'data.calystr.assessment.result'], { encoding: 'utf8' });
    if (run.error) throw new Error(`OPA is required for assessment: ${run.error.message}`);
    if (run.status !== 0) throw new Error(`OPA assessment failed: ${run.stderr.trim()}`);
    const payload = JSON.parse(run.stdout);
    const value = payload.result?.[0]?.expressions?.[0]?.value;
    if (!value) throw new Error('OPA returned no assessment result');
    return value;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
