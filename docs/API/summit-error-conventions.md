# Summit API conventions: auth, errors, and observability

Phase 4 conventions for external-integration reliability. This document defines normalized behaviors that Summit should expose consistently across all v0 domains.

## Normalized error model

All non-2xx responses should be representable as a normalized error payload with stable fields and semantics:

- `error.code` (required): stable machine-readable classification that callers can branch on.
- `error.message` (required): concise human-readable message suitable for UI and support logs.
- `error.category` (required): top-level family, e.g. `validation`, `auth`, `permission`, `not_found`, `rate_limit`, `dependency`, `internal`.
- `error.retryable` (required): boolean guidance for automated callers.
- `error.details` (optional): structured field/path diagnostics and upstream metadata.
- `correlationId` (required): trace key for end-to-end investigation.

Semantics:

- `error.code` values are contract-stable within v0 once published.
- `error.message` may evolve for clarity but should keep intent and remediation direction.
- `error.details` should be additive and safe to ignore by clients.
- `correlationId` must be echoed in logs and returned to callers whenever available.

### Retryability guidance

Use `error.retryable` as the canonical signal and pair it with HTTP status and idempotency semantics:

- **safe to retry**
  - Transient dependency failures (typical `5xx` / timeout cases).
  - Temporary rate-limit responses when caller applies backoff.
- **do not retry**
  - Validation failures (`400`, `422`) until payload is corrected.
  - Authentication/authorization failures (`401`, `403`) until credentials/permissions change.
  - Not-found (`404`) unless eventual consistency is explicitly documented.

Caller guidance:

- Apply exponential backoff with jitter for retryable conditions.
- Only auto-retry non-mutating operations by default.
- For mutations, require idempotency keys or equivalent idempotency safeguards.

## Auth conventions

Summit uses bearer-token authorization for v0 endpoints and upstream Terrain calls.

- Required request header: `Authorization: Bearer <token>`
- Token source should be abstracted from endpoint shape and business logic.
- Auth failures should return normalized errors with `error.category: auth` and `error.retryable: false` unless an upstream transient issue is identified.

### token-provider abstraction

Integrations should depend on a token-provider abstraction, not direct runtime globals:

`TokenProvider`

- `getToken(): Promise<string | undefined> | string | undefined`
- `getMemberId?(): string | undefined`
- `getUnitId?(): string | undefined`

This allows internal Terrain-backed auth today and external provider substitution later without changing v0 request/response contracts.

## Observability conventions

Observability must support quick incident triage without exposing sensitive data.

### Correlation IDs

- Accept `X-Correlation-Id` from callers when supplied.
- Generate a correlation ID when absent.
- Return `correlationId` in normalized error payloads.
- Include the same ID in structured logs and downstream requests where possible.

### Structured logs

Emit structured logs for request start/finish/failure events with consistent fields:

- `timestamp`
- `level`
- `message`
- `correlationId`
- `operation`
- `domain`
- `http.method`
- `http.path`
- `http.status`
- `durationMs`
- `error.code` (when applicable)
- `error.retryable` (when applicable)

### Redaction and PII guidance

- Apply redaction to tokens, secrets, cookies, and authorization headers.
- Avoid logging full request/response bodies unless explicitly required for diagnostics.
- Treat names, emails, member identifiers, and free-text fields as potential PII.
- Prefer allow-listed logging fields over block-listing.
- Ensure support workflows can reference `correlationId` instead of raw personal payloads.
