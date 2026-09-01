"""Validation rules for the canonical Calystr domain model."""
from __future__ import annotations

from dataclasses import fields
from typing import Iterable

from .entities import Assessment, Capability, Design, Evidence, Requirement, Solution, Standard


_ENTITY_TYPES = (Requirement, Capability, Solution, Design, Standard, Evidence, Assessment)


def validate_entities(entities: Iterable[object]) -> None:
    """Validate identity and reference invariants across domain entities."""
    items = tuple(entities)
    ids: set[str] = set()
    for entity in items:
        if not isinstance(entity, _ENTITY_TYPES):
            raise TypeError(f"Unsupported domain entity: {type(entity).__name__}")
        entity_id = getattr(entity, "id", "")
        if not entity_id:
            raise ValueError("Domain entity ids must be non-empty")
        if entity_id in ids:
            raise ValueError(f"Duplicate domain entity id: {entity_id}")
        ids.add(entity_id)

    for entity in items:
        for field in fields(entity):
            value = getattr(entity, field.name)
            if field.name.endswith("_refs"):
                missing = [ref for ref in value if ref not in ids]
                if missing:
                    raise ValueError(f"{entity.id} references unknown ids: {missing}")
            elif field.name.endswith("_ref") and value and value not in ids:
                raise ValueError(f"{entity.id} references unknown id: {value}")

        if isinstance(entity, Evidence) and not entity.digest:
            raise ValueError(f"Evidence {entity.id} must have a digest")
