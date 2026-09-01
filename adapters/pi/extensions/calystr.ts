import type { ExtensionAPI, ExtensionContext } from '@mariozechner/pi-coding-agent';
import { compileIntent } from '../../../compiler/index.mjs';

export default function calystrExtension(pi: ExtensionAPI): void {
  pi.registerCommand('calystr', {
    description: 'Compile a product intent into a Calystr executable product standard context',
    handler: async (args: string, ctx: ExtensionContext) => {
      const intent = args.trim();
      if (!intent) {
        ctx.ui.notify('Usage: /calystr <what you want to build>', 'warning');
        return;
      }
      try {
        const output = await compileIntent(intent);
        const solutions = output.compiled.solutions.map((item) => `${item.capability}: ${item.decision}${item.candidate ? ` (${item.candidate})` : ''}`).join('\n');
        const unknowns = output.compiled.requirement.unknowns.length ? output.compiled.requirement.unknowns.join(', ') : 'none';
        const message = [
          '[Calystr executable product standard]',
          `Requirement: ${output.compiled.requirement.intent}`,
          `Change class: ${output.compiled.requirement.changeClass}`,
          `Capabilities: ${output.compiled.requirement.capabilities.join(', ')}`,
          `Solution decisions:\n${solutions}`,
          `Business-only unknowns: ${unknowns}`,
          `Standard: ${output.manifest.standard}@${output.manifest.version}`,
          'Execute against this context. Inspect technical facts yourself. Do not treat agent claims as evidence; use runners/adapters and OPA for final assessment.'
        ].join('\n');
        pi.sendUserMessage(message);
        ctx.ui.notify('Calystr standard context queued', 'info');
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : 'Calystr compilation failed', 'error');
      }
    }
  });
}
