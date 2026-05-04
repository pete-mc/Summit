# Phase 1 Complete: Inject per-card export buttons on /sia

Implemented per-card Summit Export button injection for SIA project cards on `/sia`, including route wiring, stable action-area anchoring, rerender deduplication, and Terrain style/scoped-attribute mirroring. Export click behavior remains intentionally placeholder-only for this phase.

## Files created/changed

- `src/components/siaTransfer.ts`
- `src/components/index.ts`
- `src/router/SummitRouter.ts`
- `tests/unit/components/siaTransfer.spec.ts`

## Functions created/changed

- `InitSiaTransfer` (`src/components/siaTransfer.ts`)
- `getAnchorButton` (`src/components/siaTransfer.ts`)
- `setClasses` (`src/components/siaTransfer.ts`)
- `copyScopedAttributes` (`src/components/siaTransfer.ts`)
- `createExportButton` (`src/components/siaTransfer.ts`)

## Tests created/changed

- `InitSiaTransfer` suite (`tests/unit/components/siaTransfer.spec.ts`)
  - injects one button per card + mirrors class/data-v
  - places button adjacent to existing actions
  - dedupes on rerender and injects only for new cards

## Review Status

APPROVED

## Git Commit Message

feat: inject SIA export buttons on cards

- add /sia route hook to initialize Summit SIA transfer UI
- inject one export button per card with dedupe and action-area anchoring
- mirror Terrain classes and scoped attributes; add unit tests
