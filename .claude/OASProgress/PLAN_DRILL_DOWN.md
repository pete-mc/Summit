# OAS Progress: drill-down links between tabs

Status: design agreed 2026-11-24. Stage 1 built and checked in Edge 2026-11-24; Stage 2 built and checked in Edge 2026-11-24. "Open in" menus list tabs in tab order.
Starts with the Summary tab; other tabs later.

## Idea

Clicking something in a table opens the tab that answers the next question, with that tab's filters set.

| Click on (Summary) | Means | Opens | Filters set |
|---|---|---|---|
| Cell (member × Skill - Stream) | one member, one Skill - Stream | Next Steps | `nextStepsMemberId`, `nextStepsSkillStream`, `nextStepsStage = null` (falls back to lowest un-awarded stage) |
| Column header | one Skill - Stream, everyone shown | Heat Map **or** Stage Grid (menu) | see below |
| Member name | one member, everything | Heat Map (this member) **or** Peak Award (menu) | see below |

## UI rule of thumb

**One sensible destination → plain click. More than one → small menu.**

- **Cell:** plain click. Hover shows pointer, underline and a tooltip: "Open Next Steps: Jane Smith – Bushwalking".
- **Column header:** a header click still **sorts** (unchanged). A small ▾ button beside the sort arrow opens a `v-menu`:
  "Open in Heat Map" / "Open in Stage Grid (stage N)".
- **Member name:** a small ▾ button (shown on row hover) opens a `v-menu`: "Open in Heat Map" / "Open in Peak Award".
- Desktop only, so hover-revealed controls are fine.
- Right-click menus: not used.
- New browser tab: not now. Filters live in one shared localStorage key, so two windows would overwrite each
  other. The jump design below leaves room to put a jump in the URL later.

## Agreed decisions

1. **Target tab's filters:** the jump sets the filters it is about, and resets any filter on that tab that could
   hide the result. Everything else on the target tab stays as the user left it.
2. **Summary's people filters carry across** to targets that have them, so you see the same people you were
   looking at. Patrols: Heat Map `selectedPatrols`, Stage Grid `stageGridSelectedPatrols`, Peak Award
   `peakAwardSelectedPatrols`. Member text filter: Heat Map `memberFilter` on a column jump (Stage Grid has no
   member filter). A member-name jump sets the member filter to that member instead.
3. **Getting back:** the target tab shows a slim bar, "Opened from Summary: Bushwalking · ← Back to Summary".
   Back just switches `viewMode` to `summary`; Summary's own filters were never touched. The bar is page state
   only (not saved). It goes away when the user switches tab another way, or closes it.
4. **Streams merged ("Expand Streams" off):** a cell covers a whole skill. For Next Steps, use the stream whose
   award gives the number shown. On a tie, the first in list order (trunk first, then streams as the Summary
   columns list them). The cell already holds `awards` (one per trunk/stream), so no new data is needed.
5. **Nothing to jump to:** a cell where the member has no un-awarded stage left in that Skill - Stream is **not**
   a link. A "-" (not started) cell **is** a link; it opens stage 1.

## Target details

### Cell → Next Steps
- `nextStepsMemberId = row.memberId`
- `nextStepsSkillStream = skillStreamKey(skill, stream ?? skill)`. Summary column keys use `""` for the trunk
  (`bushwalking::`), but Next Steps keys repeat the skill (`bushwalking::bushwalking`), so convert.
- `nextStepsStage = null`
- Next Steps has no patrol filter, so nothing to carry.

### Column header → Heat Map
- `groupBy = "skill"`, `visibleStreams = [skill]`
- Heat Map filters by **skill only**: a stream column shows the whole skill (trunk + all streams). Acceptable
  for now.
- Carry: `selectedPatrols = summarySelectedPatrols`, `memberFilter = summaryMemberFilter` (same people).
- Reset hiders: `visibleStages` = all, `showAwarded` / `showNotStarted` / `showAnswered` /
  `showEmptySkillRows` / `showEmptyTopStages` = true.

