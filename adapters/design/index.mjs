import { spawnSync } from 'node:child_process';
import { makeEvidence } from '../evidence.mjs';

export const requiredDesignRunnerDimensions = Object.freeze(['browser', 'accessibility', 'responsive', 'user-journey']);

function collectSpecs(suites, output = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) output.push(spec);
    collectSpecs(suite.suites, output);
  }
  return output;
}

function specStatuses(spec) {
  return (spec.tests ?? []).flatMap((test) => (test.results ?? []).map((result) => result.status).filter(Boolean));
}

function dimensionStatus(specs, dimension) {
  const tag = `@${dimension}`;
  const matching = specs.filter((spec) => `${spec.title ?? ''} ${spec.file ?? ''}`.includes(tag));
  if (matching.length === 0) return 'UNKNOWN';
  const statuses = matching.flatMap(specStatuses);
  if (statuses.some((status) => ['failed', 'timedOut', 'interrupted'].includes(status))) return 'FAIL';
  if (statuses.some((status) => status === 'passed')) return 'PASS';
  return 'UNKNOWN';
}

export function playwrightReportToDesignEvidence(report, { commit, command, exitCode = 0, artifact = 'playwright-report.json' } = {}) {
  if (!report || !Array.isArray(report.suites)) throw new Error('Invalid Playwright JSON report');
  const specs = collectSpecs(report.suites);
  const dimensions = Object.fromEntries(
    requiredDesignRunnerDimensions.map((dimension) => [dimension, dimensionStatus(specs, dimension)])
  );
  const statuses = Object.values(dimensions);
  const status = exitCode !== 0 || statuses.includes('FAIL') ? 'FAIL' : statuses.includes('UNKNOWN') ? 'UNKNOWN' : 'PASS';

  return makeEvidence({
    kind: 'design',
    claim: 'browser-design-verification',
    source: 'playwright',
    runner: 'playwright-json-adapter',
    command,
    exitCode,
    artifact,
    scope: { commit },
    status,
    details: { dimensions, requiredDimensions: [...requiredDesignRunnerDimensions], specs: specs.length }
  });
}

export function collectPlaywrightDesignEvidence({
  cwd = process.cwd(),
  commit,
  pnpmPath = 'pnpm',
  testArgs = ['exec', 'playwright', 'test', '--reporter=json'],
  spawn = spawnSync
} = {}) {
  if (!commit) throw new Error('Design Evidence requires target commit');
  const run = spawn(pnpmPath, testArgs, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' } });
  if (run.error) throw new Error(`Playwright runner is required for design verification: ${run.error.message}`);
  let report;
  try {
    report = JSON.parse(run.stdout);
  } catch (error) {
    throw new Error(`Playwright did not produce a JSON report: ${error.message}`);
  }
  return playwrightReportToDesignEvidence(report, {
    commit,
    command: [pnpmPath, ...testArgs].join(' '),
    exitCode: run.status ?? 1
  });
}
