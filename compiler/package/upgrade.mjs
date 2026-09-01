import { readFile, writeFile } from 'node:fs/promises';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';
import { analyseStandardUpgrade, applyStandardUpgrade } from '../../standard/versioning.mjs';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function migrationPlan(analysis) {
  return Object.freeze({
    required: analysis.change === 'MAJOR' || analysis.changedAreas.length > 0,
    change: analysis.change,
    affectedAreas: [...analysis.changedAreas],
    steps: analysis.changedAreas.map((area) => `Review ${area} impact and re-verify affected requirements.`)
  });
}

export async function checkProjectUpgrade({ cwd = process.cwd(), candidatePath }) {
  if (!candidatePath) throw new Error('check-upgrades requires a Standard candidate descriptor path');
  const lock = await readJson(`${cwd}/.calystr/lock.json`);
  const candidate = await readJson(candidatePath);
  const analysis = analyseStandardUpgrade({ lock, candidate });
  return Object.freeze({ analysis, migration: migrationPlan(analysis) });
}

export async function upgradeProject({
  cwd = process.cwd(),
  candidatePath,
  allowMajor = false,
  assess = evaluateAssessment,
  collectGit = collectGitEvidence
}) {
  if (!candidatePath) throw new Error('upgrade requires a Standard candidate descriptor path');
  const manifestPath = `${cwd}/.calystr/manifest.json`;
  const lockPath = `${cwd}/.calystr/lock.json`;
  const manifest = await readJson(manifestPath);
  const lock = await readJson(lockPath);
  const candidate = await readJson(candidatePath);
  const applied = applyStandardUpgrade({ manifest, lock, candidate, allowMajor });
  const migration = migrationPlan(applied.analysis);

  if (!applied.changed) {
    return Object.freeze({ ...applied, migration, reassessment: null });
  }
  if (!candidate.standardDefinition) {
    throw new Error('Upgrade candidate requires standardDefinition for reassessment');
  }

  await writeFile(manifestPath, JSON.stringify(applied.manifest, null, 2));
  await writeFile(lockPath, JSON.stringify(applied.lock, null, 2));

  const gitEvidence = collectGit({ cwd });
  const reassessment = await assess({
    standard: candidate.standardDefinition,
    evidence: [gitEvidence],
    targetRevision: gitEvidence.scope.commit,
    blockers: []
  });

  return Object.freeze({ ...applied, migration, reassessment });
}