### Column header → Stage Grid
- `stageGridSkillStream = skillStreamKey(skill, stream ?? skill)`. Merged-skill column: use the trunk.
- `stageGridStage` = lowest stage that at least one shown member still needs; menu label shows it
  ("Stage Grid (stage 4)"). If every shown member has finished it, leave the item out.
- Carry: `stageGridSelectedPatrols = summarySelectedPatrols`.
- Reset hiders: `stageGridShowCompleted = true`.

### Member name → Heat Map
- `groupBy = "member"`, `memberFilter = <member's full name>`, `visibleStreams` = all.
- Carry patrols, reset hiders as for the column jump.

### Member name → Peak Award
- `peakAwardMemberFilter = <member's full name>`, carry patrols.

**Known limitation:** Heat Map and Peak Award match members by name text, so a jump to "Sam Smith" also shows
"Samantha Smithers". Rare; a member-id filter can come later if it bites.

## Build shape

One small description per jump, produced by the source table and applied by the page:

```ts
interface TabJump {
  viewMode: OASProgressVueFilterState["viewMode"];
  filters: Partial<OASProgressVueFilterState>;
  originLabel: string; // "Summary: Bushwalking"
}
```

- `services/tabJumps.ts`: pure functions `cellJump`, `columnJumps`, `memberJumps` (return `TabJump | null` /
  `TabJump[]`) plus the "which stream / is there a next stage" helpers. Unit-tested without Vue.
- `OASOverallProgressVue` emits `jump` with a `TabJump`; it does not know about other tabs' filters.
- `OasProgressVueContent.applyTabJump(jump)`: `filters = { ...filters, ...jump.filters, viewMode: jump.viewMode }`,
  sets the back-bar state (`jumpOrigin`, not persisted).
- Later: Heat Map / Peak Award / Next Steps can emit `TabJump`s too, and a `TabJump` can be serialised into the
  URL for "open in new browser tab".

## Stages

1. `tabJumps.ts` + tests; cell → Next Steps (click, hover style, tooltip, no-link rule); back bar.
2. Column header ▾ menu (Heat Map, Stage Grid); member name ▾ menu (Heat Map, Peak Award).

3. Peak Award tab (built and checked in Edge 2026-11-24):
   - **Member name ▾:** Open in Summary (`summaryMemberFilter` = full name) / Open in Heat Map (as Summary's).
     Peak Award's patrols carry across.
   - **Core Skills cell** (whole cell, not single boxes): opens Next Steps for that member and core skill. Link only
     while the requirement is unmet (green bar = no link). Stream = the one holding their highest award of that
     skill; trunk on a tie or with no awards. No link if that Skill - Stream has nothing outstanding.
   - **Core Skill column header ▾:** Open in Heat Map (that skill) / Open in Stage Grid (trunk, lowest stage a
     shown member still needs, **capped at the Peak Award core-skill stage**; left out when all shown have met it).
   - **"Core Skills" group header ▾:** Open in Heat Map with all three core skills.
   - Progress, Progressions, Special: no links (they mix skills). Menus stripped from the print.

## Tests

- `tabJumps.spec.ts`: trunk/stream key conversion; merged-skill stream pick incl. tie → first; no link when
  fully awarded; "-" cell links with stage null; patrol and member filter carried; hiders reset; Stage Grid stage
  choice and item left out when everyone has finished.
- Render contract: linked cells have the link class/tooltip, unlinked cells don't; header click still sorts and
  the ▾ does not.
- Content: applying a jump switches tab, sets filters, leaves unrelated keys alone; Back returns to Summary with
  its filters intact; back bar not saved to localStorage.

## Check in Edge

- Cell jump in expanded and merged modes (pick a member with awards in two Aquatics streams).
- Column jump with a patrol selected on Summary and stages narrowed on Heat Map beforehand.
- Hard refresh on the target tab: no back bar, filters as set.
