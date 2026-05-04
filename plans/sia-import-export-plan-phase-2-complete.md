# Phase 2 Complete: Implement project export payload and download

Validated and approved per-card SIA export behavior: each Summit Export button downloads a `summit-sia-v1` JSON payload for the clicked card, with uploads and volatile/system fields excluded. Targeted tests confirm deterministic mapping and payload contract constraints.

## Files created/changed

- `src/components/siaTransfer.ts`
- `tests/unit/components/siaTransfer.spec.ts`

## Functions created/changed

- `buildPortableProject` (`src/components/siaTransfer.ts`)
- `buildExportPayload` (`src/components/siaTransfer.ts`)
- `downloadProject` (`src/components/siaTransfer.ts`)
- `exportSiaProject` (`src/components/siaTransfer.ts`)
- `toSafeFileSegment` (`src/components/siaTransfer.ts`)

## Tests created/changed

- `InitSiaTransfer` suite additions (`tests/unit/components/siaTransfer.spec.ts`)
  - downloads `summit-sia-v1` JSON and excludes uploads/volatile fields
  - deterministic per-card mapping for export target

## Review Status

APPROVED

## Git Commit Message

test: verify SIA export payload contract

- validate per-card summit-sia-v1 export download behavior
- assert exclusion of uploads and volatile system fields
- confirm deterministic card-to-project export mapping
