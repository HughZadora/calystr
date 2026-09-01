---
name: calystr-delivery
description: Deliver work using Calystr Requirement → Capability → Solution → Design → Implementation → Verification → Evidence → Assessment traceability.
---

# Calystr Delivery

1. Call `calystr_compile` on the user's product intent before implementation. Treat its Requirement, Capability Graph, Solution decisions, Design and Delivery Plan as the active product context.
2. If `calystr_compile` returns business decisions, ask only those decisions. Present the emitted options, recommendation, reason and trade-offs, then call `calystr_compile` again with the confirmed decision keys/selections. Do not begin delivery while Requirement readiness still says `BUSINESS_DECISION_REQUIRED` unless the work is explicitly limited to non-blocking discovery.
3. Before generating project configuration, execute the core engineering initialization sequence in order: identify the current date and platform, query official current support, resolve runtime requirements, resolve dependency compatibility, then generate configuration once.
4. Never seed runtime, framework, SDK, GitHub Actions, compiler, package-manager, linter, formatter, test, security or policy versions from remembered or stale template defaults.
5. Prefer the project's established stack-native mainstream tools for commodity gates. Do not hand-roll generic lint, format, test, type, security or policy gates when a maintained ecosystem tool exists.
6. Confirm the current Requirement and complete Capability Graph, including derived technical dependencies.
7. Evaluate mature solutions before BUILD. Preserve Candidate, Why, advantages, disadvantages, risks, costs, integration and Recommendation context.
8. Treat Design as a first-class product artefact before implementation. Existing visual authority must be detected before deciding whether to preserve or create a design system.
9. Follow the compiled Delivery Plan rather than inventing a parallel implementation workflow.
10. Plan verification from Requirement acceptance and Capability risk, not from whatever tests already happen to exist.
11. Implement using design-before-code, appropriate TDD and root-cause debugging patterns.
12. Run external verification and normalise native results into Evidence. Browser/UX results must come from an external runner; Agent design claims are not Evidence.
13. Keep Evidence revision-scoped and reject stale, untrusted or modified Evidence.
14. Use OPA as the only final decision engine. UNKNOWN must never become PASS implicitly.
15. Commercial Readiness requires Requirement, Design, Engineering, Security, Evidence and Commercial Maturity dimensions to satisfy the compiled Standard; a green test suite alone is not product completion.
16. Use bounded Handoff for fresh agents and long-running work. Carry Goal, Requirement, verified results, open items, blockers and next steps rather than the entire transcript.
