# Phase 5 Complete: Vue Ecosystem Decision Gate

Phase 5 captured an explicit decision on the Vue security track based on the current baseline after Phases 1–4.

## Validation baseline used for decision

- `npm run lint`: PASS
- `npm test`: PASS (21/21 suites, 58/58 tests)
- `npm run build-prod`: PASS
- `npm audit --audit-level=moderate`: FAIL (6 vulnerabilities: 2 low, 4 moderate)

Residual findings are concentrated in the Vue 2 dependency chain:

- `vue` (2.x) advisory exposure
- `vue-template-compiler` advisory exposure
- `@vue/component-compiler-utils` transitive `postcss` advisory via `vue-loader` 15.x

## Chosen option

**Migration path** (Vue 3-compatible stack) is selected as the target path.

## Go / No-Go decision

- **GO**: Start the Vue migration workstream.
- **NO-GO**: Do not accept indefinite containment as a long-term endpoint.

## Rationale (security baseline grounded)

- The non-Vue major upgrade tracks are already completed and baseline checks are stable.
- Remaining moderate vulnerabilities require breaking upgrades that are not resolvable within the Vue 2 stack without force-major changes.
- A migration plan removes recurring residual-risk acceptance and provides a durable security posture.

## Owner and milestone timeline

- **Owner:** Summit maintainer (Ben Woodcock)

Milestones:

1. **2026-04-30** — Migration scope and dependency map finalized (Vue, loader/compiler, router/store compatibility).
2. **2026-05-14** — Feature-freeze window begins and dedicated migration branch opened.
3. **2026-06-04** — Vue 3 migration implementation PR opened with parity checklist.
4. **2026-06-11** — Post-migration validation + audit rerun, with residual vulnerabilities reviewed for closeout.

## Temporary mitigation window (while migration starts)

Containment is accepted only as a short bridge until migration work is active:

- **Window:** 2026-04-23 to 2026-05-14 (max 3 weeks)
- **Mitigations during window:**
  - No new runtime features that expand template/input surface area.
  - Keep strict review on Vue/template-related changes.
  - Re-run full validation protocol on each PR touching build/runtime dependencies.

After 2026-05-14, continued containment without an active migration PR is out of policy for this plan.
