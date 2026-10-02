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
  hideLastName: boolean;
  useCodenames: boolean;
  selectedPatrols: string[];
  breakByPatrol: boolean;
  hideEmptyStreams: boolean;
  hideEmptyTopColumns: boolean;
  onlyInProgress: boolean;
  hideAnswered: boolean;
  visibleStreams: string[];
  stageRange: [number, number];
  sortBy: "lastName" | "firstName" | "stageProgress";

  /**
   * Worksheets view's own filters — deliberately separate from the heat map's equivalents above
   * (visibleStreams/stageRange/hideLastName/useCodenames/breakByPatrol), not shared. The heat map
   * is scanned across all nine skills; a worksheet is narrowed to the one skill/stage you are
   * about to print. A leader narrowing to "Bushwalking, stages 4-5" to print should not find
   * their heat map narrowed the same way when they switch back — see
   * .claude/OASWorksheets/PLAN_STAGE_3.md §2.
   */
  worksheetVisibleSkills: string[];
  worksheetStageRange: [number, number];
  worksheetHideLastName: boolean;
  worksheetUseCodenames: boolean;
  worksheetBreakByPatrol: boolean;
  /** Drops a member's column from a worksheet page they have fully completed. See buildWorksheetPages's "Hide completed" pass. */
  worksheetHideCompleted: boolean;
  /**
   * Worksheets view layout — see .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md.
   * "membersAsColumns" is the original layout (I-Statement rows, one column per member) — good
   * for small units, matches the Topo xlsx/PDF references. "membersAsRows" ("Like Terrain" in
   * Topo) transposes it: members become rows (unbounded — the page just grows downward) and
   * I-Statements become columns (bounded — a stage has 7-24 of them), which is what actually
   * scales to a large unit rather than needing ever-more sheets sideways. Defaults to
   * "membersAsColumns" so an existing user sees no change until they opt into the large-unit layout.
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
