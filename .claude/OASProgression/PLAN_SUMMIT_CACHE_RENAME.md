# Generalise the OAS localStorage cache into a shared Summit cache

## Why

`src/helpers/OASTemplateCache.ts` held the 24-hour localStorage cache for OAS tree/template/
achievements data. The implementation was already generic (`saveCached<T>`/`loadCached<T>`
take an arbitrary string key), but the filename, the `summit.oas.cache.` storage prefix, and
`clearCache`'s internal key-segment parsing all assumed OAS's specific key shapes. Any future
page (e.g. Milestones) wanting the same "cache for a day, manual refresh button clears it"
behaviour would have had to either misuse an "OAS" module or duplicate it.

## What changed

- Renamed `src/helpers/OASTemplateCache.ts` -> `src/helpers/SummitCache.ts`.
- Storage key prefix: `summit.oas.cache.` -> `summit.cache.`. Old cached entries under the
  previous prefix are simply orphaned (never read again) — not migrated, since they're disposable
  within 24h anyway.
- `clearCache(streamFilter?: string)` -> `clearCache(filter?: (key: string) => boolean)`. The
  cache module no longer parses any feature's key format. Each caller supplies a predicate
  that tests its own un-prefixed key.
- Added `isOASCacheKeyForStream(stream)` in `buildOASProgressionRows.ts` — the OAS-specific
  predicate factory (matches `tree.{stream}`, `template.{stream}`,
  `achievements.{unitId}.{stream}.{branch}.{stage}`), used by both `OasProgression.ts` (React)
  and `OasProgressionVue.ts` (Vue) for their per-stream "reload" buttons.
- `clearCache()` with no argument is unchanged — still clears every Summit cache entry,
  regardless of which feature wrote it.

## Who else can use it now

Any page can `import { loadCached, saveCached, clearCache } from "@/helpers"` and pick its own
key namespace (e.g. `"milestones.template." + id`) with zero changes to `SummitCache.ts`. If a
page needs to selectively clear only its own entries, it writes its own predicate the way OAS
does with `isOASCacheKeyForStream` — the shared module stays feature-agnostic.

## Not done (deliberately out of scope)

- No TTL configurability beyond the existing `maxAgeMs` parameter per call.
- No quota/eviction handling — still raw `localStorage`, best-effort, silently drops on
  `QuotaExceededError` (unchanged from before).
- No migration of old `summit.oas.cache.*` entries — they age out naturally.
