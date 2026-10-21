import type { NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";

export interface OASProgressionVueFilterState {
  viewMode: "summary" | "heatmap" | "table" | "worksheets";
  /** Each tab has its own filter keys, so narrowing one view never narrows another. */
  summaryMemberFilter: string;
  summaryNameFormat: NameFormat;
  summarySelectedPatrols: string[] | null;
  summarySortBy: "firstName" | "lastName" | "progress";
  /** Overall Progress table only. Overrides summarySortBy until cleared; choosing a Sort by option clears it. */
  summaryColumnSort: { key: string; descending: boolean } | null;
  /** Gotcha: "none" is still accepted because old saved state may hold it. The heat map renders it as "skill". */
  groupBy: "skill" | "member" | "none";
  memberFilter: string;
  nameFormat: NameFormat;
  /** Gotcha: [] = show nothing; null = not resolved yet (OasProgressionVueContent fills it once patrols load). */
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

  worksheetVisibleSkills: string[];
  worksheetVisibleStages: number[];
  worksheetNameFormat: NameFormat;
  worksheetSelectedPatrols: string[] | null;
  worksheetBreakByPatrol: boolean;
  worksheetShowCompleted: boolean;
  /** membersAsRows (default) scales to large units; membersAsColumns matches the Topo xlsx/PDF layout. */
  worksheetLayout: "membersAsColumns" | "membersAsRows";
}

// Separate from the React page's key, so the two pages can be configured independently.
const OAS_PROGRESSION_VUE_FILTERS_KEY = "summit.oasProgressionVue.filters";

export const saveOASProgressionVueFilters = (filters: OASProgressionVueFilterState) => {
  try {
    window.localStorage.setItem(OAS_PROGRESSION_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {}
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

/** Which Summary tables Print and Excel include. Kept apart from the filters, so Reset filters leaves it alone. */
export interface SummaryIncludeState {
  peakAward: boolean;
  overall: boolean;
}

export const DEFAULT_SUMMARY_INCLUDE: SummaryIncludeState = { peakAward: true, overall: true };

const SUMMARY_INCLUDE_KEY = "summit.oasProgressionVue.summaryInclude";

export const saveSummaryInclude = (include: SummaryIncludeState) => {
  try {
    window.localStorage.setItem(SUMMARY_INCLUDE_KEY, JSON.stringify(include));
  } catch {}
};

/** Falls back to both when the stored value is missing, malformed, or has nothing ticked. */
export const loadSummaryInclude = (): SummaryIncludeState => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SUMMARY_INCLUDE_KEY) || "null");
    const include = { peakAward: parsed?.peakAward === true, overall: parsed?.overall === true };
    return include.peakAward || include.overall ? include : { ...DEFAULT_SUMMARY_INCLUDE };
  } catch {
    return { ...DEFAULT_SUMMARY_INCLUDE };
  }
};
