# Stage 1 — Service extraction, page scaffold, naive table

**Goal:** a new route that loads real award data through a shared service and renders it in a
plain `v-data-table`. No interactivity, no filters, no export yet.

## 1a. Extract the storage-event logic

Today the entire load-and-save pipeline lives inside the React page's Vue shell
(`src/pages/PresentAwards/PresentAwards.ts`). The Vue page needs the same pipeline. Duplicating
~120 lines of GUID compression and event-payload construction into a second page would guarantee
the two drift — so extract it once and have **both** pages call it.

**New file: `src/pages/PresentAwards/services/awardStorageEvent.ts`**

Three exports, all lifted verbatim from `PresentAwards.ts` with no behaviour change:

```ts
export interface PresentedAwardsLoad {
  storeEvent: TerrainEvent | undefined;
  items: SummitAchievement[];
}

/** Lines 58-81 of PresentAwards.ts, unchanged: finds the year-2100 storage event, fetches all
 *  10 achievement types + members in parallel, keeps status === "awarded", builds the rows. */
export async function loadPresentedAwards(): Promise<PresentedAwardsLoad>;

/** Lines 102-170: group by member -> processGuidsAndDates -> schedule_items -> TerrrainPostEvent. */
export function buildStorageEventPayload(newItems: SummitAchievement[]): TerrrainPostEvent;

/** Lines 171-175, but AWAITED and returning the result (see note below). */
export async function savePresentedAwards(storeEvent: TerrainEvent | undefined, newItems: SummitAchievement[]): Promise<SaveEventResult>;
```

Two constants also move here so both pages agree on them:
`STORAGE_EVENT_TITLE = "Summit Award Storage - Please Ignore"` and
`STORAGE_EVENT_DATA_VERSION = "2"`.

**The one deliberate deviation:** `PresentAwards.ts:171-175` calls `updateEvent`/`createNewEvent`
*without awaiting* and discards the `SaveEventResult`, so a failed save is completely silent to
the user. `savePresentedAwards` awaits and returns the result. This is a prerequisite for Stage 2's
save feedback — there is no way to report success or failure from a promise nobody holds.

**Then rewrite `PresentAwards.ts` to call the new service.** `getAwardData()` becomes a thin
wrapper around `loadPresentedAwards()`; `handleUpdate()` calls `savePresentedAwards()` and, to
preserve today's exact behaviour, ignores the returned result (it just `void`s the promise as
before — the React page's UX is explicitly out of scope). Keep the commented-out local-state sync
block at lines 177-182 as-is; it is a note to the original author, not dead code to tidy.

> Risk note: this is the only part of the whole build that touches the working React page. It is a
> pure move — no logic edited, no order of operations changed. Verify by loading the React page in
> Edge and confirming rows still appear and a save still writes, **before** starting 1b.

## 1b. Page scaffold

Copy the structure of `src/pages/IStatements/` — it is the cleanest existing example.

**`src/pages/PresentAwardsVue/PresentAwardsVue.vue`** — shell rendered by *Terrain's* Vue, so it
must contain **no Vuetify tags**:

```html
<template>
  <div>
    <h2>Present Awards</h2>
    Awards your members have earned. "Awarded" means Terrain has recorded the achievement;
    "Presented" means it has physically been handed over at a meeting.<br />
    <div ref="vuetifyRoot"></div>
  </div>
</template>
<script lang="ts" src="./PresentAwardsVue.ts"></script>
<style scoped></style>
```

**`src/pages/PresentAwardsVue/PresentAwardsVue.ts`** — follow `IStatements.ts` exactly:

- `ContentInstance` structural interface (deliberately **not** `extends Vue`) listing the props
  the parent pushes onto the live instance: `items`, `loadState`, `isSaving`, `saveFeedback`.
