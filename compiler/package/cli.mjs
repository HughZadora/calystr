#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { compileIntent } from '../index.mjs';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';

const [command = 'help', ...args] = process.argv.slice(2);

function print(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }

async function compileFromArgs() {
  const intent = args.join(' ').trim();
  if (!intent) throw new Error('Usage: calystr compile <product intent>');
  return compileIntent(intent);
}

if (command === 'compile') {
  print(await compileFromArgs());
} else if (command === 'golden') {
  print(await compileIntent('Build a commercial SaaS for customer booking and online payment'));
} else if (command === 'init') {
  const output = await compileFromArgs();
  await mkdir('.calystr', { recursive: true });
  await writeFile('.calystr/manifest.json', JSON.stringify(output.manifest, null, 2));
  await writeFile('.calystr/lock.json', JSON.stringify({ standard: output.manifest.standard, version: output.manifest.version, digest: output.manifest.digest }, null, 2));
  print({ initialised: true, manifest: output.manifest });
} else if (command === 'audit') {
  const manifest = JSON.parse(await readFile('.calystr/manifest.json', 'utf8'));
  const git = collectGitEvidence();
  print({ manifest, revision: git.scope.commit, evidence: [git], status: 'UNKNOWN', reason: 'Audit collects facts; final PASS requires OPA assessment with all standard-required evidence.' });
} else if (command === 'assess') {
  const inputPath = args[0];
  if (!inputPath) throw new Error('Usage: calystr assess <assessment-input.json>');
  const input = JSON.parse(await readFile(inputPath, 'utf8'));
  print(await evaluateAssessment(input));
} else {
  process.stdout.write('Calystr 1.0.0\nCommands: compile <intent>, init <intent>, audit, assess <input.json>, golden\n');
}
