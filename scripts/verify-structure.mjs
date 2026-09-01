import { access, readFile } from 'node:fs/promises';

const required = [
  'model/requirement', 'model/capability', 'model/solution', 'model/design', 'model/standard', 'model/evidence', 'model/assessment',
  'sources/agent/anthropic', 'sources/agent/openai', 'sources/agent/deepseek', 'sources/agent/superpowers', 'sources/agent/grill-me',
  'sources/design/apple-hig', 'sources/design/impeccable', 'sources/design/anthropic',
  'sources/commercial/iso-12207', 'sources/commercial/iso-29148', 'sources/commercial/iso-16326', 'sources/commercial/itil', 'sources/commercial/iso-20000', 'sources/commercial/oscal',
  'sources/verification/openapi', 'sources/verification/scorecard', 'sources/verification/osv', 'sources/verification/deps-dev', 'sources/verification/junit', 'sources/verification/sarif', 'sources/verification/cyclonedx',
  'mappings/agent', 'mappings/design', 'mappings/commercial', 'mappings/solution', 'mappings/verification',
  'standard/commercial', 'standard/product', 'standard/design', 'standard/engineering', 'standard/security', 'standard/testing', 'standard/operations', 'standard/change-class',
  'compiler/parse', 'compiler/normalise', 'compiler/map', 'compiler/resolve', 'compiler/compile', 'compiler/validate', 'compiler/package',
  'policy/rego', 'adapters/pi', 'adapters/pi/extensions', 'adapters/pi/skills/calystr-intent', 'adapters/pi/skills/calystr-delivery',
  'adapters/git', 'adapters/junit', 'adapters/sarif', 'adapters/cyclonedx',
  'tests/model', 'tests/compiler', 'tests/mappings', 'tests/policy', 'tests/adapters', 'tests/integration', 'tests/adversarial',
  'examples/web-saas', 'examples/commercial-product', 'docs/architecture', 'docs/domain', 'docs/compiler', 'docs/standard', 'docs/runtime', 'docs/decisions', '.github/workflows', 'cue.mod'
];
for (const path of required) await access(path);
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (packageJson.name !== 'calystr') throw new Error('package name must be calystr');
if (packageJson.license === 'MIT') throw new Error('MIT licence is prohibited');
if (!packageJson.pi?.extensions?.includes('adapters/pi/extensions/calystr.ts')) throw new Error('Pi extension wiring missing');
if (!packageJson.pi?.skills?.includes('adapters/pi/skills')) throw new Error('Pi skills wiring missing');
console.log(`Calystr Phase 1 structure verified and Pi package wiring present (${required.length} boundaries).`);
