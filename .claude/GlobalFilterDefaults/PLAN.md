# Global Filter Defaults — Plan

Decisions come from [FILTER_TABLE.md](FILTER_TABLE.md) (resolved 2026-11-25). This plan builds them.

## Goal

A leader sets their preferred filter defaults once, on **Tools > Display Options**:

- Every tab that uses a common default starts from it: on first visit, and whenever the leader clicks that tab's **Reset filters**.
- **Reset to system defaults** on Display Options puts the defaults back to Summit's built-in values.
- **Apply defaults to all pages** on Display Options overwrites every tab's current filters with the defaults. It asks for confirmation first.
- Tab-specific filters keep their hard-coded default on the tab. Display Options never lists them.

## Common defaults

| Setting (Display Options label) | System default | Options | Used on (OAS Progress tabs) |
|---|---|---|---|
| Name format | Full Name | `NAME_FORMAT_OPTIONS` (Full Name, First Name, FirstName.L, F.LastName, Codename) | Summary, Peak Award, Heat Map, Stage Grid, Next Steps (new filter) |
| Sort by | First Name | First Name, Last Name | Summary, Peak Award, Heat Map, Stage Grid |
| Break by patrol | Off | on/off | Summary, Peak Award, Heat Map, Stage Grid |
| Show approved | On | on/off | Heat Map, Stage Grid |
| Show skills not started | On | on/off | Summary, Heat Map |
| Show stages not started | On | on/off | Heat Map |
| Patrol | All Patrols | locked, not a setting yet | Summary, Peak Award, Heat Map, Stage Grid |

