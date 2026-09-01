# Agent Runtime Contract

Runtime state is independent from product state.

## Runtime objects

- Session: persistent human/agent interaction space.
- Goal: persistent completion objective attached to a Session.
- Run: one concrete execution against a Standard/Requirement context.
- Round: bounded continuation cycle within a Goal.
- Step: one model invocation plus its direct tool execution.
- Handoff: bounded state transfer for fresh agents, subagents and resume.

## Handoff

A handoff contains only status, summary, verified results, open items, blockers and next steps. Full transcripts are not runtime authority.

## Harness capabilities

The V1 Pi adapter must provide session, goal, context, skill loading, tool execution, subagent, resume and handoff capabilities.
