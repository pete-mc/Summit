# Summit Integration API v0 (Future Public Contract)

Stable internal-first contract for Summit-mediated integrations, designed to become public with minimal shape changes.

## Scope and goals

- Define one consistent integration surface across Summit runtime features.
- Keep contract semantics stable through v0 while implementation details continue to evolve.
- Prefer additive changes and explicit deprecation over breaking changes.

## Domain groups

The v0 contract is organized into the following domain groups:

- `auth`
- `members`
- `events`
- `achievements`
- `templates`
- `metrics`

Every operation in `docs/API/terrain.json` is tagged with one or more of these domain names.

## Request/response contract style

### Request envelope

- REST-style resource paths with path/query parameters for selection.
- JSON payloads for mutation operations.
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json` for request bodies
  - `X-Correlation-Id` (optional; generated client-side if absent)

### Response envelope

Summit expects one of two response patterns and normalizes internally where needed:

- Collection wrapper style:
  - `{ "results": [...] }`
- Resource style:
  - `{ ...resourceFields }`

For all responses, Summit carries a `correlationId` through logs/telemetry, preferring `X-Correlation-Id` when provided by caller or upstream services.

## Error contract

The contract-level error shape is normalized as:

- `error.code` (stable machine-readable classification)
- `error.message` (human-readable summary)
- `error.details` (optional structured payload for field/path diagnostics)
- `correlationId` (for support/debug traceability)

Example normalized error payload:

- `error.code`: `EVENT_VALIDATION_FAILED`
- `error.message`: `Event start_datetime must be before end_datetime.`
- `error.details`: `{ "field": "start_datetime", "rule": "before:end_datetime" }`

## Auth model

Summit currently sources an authenticated Terrain token from runtime state and applies it as a bearer token.

### Token provider abstraction

To keep the contract internal-first but public-ready, client code should depend on a provider abstraction rather than direct Terrain globals:

`TokenProvider`

- `getToken(): Promise<string | undefined> | string | undefined`
- `getMemberId?(): string | undefined`
- `getUnitId?(): string | undefined`

The implementation can resolve from Terrain state now and later from external integrator credentials without changing endpoint shapes.

## Versioning and compatibility

- Current contract version: **v0**.
- v0 policy: internal stability baseline with public-readiness constraints.
- **Non-breaking changes** are preferred:
  - add optional fields
  - add optional query parameters
  - add new endpoints/domains
- Breaking changes require:
  - explicit deprecation window
  - migration notes
  - next major contract version

### Future public stance

When exposed publicly, this contract should preserve v0 resource paths, domain group semantics, and error normalization rules. Public hardening (rate limiting, explicit SLAs, partner onboarding docs) should be added without changing core request/response shapes.
