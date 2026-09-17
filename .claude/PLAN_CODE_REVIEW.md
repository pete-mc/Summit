<!-- @format -->

# Code Review — Security, Robustness, Modularity, Standards

## Context

Separate from the OAS Progression feature work tracked in [PLAN.md](PLAN.md)
and its stages, the user asked for a general-purpose code review of the whole
codebase covering security, robustness, modularity (including reuse of
standard libraries/GUI components), coding standards, comments, visual layout
consistency, and naming. This file records that review's findings and the
fixes applied as a direct follow-up, kept separate from the OAS Progression
plan since it's a codebase-wide quality pass, not a feature stage.

## Review scope and method

Read the codebase directly rather than relying solely on the `/code-review`
skill's diff-based tooling (that skill was also run first, on the current
diff only, and reported no issues — expected, since the diff at that point
was small; the manual pass below covers the whole tree). Areas read in depth:
`manifest.json`, `src/helpers/TerrainState.ts` (auth/token handling),
`SECURITY.md`, all 19 files in `src/services/` (every Terrain API call),
`src/summitloader.js`/`src/index.ts` (the extension's injection boundary),
the Vue→React bridge pattern across every page in `src/pages/`, the largest
component (`SummitCalendar.tsx`, 1200+ lines), shared components
(`DialogComponent.tsx`, `SimpleDropdown.tsx`), and `src/types/terrainState.d.ts`.

## What's solid (no action needed)

- No `dangerouslySetInnerHTML`, `eval`, or raw `innerHTML` anywhere — no
  obvious XSS injection vector in the React layer.
- No hardcoded secrets; the auth token is read live from the host page's own
  Nuxt/Vuex store (`window.$nuxt.$store.state.auth.idToken` via
  `TerrainState.getToken()`), never stored by the extension itself.
- `manifest.json` permissions are minimal (`activeTab`, `scripting` only, no
  broad host permissions) and CSP is `default-src 'self'`.
- The Vue-mounts-React bridge pattern (`data()` / `mounted()` /
  `renderReactComponent()` / `beforeDestroy()` → `unmountReactComponent()`)
  is consistent across every page in `src/pages/`.
- `DialogComponent`/`DropDownListComponent` (`src/components/`) are
  legitimate lightweight in-house replacements for a removed Syncfusion
  dependency, backed by tests (`tests/unit/smoke/`) that guard against
  Syncfusion regressions — not vestigial cruft, a deliberate OSS-only design.

## Findings and fixes

### 1. PII logged to the browser console (fixed)

`PeakAward.ts`, `PresentAwards.ts`, and `SummitCalendar.tsx` all had leftover
debug `console.log`/`console.timeStamp` calls dumping full member names,
member IDs, and award/activity data on normal user actions (page load, save)
— real children's data (this is a Scouts app) landing in devtools on every
use, in tension with `SECURITY.md`'s "No Data Collection" stance even though
the extension itself never transmits the data anywhere.

**Fix**: removed the debug dumps directly in these three files as a first
pass. Superseded/generalized by finding 6 below (shared logger), which
routes the same class of data-dump calls in two more files
(`MilestoneReport.ts`, `UnitSummary.ts`, missed in the first pass) through a
`logger.debug(...)` call that's silent by default.

### 2. Stray committed test-output artifact (fixed)

`.jest-components-results.json` (47KB, absolute paths from a different
machine — `C:\git\Personal\Summit\...`) was tracked in git and not covered
by `.gitignore`, accidentally committed alongside real code changes in
commit `bacd52a` ("Fix date time pickers #157").

**Fix**: `git rm --cached` to untrack it, deleted the stale local copy, and
added `.jest-components-results.json` to `.gitignore` so it can't be
re-committed.

### 3. Inconsistent service error handling (fixed)

`deleteEvent.ts` and `updateMemberCalendars.ts` re-threw caught fetch errors
after logging them, while every other file in `src/services/` swallows the
error and returns a fallback value. `deleteEvent`'s only caller (an inline
handler in `SummitCalendar.tsx`) had no `.catch`, so a network failure during
delete became an unhandled promise rejection instead of a UI-visible error
like every other save/update flow.

**Fix**: both services now return `Promise<boolean>` (success/failure)
instead of throwing, matching the majority swallow-and-report pattern. Their
call sites in `SummitCalendar.tsx` were updated to check the result: a
failed delete now sets `editorSaveErrors` (the same state field the editor
already uses to surface save failures) instead of silently closing the
dialog; a failed calendar-selection update now logs clearly via
`logger.error` instead of proceeding as if it had succeeded.

### 4. Spoofed/stale browser fingerprint header (not fixed — flagged only)

