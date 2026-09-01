import { Type } from '@earendil-works/pi-ai';
import { defineTool, type ExtensionAPI, type ExtensionContext } from '@earendil-works/pi-coding-agent';
import { compileIntent } from '../../../compiler/index.mjs';

function formatAdvice(advice: any[]): string {
  if (!advice.length) return 'Business decisions: confirmed; no further business judgement required';
  return advice
    .map((item) => {
      const options = item.options
        .map((option: any) => `  - ${option.id}: ${option.label} — ${option.tradeOffs.join('; ')}`)
        .join('\n');
      return [
        `Decision key: ${item.unknown}`,
        `Question: ${item.question}`,
        options,
        `Recommendation: ${item.recommendation}`,
        `Reason: ${item.reason}`
      ].join('\n');
    })
    .join('\n\n');
}

function deliveryContext(output: any): string {
  const solutions = output.compiled.solutions
    .map((item: any) => {
      const candidate = item.candidate ?? (item.candidates?.length ? item.candidates.join(' + ') : 'custom implementation');
      return `${item.capability}: ${item.decision} (${candidate}) — ${item.why}`;
    })
    .join('\n');
  const plan = output.compiled.implementationPlan.workstreams
    .map((item: any) => `${item.capability}: ${item.implementation}; verify with ${item.verification.join(', ')}`)
    .join('\n');
  const capabilities = output.compiled.capabilities.map((item: any) => item.definition).join(', ');

  return [
    '[Calystr executable product standard]',
    `Requirement: ${output.compiled.requirement.intent}`,
    `Requirement readiness: ${output.compiled.quantification.readiness}`,
    `Change class: ${output.compiled.requirement.changeClass}`,
    `Capability graph: ${capabilities}`,
    `Solution decisions:\n${solutions}`,
    formatAdvice(output.compiled.advice),
    `Delivery plan:\n${plan}`,
    `Engineering initialization: ${output.compiled.engineering.initialization.sequence.join(' → ')}`,
    `Standard: ${output.manifest.standard}@${output.manifest.version}`,
    `Versions: schema=${output.compiled.versions.schema}, compiler=${output.compiled.versions.compiler}, harness=${output.compiled.versions.harnessCompatibility}`,
    'Do not ask the user for technical choices. Resolve repository facts, current supported toolchains, architecture, testing and implementation through the harness.',
    'If business decisions remain, ask only those decisions using the supplied options/recommendation/trade-offs, then call calystr_compile again with the confirmed selections.',
    'Agent claims are not Evidence. Use external runners/adapters and OPA for final Assessment.'
  ].join('\n');
}

const calystrCompileTool = defineTool({
  name: 'calystr_compile',
  label: 'Calystr Compile',
  description:
    'Compile a product intent into the Calystr Requirement/Capability/Solution/Design/Delivery Standard. Use it before implementation and call it again after the user confirms any required business decisions.',
  parameters: Type.Object({
    intent: Type.String({ description: 'The user product intent to compile.' }),
    businessDecisions: Type.Optional(
      Type.Array(
        Type.Object({
          key: Type.String({ description: 'Business decision key emitted by a previous Calystr compilation.' }),
          selection: Type.String({ description: 'Selected option id for the business decision.' })
        })
      )
    )
  }),
  async execute(_toolCallId, params) {
    const businessDecisions = Object.fromEntries(
      (params.businessDecisions ?? []).map((decision) => [decision.key, decision.selection])
    );
    const output = await compileIntent(params.intent, { businessDecisions });
    return {
      content: [{ type: 'text', text: deliveryContext(output) }],
      details: {
        manifest: output.manifest,
        requirement: output.compiled.requirement,
        quantification: output.compiled.quantification,
        capabilities: output.compiled.capabilities,
        solutions: output.compiled.solutions,
        advice: output.compiled.advice,
        design: output.compiled.design,
        implementationPlan: output.compiled.implementationPlan,
        versions: output.compiled.versions
      }
    };
  }
});

export default function calystrExtension(pi: ExtensionAPI): void {
  pi.registerTool(calystrCompileTool);
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
        pi.sendUserMessage(deliveryContext(output));
        ctx.ui.notify('Calystr standard context queued', 'info');
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : 'Calystr compilation failed', 'error');
      }
    }
  });
}
