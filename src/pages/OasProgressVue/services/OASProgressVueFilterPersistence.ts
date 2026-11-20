import type { NameFormat } from "@/pages/OasProgress/services/getMemberDisplayName";

export interface OASProgressVueFilterState {
  viewMode: "summary" | "peakAward" | "heatmap" | "table" | "worksheets";
  /** Each tab has its own filter keys, so narrowing one view never narrows another. */
  summaryMemberFilter: string;
  summaryNameFormat: NameFormat;
  summarySelectedPatrols: string[] | null;
  /** Gotcha: old saved state may hold "progress". OasProgressVueContent falls back to firstName. */
  summarySortBy: "firstName" | "lastName";
  /** Overrides summarySortBy until cleared; choosing a Sort by option clears it. */
  summaryColumnSort: { key: string; descending: boolean } | null;
  /** Off hides columns no listed member has started. */
  summaryShowNotStartedSkills: boolean;
  summaryBreakByPatrol: boolean;
  peakAwardMemberFilter: string;
  peakAwardNameFormat: NameFormat;
  peakAwardSelectedPatrols: string[] | null;
  peakAwardSortBy: "firstName" | "lastName" | "progress";
  peakAwardBreakByPatrol: boolean;
  /** Gotcha: "none" is still accepted because old saved state may hold it. The heat map renders it as "skill". */
  groupBy: "skill" | "member" | "none";
  memberFilter: string;
  nameFormat: NameFormat;
  /** Gotcha: [] = show nothing; null = not resolved yet (OasProgressVueContent fills it once patrols load). */
  selectedPatrols: string[] | null;
  breakByPatrol: boolean;
  /** showNotStarted only affects a whole stage with no progress, never single squares. */
  showEmptySkillRows: boolean;
  showEmptyTopStages: boolean;
  showAwarded: boolean;
  showNotStarted: boolean;
  showAnswered: boolean;
  visibleStreams: string[];
  /** A true multi-select, not a range: picking 2 and 5 shows only those. */
  visibleStages: number[];
  sortBy: "lastName" | "firstName" | "stageProgress";

  /** From skillStreamKey(). A value not in the loaded data falls back to the first Skill - Stream. */
  worksheetSkillStream: string;
  worksheetVisibleStages: number[];
  worksheetNameFormat: NameFormat;
  worksheetSelectedPatrols: string[] | null;
  worksheetBreakByPatrol: boolean;
  worksheetShowCompleted: boolean;
  /** membersAsRows (default) scales to large units; membersAsColumns matches the Topo xlsx/PDF layout. */
  worksheetLayout: "membersAsColumns" | "membersAsRows";
}

// Separate from the React page's key, so the two pages can be configured independently.
const OAS_PROGRESS_VUE_FILTERS_KEY = "summit.oasProgressVue.filters";

export const saveOASProgressVueFilters = (filters: OASProgressVueFilterState) => {
  try {
    window.localStorage.setItem(OAS_PROGRESS_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {}
};

export const loadOASProgressVueFilters = (): Partial<OASProgressVueFilterState> | null => {
  try {
    const stored = window.localStorage.getItem(OAS_PROGRESS_VUE_FILTERS_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as Partial<OASProgressVueFilterState>;
  } catch {
    return null;
  }
};
