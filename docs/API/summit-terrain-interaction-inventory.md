# Summit Terrain Interaction Inventory

Canonical Phase 1 inventory of runtime Terrain interactions used by Summit.

## Bootstrap and injection

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/summitloader.js` | Browser extension content script load | `chrome.runtime.getURL("scripts/summit.js")` (extension runtime URL) | None | None | Injected script URL | Appends `<script>` to DOM head/document root and bootstraps Summit bundle into Terrain page context. |
| `src/index.ts` | jQuery DOM-ready callback (`$(function () { ... })`) | Terrain app runtime (`window.$nuxt`) | Uses existing logged-in Terrain Nuxt runtime/session | Terrain store/router/component globals from page context | Registered Vuex `Summit` module and initialized routes/menu hooks | Mutates Terrain runtime (`window.$nuxt.$store.registerModule`, `dispatch("Summit/initialize")`, router finalization, `window.Vue`, `window.$`). |

## Auth source

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/helpers/TerrainState.ts` | Any Summit service/helper call requesting auth/profile info | Terrain Nuxt store (`window.$nuxt.$store.state`) | Must already be authenticated in Terrain | None (reads in-memory state) | `auth.idToken`, member IDs, unit ID, active profile | Centralizes auth and identity sourcing for downstream service requests. |

## Service calls

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/services/getCurrentProfile.ts` | Profile refresh paths | `https://members.terrain.scouts.com.au/profiles` | Requires `Authorization: TerrainState.getToken()` | None | `TerrainProfile[] \| undefined` | Returns profiles for in-app state decisions; logs and returns `undefined` on failure. |
| `src/services/fetchUnitMembers.ts` | Calendar/editor data loading | `https://members.terrain.scouts.com.au/units/{unitId}/members` | Requires token | `unitId` from `TerrainState.getUnitID()` | `TerrainUnitMember[]` | Populates attendee/organiser selection data. |
| `src/services/fetchUnitMembersMetrics.ts` | Metrics report flows | `https://metrics.terrain.scouts.com.au/units/{unitId}/members?limit=999` | Sends token (no pre-token guard in code) | `unitId` | `TerrainUnitMemberMetric[] \| undefined` | Enables metrics-driven report views; logs and returns `undefined` on failure. |
| `src/services/fetchUnitAchievements.ts` | Summit module achievements refresh | `https://achievements.terrain.scouts.com.au/units/{unitId}/achievements` | Requires token | `unitId` | `TerrainAchievements[]` (`results`) | Updates achievements cache in store. |
| `src/services/fetchUnitAchievementsFilterd.ts` | Filtered achievements queries | `https://achievements.terrain.scouts.com.au/units/{unitId}/achievements?{filterString}` | Requires token | `unitId`, query string | `TerrainAchievements[]` (`results`) | Supports filtered award calculations; logs and returns `[]` on failure. |
| `src/services/fetchAchievements.ts` | Route-specific award checks (`SummitRouter.pageChecks`) | `https://achievements.terrain.scouts.com.au/members/{profileMemberId}/achievements?type={type}` | Requires token | Achievement type + active profile member ID | `TerrainAchievements[] \| undefined` (`results`) | Drives awarded chip/list decorations; logs and returns `undefined` on failure. |
| `src/services/getLogbookData.ts` | Logbook read integration | `https://achievements.terrain.scouts.com.au/members/{profileMemberId}/logbook/{logbookId}` | Requires token | `logbookId` | `TerrainLogbook \| undefined` | Retrieves source logbook content; logs and returns `undefined` on failure. |
| `src/services/saveLogbookData.ts` | Logbook write integration | `https://achievements.terrain.scouts.com.au/members/{memberId}/logbook` with referrer `https://terrain.scouts.com.au/` | Requires token | Serialized logbook text payload | `void` | Persists logbook content; logs and returns `undefined` on caught failures. |
| `src/services/fetchMemberEvents.ts` | Calendar load + presented awards scan | `https://events.terrain.scouts.com.au/members/{memberId}/events?start_datetime={from}&end_datetime={to}` | Requires token | Date window + member ID | `TerrainEventSummary[]` (`results`) | Feeds calendar rendering and award storage-event lookup. |
| `src/services/fetchActivity.ts` | Event detail open/edit + iframe open flow | `https://events.terrain.scouts.com.au/events/{activityId}` | Requires token and non-empty `activityId` | `activityId` | `TerrainEvent \| undefined` | Hydrates editor and Terrain programming accessor payload; logs and returns `undefined` on failure. |
| `src/services/createNewEvent.ts` | Summit calendar save for new event | `https://events.terrain.scouts.com.au/units/{unitId}/events` | Requires token | Serialized event JSON body | `void \| parsed non-OK response payload` (result of `JSON.parse(await response.text())`, so JSON object/array/string/number/boolean/null) | Creates Terrain event and triggers calendar reload path in caller; non-OK parse can throw and propagates via catch/rethrow. |
| `src/services/updateEvent.ts` | Summit calendar save for existing event | `https://events.terrain.scouts.com.au/events/{eventId}` | Requires token | `eventId`, serialized event JSON body | `void` | Updates Terrain event and triggers calendar reload path in caller; throws on non-OK. |
| `src/services/deleteEvent.ts` | Summit calendar delete confirmation action | `https://events.terrain.scouts.com.au/events/{eventId}` | Requires token | `eventId` | `void` | Deletes event and triggers calendar refresh in caller; throws on non-OK. |
| `src/services/fetchMemberCalendars.ts` | Calendar selector initialization | `https://events.terrain.scouts.com.au/members/{memberId}/calendars` | Requires token | `memberId` | `TerrrainCalendarResult` (or `{}`) | Loads own/other calendar visibility selections for selector UI. |
| `src/services/updateMemberCalendars.ts` | Calendar selector change | `https://events.terrain.scouts.com.au/members/{memberId}/calendars` | Requires token | Serialized calendar selection payload | `void` | Persists selected calendars and triggers follow-up calendar fetch in caller. |
| `src/services/fetchSIATemplate.ts` | SIA template retrieval paths | `https://templates.terrain.scouts.com.au/sia/{templateId}.json` | Requires token | `templateId` | `unknown \| undefined` | Provides template payload for SIA-related operations; returns `undefined` when unavailable/failing. |