- `mountContentComponent()` with the `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
  + `const ContentApp: any = Vue.extend(...)` workaround for **TS2589** ("type instantiation is
  excessively deep"). Do not try to type this properly; both existing pages hit the same wall.
- `new ContentApp({ vuetify: window.summitVuetify, propsData: { ... } })` then
  `$mount(this.$refs.vuetifyRoot as HTMLElement)`.
- `watch` on each data field → `renderContent()`, which pushes values onto `this.contentInstance`.
- **Mount before loading**, per the comment in `IStatements.ts:51-53` — `renderContent()` no-ops
  until the instance exists, so loading first leaves the page blank for the whole fetch.
- `beforeDestroy()` → `unmountContentComponent()`.
- Breadcrumbs in `mounted()`: `Summit → Tools → Present Awards (Vue)`, pointing at
  `/summit/tools/presentawards-vue`.

Hold `storeEvent` in this component's `data` (not the content instance) — it is save-pipeline
state, not render state, and the content component never needs to see it.

## 1c. Content root

**`components/PresentAwardsVueContent.vue`** — `<v-app>` wrapping a `.oas-vue-content` div that
**redeclares the same three custom properties** as `OasProgressionVueContent.vue`:

```css
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}
```

Per `DESIGN.md`, this duplication is deliberate and mandated — do **not** invent a
`--presentawards-*` scale. `IStatementsContent.vue` sets the same precedent.

Also copy the `.oas-vue-pill-btn.v-btn` block verbatim (it is duplicated in both existing content
SFCs — that is the established pattern, not an oversight to fix here).

Stage 1 content is just a header row placeholder (`.oas-progression-view-row` with a
`<v-spacer>`), a loading line, and the table.

## 1d. Naive table

**`components/PresentAwardsTableVue.vue` / `.ts`** — a bare `v-data-table` for now:

```ts
const HEADERS: DataTableHeader[] = [
  { text: "Name",      value: "member" },
  { text: "Type",      value: "type" },
  { text: "Award",     value: "achievementName" },
  { text: "Date",      value: "dateAwarded" },
  { text: "Presented", value: "presented" },
  { text: "Present",   value: "present", sortable: false },
];
```

Same `v-data-table` attributes as the OAS table: `dense`, `:items-per-page="25"`,
`:footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }"`, `class="oas-vue-data-table"`.

> **Date sorting is a known trap.** `SummitAchievement.dateAwarded` and `.presented` are
> `DD/MM/YYYY` **strings**, so `v-data-table`'s default sort orders them lexically — 01/12/2025
> sorts before 02/01/2024. The OAS table sidesteps this by keeping `stage` a number. Fix it here
> with a `sort` function on both date headers that parses via `moment(v, "DD/MM/YYYY")`, treating
> `"No"` and empty as the earliest value. Do this in Stage 1 while the table is simple.

## 1e. Register the page

Three edits, exactly as `.claude/I_Statement/PLAN_STAGE_2.md` lists them:

1. `src/pages/index.ts` — `export { default as PresentAwardsVue } from "./PresentAwardsVue/PresentAwardsVue.vue";`
2. `src/router/SummitRouter.ts` `initRoutes()` — `addRoute({ path: "/summit/tools/presentawards-vue", component: PresentAwardsVue })`, next to the existing `PresentAwards` route at line 66-69
3. `src/router/SummitRouter.ts` `initNavMenu()` — `{ title: "Present Awards (Vue)", to: "/summit/tools/presentawards-vue", items: [], locked: false, roles: [true, false] }` in the **Tools** group, directly after the existing Present Awards entry (line 192-198)

No `manifest.json` change (no new assets). No `package.json` change (`sideEffects` already lists
`"*.vue"` — the fix that stopped scoped styles being tree-shaken away project-wide).

## Verification

- Standing baseline (see `PLAN.md`).
- React page at `/summit/tools/PresentAwards` still loads rows and still saves — this proves 1a
  was a clean extraction.
- New page at `/summit/tools/presentawards-vue` appears in the Tools nav, loads, and shows the
  same row count as the React page.
- Sort each column; confirm both date columns sort chronologically, not lexically.
