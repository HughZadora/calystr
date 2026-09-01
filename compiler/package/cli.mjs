#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { compileIntent } from '../index.mjs';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';
import { initialiseExistingProject } from './existing.mjs';
import { checkProjectUpgrade, upgradeProject } from './upgrade.mjs';

const [command = 'help', ...args] = process.argv.slice(2);

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function compileFromArgs() {
  const intent = args.join(' ').trim();
  if (!intent) throw new Error('Usage: calystr compile <product intent>');
  return compileIntent(intent);
}

async function writeBinding(binding) {
  await mkdir('.calystr', { recursive: true });
  await writeFile('.calystr/manifest.json', JSON.stringify(binding.manifest, null, 2));
  await writeFile('.calystr/lock.json', JSON.stringify(binding.lock, null, 2));
}

if (command === 'compile') {
  print(await compileFromArgs());
} else if (command === 'golden') {
  print(await compileIntent('Build a commercial SaaS for customer booking and online payment'));
} else if (command === 'init') {
  if (args[0] === '--existing') {
    const result = await initialiseExistingProject();
    await writeBinding(result.binding);
    print({
      initialised: true,
      existing: true,
      manifest: result.binding.manifest,
      inspection: result.inspection,
      standardRecommendation: result.standardRecommendation,
      existingEvidence: result.existingEvidence,
      initialAssessment: result.initialAssessment
    });
  } else {
    const output = await compileFromArgs();
    await writeBinding(output);
    print({ initialised: true, existing: false, manifest: output.manifest });
  }
} else if (command === 'audit') {
  const manifest = JSON.parse(await readFile('.calystr/manifest.json', 'utf8'));
  const git = collectGitEvidence();
  print({
    manifest,
    revision: git.scope.commit,
    evidence: [git],
    status: 'UNKNOWN',
    reason: 'Audit collects facts; final PASS requires OPA assessment with all standard-required evidence.'
  });
} else if (command === 'assess') {
  const inputPath = args[0];
  if (!inputPath) throw new Error('Usage: calystr assess <assessment-input.json>');
  const input = JSON.parse(await readFile(inputPath, 'utf8'));
  print(await evaluateAssessment(input));
} else if (command === 'check-upgrades') {
  const candidatePath = args[0];
  if (!candidatePath) throw new Error('Usage: calystr check-upgrades <standard-candidate.json>');
  print(await checkProjectUpgrade({ candidatePath }));
} else if (command === 'upgrade') {
  const allowMajor = args.includes('--major');
  const candidatePath = args.find((arg) => arg !== '--major');
  if (!candidatePath) throw new Error('Usage: calystr upgrade <standard-candidate.json> [--major]');
  print(await upgradeProject({ candidatePath, allowMajor }));
} else {
  process.stdout.write(
    'Calystr 1.0.0\nCommands: compile <intent>, init <intent>, init --existing, audit, assess <input.json>, check-upgrades <candidate.json>, upgrade <candidate.json> [--major], golden\n'
  );
}
