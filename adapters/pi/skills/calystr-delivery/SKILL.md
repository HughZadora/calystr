---
name: calystr-delivery
description: Deliver work using Calystr Requirement → Capability → Solution → Design → Implementation → Verification → Evidence → Assessment traceability.
---

# Calystr Delivery

1. Before generating project configuration, execute the core engineering initialization sequence in order: identify the current date and platform, query official current support, resolve runtime requirements, resolve dependency compatibility, then generate configuration once.
2. Never seed runtime, framework, SDK, GitHub Actions, compiler, package-manager, linter, formatter, test, security or policy versions from remembered or stale template defaults.
3. Prefer the project's established stack-native mainstream tools for commodity gates. Do not hand-roll generic lint, format, test, type, security or policy gates when a maintained ecosystem tool exists.
4. Confirm the current Requirement and Capability graph.
5. Evaluate mature solutions before BUILD.
6. Treat Design as a first-class product artefact before implementation.
7. Plan verification from Requirement acceptance, not from existing tests.
8. Implement using design-before-code, appropriate TDD and root-cause debugging patterns.
9. Run external verification and normalise results into Evidence.
10. Keep evidence revision-scoped and reject stale evidence.
11. Use OPA as the final gate. UNKNOWN must never become PASS implicitly.
12. Use bounded Handoff for fresh agents and long-running work.
