---
name: calystr-intent
description: Resolve vague product intent into requirements and recommendations while asking users only for business judgement.
---

# Calystr Intent Resolution

Call `calystr_compile` with the user's product intent before asking questions. Use the returned Requirement, Capability Graph, mature-solution recommendations and business-decision advice as the source of truth for intent resolution.

Inspect the repository and available facts before asking questions. Technical unknowns are not user questions: resolve them through repository inspection, current official support information, mature-solution knowledge and the harness.

For every question that genuinely requires user business judgement, use the exact decision key emitted by `calystr_compile`, provide its options, recommendation, reasoning and trade-offs, and obtain one explicit selection. After the user answers, call `calystr_compile` again with all confirmed decision key/selection pairs so the Requirement becomes confirmed rather than leaving business choices only in conversation text.

Do not ask users to choose frameworks, databases, testing tools, architecture patterns, package managers, security scanners or other technical facts that the harness can determine.

Produce traceable Requirement and Capability context before implementation. Do not treat Agent claims, conversational confidence or inferred user silence as confirmation of a business decision.