## Iframe integration

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`openTerrainDialog`) | User clicks **Open in Terrain** in calendar editor | `https://terrain.scouts.com.au/programming/view-activity` (loaded into `#eventFrame`) | Reuses existing Terrain app session/cookies in same browser context | Event ID (resolved via `fetchActivity` then written to `window.$nuxt.$accessor.programming`) | Embedded Terrain activity view in modal iframe | Sets iframe `src`, injects CSS on iframe load to hide Terrain chrome (`header/nav/footer/freshworks`), and restores `about:blank` on modal close. |

## Event and listener integration

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/router/SummitRouter.ts` (`beforeEach`, `afterEach`) | Terrain route navigation changes | Terrain route context (no direct network endpoint) | Uses current Terrain runtime session state | `to/from` route metadata | Menu switch + deferred page checks | Dynamically swaps Summit/Terrain nav menu and schedules DOM-dependent checks. |
| `src/router/SummitRouter.ts` (`pageChecks`) | Post-route DOM readiness polling | Indirectly triggers service hosts above, depending on route | Route-specific checks call token-protected services | Current route + DOM/query state | Conditional award/logbook/export integrations | Uses repeated deferred checks to wait for Terrain-rendered elements before augmenting UI. |
| `src/modules/summitModule.ts` (`initialize`) | Summit module initialization and Terrain profile changes (`this.watch`) | Indirectly triggers service hosts above | Uses Terrain auth via `TerrainState` in called services | Profile index changes, initial app load | Re-fetch achievements and presented awards state | Keeps Summit data synchronized with Terrain profile context. |
| `src/pages/SummitCalendar/components/SummitCalendar.tsx` (`#eventFrame` load handler) | Iframe emits `load` event | `terrain.scouts.com.au` iframe document | Inherited Terrain session | iframe document head | CSS override injection | Adds style rules into iframe document to present embedded-only event view. |

## Error and timeout behavior

| Source location | Trigger | Endpoint / host | Auth requirement | Input | Output | Side effects |
| --- | --- | --- | --- | --- | --- | --- |
| `src/services/*` (all service modules listed above) | Any network call failure/non-OK response | `events.terrain.scouts.com.au`, `achievements.terrain.scouts.com.au`, `members.terrain.scouts.com.au`, `metrics.terrain.scouts.com.au`, `templates.terrain.scouts.com.au` | Token required for most calls (see per-row notes) | Request-specific payload/query/path params | Mix of `undefined`, empty collections, or thrown errors depending on service | Error handling is intentionally mixed: some services swallow/log and return fallback values, while mutation-focused calls (`updateEvent`, `deleteEvent`, `updateMemberCalendars`) throw to caller. |
| `src/router/SummitRouter.ts` (`finaliseSetup`, `pageChecks`) | Terrain UI not ready yet after navigation/startup | Terrain runtime/UI (non-network) | Existing Terrain session | Route + DOM readiness | Retry after delay | Uses repeated `setTimeout(..., 100)` (and one `1000`) as polling/backoff for DOM/menu readiness; no explicit max retry or cancellation. |
| `src/components/DialogComponent.tsx` and `src/pages/SummitCalendar/components/SummitCalendar.tsx` | Keyboard/close UX timing | Browser event loop/UI (non-network) | None beyond loaded app context | User key presses/dialog state | Deferred close/focus flows | Uses event listeners and `setTimeout` to sequence UI transitions and avoid immediate focus/teardown conflicts. |
