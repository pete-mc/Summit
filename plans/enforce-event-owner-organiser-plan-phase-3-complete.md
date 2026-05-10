# Phase 3 Complete: Enforce serializer-level payload integrity

Hardened `TerrainEventItem` so outbound event payloads always preserve required unit ownership semantics and organiser ID normalization. Added focused serializer tests to lock behavior for owner and organiser fields.

**Files created/changed:**

- plans/enforce-event-owner-organiser-plan-phase-3-complete.md
- src/pages/SummitCalendar/models/TerrainEventItem.ts
- tests/unit/components/calendar-editor-payload-shape.spec.ts

**Functions created/changed:**

- `TerrainEventItem` constructor (updated serializer logic)

**Tests created/changed:**

- serializer enforces unit event_type and active unit id even when source owner fields differ
- serializer emits organisers as string ids and defaults to current member when source organisers missing

**Review Status:** APPROVED

**Git Commit Message:**
fix: harden summit event payload ownership fields

- force serializer event_type to unit with active unit id
- normalize organisers to string member ids for payload contract
- add serializer tests for owner enforcement and organiser defaults
