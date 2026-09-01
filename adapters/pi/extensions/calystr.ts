import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import { compileIntent } from '../../../compiler/index.mjs';

function formatAdvice(advice: any[]): string {
  if (!advice.length) return 'Business decisions: none required';
  return advice
    .map((item) => {
      const options = item.options
        .map((option: any) => `  - ${option.id}: ${option.label} — ${option.tradeOffs.join('; ')}`)
        .join('\n');
      return [`Decision: ${item.question}`, options, `Recommendation: ${item.recommendation}`, `Reason: ${item.reason}`].join('\n');
    })
    .join('\n\n');
}

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
        const solutions = output.compiled.solutions
          .map((item: any) => `${item.capability}: ${item.decision}${item.candidate ? ` (${item.candidate})` : ''} — ${item.why}`)
          .join('\n');
        const message = [
          '[Calystr executable product standard]',
          `Requirement: ${output.compiled.requirement.intent}`,
          `Change class: ${output.compiled.requirement.changeClass}`,
          `Capabilities: ${output.compiled.requirement.capabilities.join(', ')}`,
          `Solution decisions:\n${solutions}`,
          formatAdvice(output.compiled.advice),
          `Standard: ${output.manifest.standard}@${output.manifest.version}`,
          'Proceed without asking for technical choices. Ask only the business decisions above when they are necessary to continue. Agent claims are not evidence; use runners/adapters and OPA for final assessment.'
        ].join('\n');
        pi.sendUserMessage(message);
        ctx.ui.notify('Calystr standard context queued', 'info');
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : 'Calystr compilation failed', 'error');
      }
    }
  });
}
