import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";

export interface OASProgressionVueFilterState {
  viewMode: "heatmap" | "table" | "worksheets";
  /**
   * Heat map only: "skill" keeps the original skill-first layout, "member" inverts it.
   * Defaults to "skill".
   *
   * "none" is still accepted because the table view briefly offered it before its grouping was
   * removed — a state saved in that window must still load. The heat map has no ungrouped form,
   * so it renders "none" as "skill" (see OASHeatMapVue's isGroupedByMember).
   */
  groupBy: "skill" | "member" | "none";
  memberFilter: string;
  /** Replaces the old separate hideLastName/useCodenames booleans — see getMemberDisplayName.ts. */
  nameFormat: NameFormat;
  /**
   * The Patrol filter behaves like every other filter on this page: an empty array means
   * nothing is shown, not "show everyone" (see OASHeatMapVue.ts's sections/memberSections).
   * `null` is a separate "not yet resolved" sentinel for a new user or a just-reset filter set
   * — which patrol names (and whether "Unassigned") exist isn't known until the heat map's data
   * has loaded, so OasProgressionVueContent.ts resolves `null` to the full patrolFilterOptions
   * list the first time that becomes available, then never touches it again. See
   * .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
   */
  selectedPatrols: string[] | null;
  breakByPatrol: boolean;
  /**
   * "Show" dropdown — all five independent, default true (everything shown). Positive framing
   * rather than the original "Hide" dropdown's double-negative — see
   * .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md. showNotStarted governs only a
   * whole stage with zero answered/awarded I-Statements (the collapsed "not started" bar);
   * it has no effect on individual unanswered squares inside an in-progress stage.
   */
  showEmptySkillRows: boolean;
  showEmptyTopStages: boolean;
  showAwarded: boolean;
  showNotStarted: boolean;
  showAnswered: boolean;
  visibleStreams: string[];
  /**
   * Which stage numbers (1-9) are shown — replaces the old "Stage from"/"Stage to" range
   * controls with a single multi-select, matching the "Show" controls' own selection pattern.
   * A true multi-select, not a contiguous range: picking stages 2 and 5 shows only those two.
   * See sliceStagesToVisible() and .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
   */
  visibleStages: number[];
  sortBy: "lastName" | "firstName" | "stageProgress";

  /**
   * Worksheets view's own filters — deliberately separate from the heat map's equivalents above
   * (visibleStreams/visibleStages/nameFormat/breakByPatrol), not shared. The heat map is scanned
   * across all nine skills; a worksheet is narrowed to the one skill/stage you are about to
   * print. A leader narrowing to "Bushwalking, stages 4-5" to print should not find their heat
   * map narrowed the same way when they switch back — see .claude/OASWorksheets/PLAN_STAGE_3.md §2.
   */
  worksheetVisibleSkills: string[];
  worksheetVisibleStages: number[];
  worksheetNameFormat: NameFormat;
  /**
   * Worksheets' own Patrol filter — independent state from the Heat Map's selectedPatrols
   * (same reasoning as every other worksheet* filter above), but identical control and
   * semantics: empty = show nothing, null = "not yet resolved" (resolved to the full
   * worksheetPatrolFilterOptions list the first time real patrol data loads, or on reset). See
   * selectedPatrols's own comment above and .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
   */
  worksheetSelectedPatrols: string[] | null;
  worksheetBreakByPatrol: boolean;
  /**
   * "Show" dropdown — positive framing of the old worksheetHideCompleted; default true keeps
   * a member's column even on a worksheet page they have fully completed. See
   * buildWorksheetPages's "Hide completed" pass (still internally named that; only the filter
   * state and UI are inverted).
   */
  worksheetShowCompleted: boolean;
  /**
   * Worksheets view layout — see .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md.
   * "membersAsColumns" is the original layout (I-Statement rows, one column per member) — good
   * for small units, matches the Topo xlsx/PDF references. "membersAsRows" ("Like Terrain" in
   * Topo) transposes it: members become rows (unbounded — the page just grows downward) and
   * I-Statements become columns (bounded — a stage has 7-24 of them), which is what actually
   * scales to a large unit rather than needing ever-more sheets sideways. Defaults to
   * "membersAsRows" (DEV_NOTES.md) — this is now the primary layout; "membersAsColumns" survives
   * as the non-default option for small units that prefer matching the Topo xlsx/PDF layout.
   *
   * Replaces a short-lived `worksheetOrientation: "portrait" | "landscape"` key (Stage 4) — printing
   * is now always landscape (see printWorksheets.ts), so orientation is no longer a user choice.
   */
  worksheetLayout: "membersAsColumns" | "membersAsRows";
}

/**
 * Separate localStorage key from the React page's OASProgressionFilterPersistence.ts — the two
 * pages are independent experiments a user might configure differently, per PLAN_VUESTAGE_3.md.
 */
const OAS_PROGRESSION_VUE_FILTERS_KEY = "summit.oasProgressionVue.filters";

export const saveOASProgressionVueFilters = (filters: OASProgressionVueFilterState) => {
  try {
    window.localStorage.setItem(OAS_PROGRESSION_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // local storage is best-effort only
  }
};

export const loadOASProgressionVueFilters = (): Partial<OASProgressionVueFilterState> | null => {
  try {
    const stored = window.localStorage.getItem(OAS_PROGRESSION_VUE_FILTERS_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as Partial<OASProgressionVueFilterState>;
  } catch {
    return null;
  }
};
