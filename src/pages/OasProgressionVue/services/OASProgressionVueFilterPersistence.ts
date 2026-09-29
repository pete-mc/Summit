export interface OASProgressionVueFilterState {
  viewMode: "heatmap" | "table";
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
