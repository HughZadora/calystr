import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collectGitEvidence } from '../../adapters/git/index.mjs';
import { evaluateAssessment } from '../../policy/evaluate.mjs';
import { composeStandard } from '../../standard/index.mjs';
import { createProjectBinding } from './binding.mjs';

const capabilityDependencies = Object.freeze({
  payments: ['stripe', '@stripe/stripe-js'],
  authentication: ['next-auth', '@auth/core', 'keycloak-connect'],
  'relational-storage': ['pg', 'postgres', 'prisma', '@prisma/client'],
  api: ['express', 'fastify', 'hono', '@hono/node-server', 'next'],
  notifications: ['nodemailer', 'resend', '@sendgrid/mail']
});

const webDependencies = new Set(['next', 'react', 'vue', 'svelte', '@sveltejs/kit', 'astro', 'nuxt']);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readPackage(cwd) {
  const path = join(cwd, 'package.json');
  if (!(await exists(path))) return null;
  return JSON.parse(await readFile(path, 'utf8'));
}

function allDependencies(packageJson) {
  return new Set([
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {})
  ]);
}

function detectCapabilities(dependencies) {
  const capabilities = [];
  const signals = [];
  for (const [capability, packages] of Object.entries(capabilityDependencies)) {
    const matches = packages.filter((dependency) => dependencies.has(dependency));
    if (matches.length === 0) continue;
    capabilities.push(capability);
    signals.push({ capability, source: 'package-dependency', matches });
  }
  return { capabilities: capabilities.sort(), signals };
}

async function detectProjectType(cwd, packageJson, dependencies) {
  if (packageJson && [...webDependencies].some((dependency) => dependencies.has(dependency))) return 'web';
  if (packageJson) return 'node';
  if (await exists(join(cwd, 'pyproject.toml'))) return 'python';
  if (await exists(join(cwd, 'go.mod'))) return 'go';
  if (await exists(join(cwd, 'Cargo.toml'))) return 'rust';
  return 'unknown';
}

async function detectPackageManager(cwd) {
  if (await exists(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(join(cwd, 'package-lock.json'))) return 'npm';
  if (await exists(join(cwd, 'yarn.lock'))) return 'yarn';
  return null;
}

export async function inspectExistingProject({ cwd = process.cwd() } = {}) {
  const packageJson = await readPackage(cwd);
  const dependencies = allDependencies(packageJson);
  const capabilityMap = detectCapabilities(dependencies);
  const projectType = await detectProjectType(cwd, packageJson, dependencies);
  const packageManager = await detectPackageManager(cwd);

  return Object.freeze({
    repository: cwd,
    project: {
      name: packageJson?.name ?? null,
      description: packageJson?.description ?? null,
      projectType,
      runtime: packageJson ? 'node' : projectType === 'unknown' ? null : projectType,
      packageManager
    },
    capabilities: capabilityMap.capabilities,
    capabilitySignals: capabilityMap.signals
  });
}

export async function initialiseExistingProject({
  cwd = process.cwd(),
  assess = evaluateAssessment,
  collectGit = collectGitEvidence
} = {}) {
  const inspection = await inspectExistingProject({ cwd });
  const changeClass = inspection.capabilities.includes('payments') ? 'HIGH_RISK' : 'STANDARD';
  const standard = await composeStandard({ version: '1.0.0', changeClass });
  const binding = createProjectBinding({ standard, projectType: inspection.project.projectType });
  const gitEvidence = collectGit({ cwd });
  const initialAssessment = await assess({
    standard,
    evidence: [gitEvidence],
    targetRevision: gitEvidence.scope.commit,
    blockers: []
  });

  return Object.freeze({
    inspection,
    standardRecommendation: {
      standard: standard.identity.name,
      version: standard.identity.version,
      changeClass,
      reason: 'Commercial Product Standard selected from repository facts and detected risk signals.'
    },
    binding,
    existingEvidence: [gitEvidence],
    initialAssessment
  });
}