`saveLogbookData.ts` hardcodes a `sec-ch-ua` client-hints header claiming
`'Microsoft Edge';v='94'`, unlike every sibling service which sends only
`Content-Type`/`Authorization` and lets the browser set its own client
hints. The hardcoded version is stale (current Edge is well past 94). Left
as-is — flagged in the original review as a real inconsistency, but not
addressed in this pass; a candidate for a future small cleanup.

### 5. `SummitCalendar.tsx` size and a dead-code branch (not fixed — flagged only)

`SummitCalendarComponent` is a single 1200+ line React class combining
calendar rendering, event CRUD, editor form state/validation, draft
persistence, keyboard shortcuts, and a legacy jQuery iframe-styling hack —
by far the largest, most multi-responsibility file in the codebase.
`saveActivity` also has two branches (`if (eventToSave.id)` /
`if (!eventToSave.id)`) that both execute the identical three statements —
harmless today but a trap for a future edit that changes one branch without
realizing the other needs the same change. Neither addressed in this pass;
flagged as a larger refactor for a dedicated round, not a quick fix.

### 6. No shared logger — inconsistent console usage across the codebase (fixed)

30 `console.log`/`console.error`/`console.debug` call sites across 27 files
used three different conventions with no way to level-gate or globally
silence them: most `src/services/*.ts` catch blocks used
`console.log("Error x: " + e)` (string concatenation, always "log" level
even for genuine errors); newer files used a manual `console.error("[Component] ...", ...)`
bracket-prefix convention; a few one-off `console.log`/`console.debug` calls
had no prefix at all. Confirmed via `webpack.config.js` that no build-time
console stripping happens in either dev or prod bundles (a custom
`optimization.minimizer` array containing only `CssMinimizerPlugin` disables
Webpack 5's default Terser minifier entirely), and confirmed via
`eslint.config.js` that no `no-console` rule exists — so nothing else would
catch or gate this.

**No standard library or spec applies here.** There's no W3C/ECMA standard
for structured app-level logging — the Console API (`console.log/warn/error/debug`)
*is* the web standard; everything above it is app convention. Pulling in a
package like `loglevel` or `debug` would be the wrong trade for this
codebase's size and its zero-unnecessary-dependency ethos (10 runtime
dependencies total, all feature libraries, no existing logging package) —
none of those libraries add anything meaningful here (no transports, no
remote log shipping, no structured/JSON logging need; this is a client-only
extension with nowhere to ship logs but the browser console anyway).

**Fix**: added `src/helpers/Logger.ts` — a small, dependency-free,
scoped-logger factory following the exact house style already used by
`src/helpers/OASTemplateCache.ts` (plain exported functions, no class,
minimal comments, co-located Jest spec):

```typescript
export function createLogger(scope: string): {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
export function setLogLevel(level: "debug" | "info" | "warn" | "error"): void;
```

Default level is `warn` — this silences the routine
`console.log("Error fetching X: " + e)` catch-all noise (nearly always
non-actionable network/auth churn) and the informational/data-dump debug
calls, while still surfacing real errors and anything explicitly warned.
`setLogLevel` is module-level, in-memory state (not persisted to
`localStorage`/exposed on `window`) — a per-session dev toggle, kept
internal-only for this pass per the user's explicit choice; a devtools
escape hatch (`window.summit.setLogLevel(...)`) was considered and
deliberately deferred as a separate future follow-up if live-debugging on
`terrain.scouts.com.au` ever needs it.

Exported from the `src/helpers` barrel (`export { createLogger, setLogLevel } from "./Logger"`)
alongside the existing named exports.

**Migration** — every one of the 30 original call sites, plus one more
(`DisplayOptions.ts`) found during migration that the initial grep missed,
now goes through a module-level `const logger = createLogger("<scope>")`:

- 20 error-path `catch` blocks across `src/services/*.ts` → `logger.error(e)`
  (previously inconsistently `console.log`, now correctly `error`-level).
- 6 existing `[Component]`-prefixed `console.error` calls
  (`fetchOASTree.ts` ×2, `fetchOASTemplate.ts` ×2, `OasProgression.ts` ×2,
  `SummitCalendar.tsx` ×1) → `logger.error(...)`, manual bracket tags
  dropped since the logger adds the scope automatically.
- Informational/trace noise (`SummitRouter.ts` ×2, `summitModule.ts` ×2,
  `copyLogbook.ts`, `DisplayOptions.ts`) → `logger.debug(...)`, silent by
  default.
- The two remaining bare data-dump calls (`MilestoneReport.ts`,
  `UnitSummary.ts`, `console.log(this.items)`) — the same PII-exposure class
  as finding 1, in two files that first pass didn't touch → `logger.debug(...)`,
  also silent by default now.
- `exportiCal.ts`'s `console.error("Activity ID element not found.")` (a
  genuine user-facing precondition failure) → `logger.error(...)`.
- Fixed a pre-existing typo while touching the adjacent line in
  `copyLogbook.ts`: "Recieved" → "Received".

