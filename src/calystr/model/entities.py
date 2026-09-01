"""Canonical Calystr domain entities for the Phase 1 foundation."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Mapping, Tuple


class RequirementKind(str, Enum):
    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    CONSTRAINT = "constraint"


@dataclass(frozen=True)
class Requirement:
    id: str
    statement: str
    kind: RequirementKind
    source_refs: Tuple[str, ...] = ()


@dataclass(frozen=True)
class Capability:
    id: str
    name: str
    description: str
    requirement_refs: Tuple[str, ...] = ()


@dataclass(frozen=True)
class Solution:
    id: str
    name: str
    capability_refs: Tuple[str, ...] = ()
    metadata: Mapping[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class Design:
    id: str
    name: str
    solution_ref: str
    decisions: Tuple[str, ...] = ()


@dataclass(frozen=True)
class Standard:
    id: str
    name: str
    version: str
    requirement_refs: Tuple[str, ...] = ()
    capability_refs: Tuple[str, ...] = ()
    evidence_refs: Tuple[str, ...] = ()


@dataclass(frozen=True)
class Evidence:
    id: str
    kind: str
    subject_ref: str
    locator: str
    digest: str


@dataclass(frozen=True)
class Assessment:
    id: str
    standard_ref: str
    subject_ref: str
    passed: bool
    evidence_refs: Tuple[str, ...] = ()
