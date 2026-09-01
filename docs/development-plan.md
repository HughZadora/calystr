# Development Plan

## Phase 0 — Repository and governance

Establish repository topology, contribution rules, CI location, architecture decision records, and development conventions.

## Phase 1 — Architecture and domain foundation

Establish the complete project structure first. Define the canonical domain model and its validation/test boundaries for Requirement, Capability, Solution, Design, Standard, Evidence and Assessment. No runtime implementation is allowed to create a competing structure.

**Exit gate:** repository topology is stable; domain contracts are explicit; tests can target each architectural boundary.

## Phase 2 — Agent Runtime Contract

Define session, goal, run, round, step, handoff and execution semantics against the Phase 1 topology.

## Phase 3 — CUE schema and constraints

Encode the model and runtime-facing contracts in CUE where schema/constraint enforcement is required.

## Phase 4 — Knowledge mapping

Implement controlled mappings and source handling without moving domain ownership into adapters or compiler code.

## Phase 5 — Standard composition

Implement standard composition and validation.

## Phase 6 — Solution registry

Implement solution registration and retrieval within the established domain and standard boundaries.

## Phase 7 — OPA assessment

Implement policy evaluation and assessment paths.

## Phase 8 — Evidence adapters

Implement evidence integrations behind the adapter boundary.

## Phase 9 — Design and UX verification

Verify product and design outputs against standards and evidence.

## Phase 10 — Pi package and golden product

Integrate the runtime adapter and produce the first golden end-to-end product.

## Commit policy

A commit represents one coherent logical architectural or functional change. A single file must never be the unit of a commit merely because it is a file. Related files are committed together when they form one reviewable change.

## Development flow

`feature/branch` → implementation → tests → review → merge to `main`.

Direct architectural drift on `main` is prohibited.