Not included:
- **Present Awards "Presented":** a different question from "Approved". It stays on its own tab (#5, agreed 2026-11-25).
- **Member search:** left out.
- **I Statements:** ignored.

## How it fits together

```
Display Options page ──writes──▶ summit.filterDefaults (localStorage)
                                   { defaults: {...}, appliedAt: <ms> | null }
                                             │ reads
                                             ▼
src/shared/filterDefaults.ts  (page-agnostic: type, system values, load/save/reset/apply-stamp)
                                             │ used by
                                             ▼
src/pages/OasProgressVue/services/oasFilterDefaults.ts  (maps common defaults onto OAS keys, per tab)
                                             │ used by
                                             ▼
OasProgressVueContent.ts  (first load, Reset filters, catch-up after Apply)
```

**Decision D (future pages).** Each page owns a small mapping file, like `oasFilterDefaults.ts`, that says which of its keys take which common default. The shared service knows nothing about pages, so:
- shared code never imports a page folder;
- a stripped page (Present Awards, I Statements) takes its mapping with it;
- a new page only needs its own mapping file.

This matches what you specified in A: tab-specific defaults stay hard-coded on the tab, and only the common ones live on Display Options.

**How "Apply defaults to all pages" reaches pages that aren't open.** The button doesn't edit each page's saved state. It saves `appliedAt = Date.now()` next to the defaults. Each page remembers when it last caught up, in a `filterDefaultsAppliedAt` key in its own saved state. On load, if the stamp is newer, the page overwrites its common keys on every tab from the defaults, then saves. A page that isn't open picks the change up next time it opens. Display Options never has to know which pages exist.

## Stage 1 — Shared service and OAS Progress wiring

### 1a. `src/shared/filterDefaults.ts` (new; export from `src/shared/index.ts`)

- `CommonFilterDefaults` type: `nameFormat`, `sortBy: "firstName" | "lastName"`, `breakByPatrol`, `showApproved`, `showSkillsNotStarted`, `showStagesNotStarted`.
- `SYSTEM_FILTER_DEFAULTS` holds the system values from the table above.
- `loadFilterDefaults()` merges the stored values over the system ones and cleans each field: an unknown name format or sort value falls back to the system value, and a non-boolean switch does too. Wrap the read in try/catch, like `printSettings.ts`. **Gotcha:** use localStorage, not chrome.storage, which doesn't exist in Terrain's MAIN world.
- `saveFilterDefaults(defaults)`, `resetFilterDefaults()` (stores the system values), `markFilterDefaultsApplied()` (sets `appliedAt`), `loadFilterDefaultsAppliedAt()`.
- `NameFormat` / `NAME_FORMAT_OPTIONS` currently live in `src/pages/OasProgress/services/getMemberDisplayName.ts`. Move the type and options into `src/shared/`, and re-export them from the old file so existing imports keep working.

### 1b. `src/pages/OasProgressVue/services/oasFilterDefaults.ts` (new)

- `commonDefaultsForTab(viewMode, defaults): Partial<OASProgressVueFilterState>`, covering:
  - **Summary:** `summaryNameFormat`, `summarySortBy`, `summaryBreakByPatrol`, `summaryShowNotStartedSkills`, plus `summaryColumnSort: null`.
  - **Peak Award:** `peakAwardNameFormat`, `peakAwardSortBy`, `peakAwardBreakByPatrol`.
  - **Heat Map:** `nameFormat`, `sortBy`, `breakByPatrol`, `showApproved`, `showEmptySkillRows` (from "skills not started") and `showNotStarted` (from "stages not started").
  - **Stage Grid:** `stageGridNameFormat`, `stageGridSortBy`, `stageGridBreakByPatrol`, `stageGridShowApproved`.
  - **Next Steps:** `nextStepsNameFormat`.
  - **About:** nothing.
- Patrols: each tab's `*SelectedPatrols` resets to `null`. The existing resolver then turns that into All Patrols.
- `commonDefaultsForAllTabs(defaults)` merges every tab's values. First load and Apply use it.

### 1c. `OasProgressVueContent.ts`

- `DEFAULT_FILTERS` stays the hard-coded base, which covers the tab-specific values.
- **First load (decision B):** `{ ...DEFAULT_FILTERS, ...commonDefaultsForAllTabs(userDefaults), ...stored }`. Saved filters win, so a tab you've already set up isn't changed.
- **Catch-up after Apply:** if `loadFilterDefaultsAppliedAt()` is newer than `stored.filterDefaultsAppliedAt`, lay `commonDefaultsForAllTabs` over the stored values, record the new stamp, and save.
- **Reset filters:** the tab's keys come from `DEFAULT_FILTERS`, with `commonDefaultsForTab(...)` laid over them. The existing patrol fix-up stays as it is.
- Add `filterDefaultsAppliedAt: number | null` to `OASProgressVueFilterState`. It is never part of a tab's reset keys.

### 1d. Next Steps gets a Name format filter

- Add `nextStepsNameFormat` to the filter state, `DEFAULT_FILTERS` (`"full"`) and `NEXT_STEPS_FILTER_KEYS`.
- Add a Name format select to `OASNextStepsFiltersVue`, the same control the other tabs use.
- `nextStepsMemberOptions` labels members with `getMemberDisplayName(m, nextStepsNameFormat)` rather than `m.memberName`. Members stay sorted by first name, and the print header uses the same formatted name. Check [NAME_RESOLUTION.md](../NAME_RESOLUTION.md) before touching this.

### 1e. Remove "Empty top stages"

- Delete `showEmptyTopStages` from the state type, `DEFAULT_FILTERS`, `HEATMAP_FILTER_KEYS`, `SHOW_OPTIONS`, `oasPrintMeta.ts`, `tabJumps.ts`, the Heat Map prop and `OasProgressVueContent.vue`.
- In `OASHeatMapVue.ts`, `allStagesTrimmed` and `allStages` switch to `showNotStarted`. When it's off, unstarted stage bars are hidden and stage columns above the highest started stage are trimmed. When it's on, both show.
- Saved state: `migrateRenamedFilters` drops the old `showEmptyTopStages` key (a `DROPPED_KEYS` list). Anyone who had only "Empty top stages" turned off gets all stages back until they turn off "Stages not started".

### 1f. Label tidy-up

- **Heat Map Show menu:** "Not Started" becomes **Skills not started** and "Not started" becomes **Stages not started**. Delete the "Label only" comment once the label matches the meaning.
- **Summary Show menu:** the not-started-skills option becomes **Skills not started**.
- **Print meta:** "Not started I-Statements" becomes **Stages not started**.
- **Stage Grid sort:** "First name" / "Last name" become **First Name** / **Last Name**.
- **Sort order:** check every Sort by dropdown lists First Name, Last Name, Progress, Stage, skipping options the tab doesn't have. This already holds; a test will lock it in.
- **About tab:** update any wording that mentions "Empty top stages".

### Stage 1 tests

- `tests/unit/shared/filterDefaults.spec.ts`: load with nothing stored returns system defaults; bad stored values fall back field by field; save, load and reset round-trip; throwing localStorage is harmless; the apply stamp is stored.
- `tests/unit/pages/OasProgressVue/services/oasFilterDefaults.spec.ts`: each tab maps exactly its own keys; About maps none; patrols map to `null`.
- `OasProgressVueContent.spec.ts`:
  - first load uses user defaults;
  - a saved value beats the user default;
  - Reset uses user defaults for common keys and hard-coded values for tab-specific ones;
  - a newer apply stamp overwrites the common keys on every tab and leaves tab-specific keys alone;
  - an older stamp does nothing.
- `OASProgressVueFilterPersistence.spec.ts`: the `showEmptyTopStages` key is dropped.
- Heat Map spec: with "Stages not started" off, trailing unstarted columns are trimmed; with it on, they show.
- Next Steps spec: member options follow the name format.
- Update the existing specs that reference `showEmptyTopStages` or the old labels.

## Stage 2 — Display Options page (as built, 2026-11-26)

The whole page is now Vue + Vuetify. The old intro text and the deprecated help-button checkbox were removed.

- **Page shell:** `DisplayOptions.vue` holds only the "Display Options" title and a `ref` div. `DisplayOptions.ts` mounts
  `components/DisplayOptionsTabsVue` into it as a second Vue instance from Summit's Vuetify `vue`, the same pattern as
  `OasProgressVue.ts`.
- **Tabs:** `DisplayOptionsTabsVue` uses `v-tabs` styled like OAS Progress. There's one tab, **Filters**, for now. Later
  display options get their own tabs. A left-hand section menu only pays off at about five or more sections.
- **Filters tab (`components/FilterDefaultsVue`):**
  - Intro: "Report tabs start with these default filter settings, and go back to them when 'Reset Filters' is
    pressed. The Patrol selection defaults to All Patrols."
  - **Name** (the shared `NameFormatSelect`) and **Sort by** (First Name / Last Name), stacked, using the same compact
    controls and heading style as the OAS filter panels.
  - A **Show** subheading, styled like the tab names on the OAS About tab, then one row per setting: label on the left,
    `v-switch` slider on the right. Labels match the report filters exactly: Break by patrol, Approved, Skills not
    started, Stages not started.
  - There are no "used on" hints.
  - Each change saves immediately.
- **Buttons:**
  - **Reset to system defaults:** puts the defaults back to system values only. Tabs pick them up on Reset filters, on
    first visit, or after Apply.
  - **Apply defaults to all pages:** opens a confirm dialog, then calls `markFilterDefaultsApplied()` and shows a toast.
- **Help button setting removed:** it hid Terrain's help button on every page load, so the store code
  (`helpButton`, `toggleHelpButton`, the `SummitState` localStorage save, the freshworks hiding in `initialize`) went
  too. Otherwise anyone who had turned it off would be stuck without the help button.

### Stage 2 tests

`tests/unit/pages/DisplayOptions/FilterDefaultsVue.spec.ts`:

- stored defaults show;
- a change saves;
- Reset restores system values without stamping an Apply;
- Apply only happens from the dialog;
- confirming stamps the time;
- every common default except Patrol is offered;
- Show labels match the report filters;
- switches, not chips;
- the compact controls are used;
- the page mounts the tabs with Filters first;
- the help-button setting is gone from the page and the store.

## Verify (both stages)

- `npm run build`, `npm test` (bar the known UNC smoke test) and `npm run lint` on the changed files.
- In Edge, load `dist/` and check:
  1. Set Name format to Codename and Sort by to Last Name on Display Options.
  2. Open OAS Progress on a tab you've never set up: Codename and Last Name. On a tab you have set up: unchanged.
  3. Click Reset filters on that tab: Codename and Last Name, and tab-specific filters back to their hard-coded values.
  4. Click Apply defaults to all pages: every tab picks the defaults up; Heat Map Skills, Stages and Group by are untouched.
  5. Click Reset to system defaults, then Reset filters on a tab: Full Name and First Name.
  6. Heat Map: turn off "Stages not started" and check the top unstarted columns disappear.
- Run the comment-rule check before each commit.

## After

- Added to `.claude/OUTSTANDING.md` (done 2026-11-25):
  - a single-patrol default;
  - adding mappings when the Present Awards and I Statements pages ship (Present Awards has none of the common filters today).
- Offering this upstream: neither stage depends on the unfinished pages, so it can go in a later `pr/<feature>` branch built the usual way.
