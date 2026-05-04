# Phase 3 Complete: Add create-only import from JSON

Implemented global SIA Import on `/sia` with hidden-file JSON flow, contract/type validation, create-only persistence, and auth/error feedback handling. Import reuses portable project shaping and excludes uploads by design.

## Files created/changed

- `src/components/siaTransfer.ts`
- `src/services/createMemberAchievement.ts`
- `src/services/index.ts`
- `tests/unit/components/siaTransfer.spec.ts`
- `tests/unit/services/createMemberAchievement.spec.ts`

## Functions created/changed

- `getGlobalActionAnchorButton` (`src/components/siaTransfer.ts`)
- `getImportInput` (`src/components/siaTransfer.ts`)
- `parseImportContract` (`src/components/siaTransfer.ts`)
- `getFeedbackMessage` (`src/components/siaTransfer.ts`)
- `importSiaProject` (`src/components/siaTransfer.ts`)
- `createImportButton` (`src/components/siaTransfer.ts`)
- `createMemberAchievement` (`src/services/createMemberAchievement.ts`)

## Tests created/changed

- `InitSiaTransfer` suite additions (`tests/unit/components/siaTransfer.spec.ts`)
  - global import button injection
  - hidden file input parse + create-only call
  - validation error path
  - API failure feedback path
  - missing-token auth guard path
- `createMemberAchievement service` (`tests/unit/services/createMemberAchievement.spec.ts`)
  - token-missing guard
  - POST request contract
  - non-OK parsed response handling
  - fetch rejection rethrow

## Review Status

APPROVED

## Git Commit Message

feat: add create-only SIA import flow

- add global /sia import button with hidden JSON file input handling
- validate summit-sia-v1 payload and create new achievements via POST only
- exclude uploads and add auth/error feedback with unit test coverage
