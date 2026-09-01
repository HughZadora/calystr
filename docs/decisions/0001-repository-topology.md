# Architecture Decision Record 0001

## Title
Establish the Calystr V1 repository topology before feature implementation

## Status
Accepted

## Context
Calystr development spans domain modelling, runtime contracts, schema/constraint work, knowledge mapping, standards, compilation, policy, adapters and evidence. Allowing later phases to invent missing structure creates architectural drift and makes the implementation diverge from the specification.

## Decision
The complete top-level architecture is established in Phase 0/Phase 1. Later phases implement within the existing boundaries. Structural changes require a new ADR before implementation.

## Consequences
The repository may contain stable boundary documentation and placeholders before executable implementation exists. This is intentional: architecture precedes feature code.