No `.catch`/`throw` control flow, return values, or business logic were
touched — this was a mechanical swap of the logging call only, everywhere.

New test file `tests/unit/helpers/Logger.spec.ts` (4 tests), matching
`OASTemplateCache.spec.ts`'s conventions: direct import via
`@/helpers/Logger`, `describe`/`it`, `jest.spyOn(console, ...)` +
`afterEach` cleanup, no mocking libraries beyond `jest.fn()`. Covers scope
prefixing, default-level suppression of debug/info, default-level pass-through
of warn/error, and `setLogLevel("debug")` unlocking every level.

### 7. Two lower-confidence notes from the original review

#### 7a. `fetchOASTemplate.ts` had no input validation on its request URL (fixed)

`fetchOASTemplate` built its fetch URL as
`"https://templates.terrain.scouts.com.au/" + templateLink` with no shape
check and no `encodeURIComponent`. Not exploitable at the time — the only
caller (`buildOASProgressionRows.ts`'s `getCachedOASTemplate`) sources
`templateLink` from `OASTreeNode.template_link` in Terrain's own
tree-endpoint response, never user input — but the function itself had no
defensive posture: nothing would stop it from fetching an absolute URL, a
path-traversal (`..`) segment, or an empty string if a future caller (a
search box, a debug "load template" tool) ever passed through something
less trusted, and the user's real bearer token would go along for the ride.

**Fix**: added a private `isValidTemplateLink()` guard in
`fetchOASTemplate.ts` that rejects (returns `undefined`, logs via
`logger.error`, never calls `fetch`) any `templateLink` that's empty,
contains `://` (an absolute URL), starts with `/` (an absolute path), or
has a `..` path segment (traversal). Real values
(`"oas/bushcraft/pioneering/4/latest.json"`-shaped, confirmed against
Terrain's live API in [PLAN.md](PLAN.md)) all pass through unaffected — the
guard only narrows what's accepted, it doesn't change behavior for any
existing legitimate caller. Scoped to this file only:
`fetchSIATemplate.ts` has a similar string-concatenation shape but takes a
bare `templateId` (no slashes expected at all), a narrower and already
lower-risk case, so it was left alone rather than folding in unrelated
work.

4 new tests added to `tests/unit/services/fetchOASTemplate.spec.ts`
(absolute URL, leading slash, `..` traversal, empty string — each asserting
`fetch` is never called and the result is `undefined`); all 5 existing
tests in that file continue to pass unchanged. Full suite: 319/320 passing
(up from 315/316; the 1 failure is the same pre-existing, unrelated
UNC-path smoke test). `tsc --noEmit`, lint, and build all clean.

#### 7b. Services barrel possibly out of sync with actual imports (not an issue — retracted)

Flagged in the original pass before every call site had been traced.
**Re-checked while writing this file up and it does not hold**:
`src/services/index.ts` exports all 19 services, and grepping every
`from "@/services"` import in the codebase confirms every consumer —
including `fetchOASTemplate`, `fetchOASTree`, `getLogbookData`, and
`saveLogbookData`, the ones originally suspected of being imported around
the barrel — actually goes through it correctly. This was a `PLAUSIBLE`-
confidence finding (not `CONFIRMED`) precisely because the full trace
hadn't been done yet; the trace now shows there's no mismatch to fix. No
action taken.

## Verification

- `npx tsc --noEmit -p tsconfig.json` — no new type errors; same 3
  pre-existing, unrelated errors remain in `DataGrid.tsx`/`PresentAwards.tsx`
  (predate this review, not touched by it).
- `npx eslint src/` — no new lint errors; same 2 pre-existing errors remain
  (a CRLF/Prettier line-ending mismatch and an `any` cast in
  `SummitCalendar.tsx`, both on lines untouched by this review).
- `npx jest` — 319/320 passing (up from the pre-review baseline of
  311/312 — 4 new tests from `Logger.spec.ts` plus 4 new tests from
  `fetchOASTemplate.spec.ts`'s validation cases). The 1 failure is the
  pre-existing, documented UNC-path smoke test issue
  (`tests/unit/smoke/lint_stack_loads.spec.ts`, caused by this checkout
  living on a `\\sun\...` network share — see `.claude/DEVENV.local.md`),
  unrelated to this review.
- `npm run build` — succeeds; `src/helpers/*.ts` bundles 9 modules
  (confirms `Logger.ts` is wired correctly through the barrel export); one
  pre-existing, unrelated `react-datepicker` dynamic-require warning.

## Not done in this pass (flagged for a future round)

- Finding 4: stale spoofed `sec-ch-ua` header in `saveLogbookData.ts`.
- Finding 5: `SummitCalendar.tsx`'s size/multi-responsibility and its
  `saveActivity` dead-branch duplication.
