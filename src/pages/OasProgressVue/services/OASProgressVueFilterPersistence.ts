import type { NameFormat } from "@/pages/OasProgress/services/getMemberDisplayName";

export interface OASProgressVueFilterState {
  viewMode: "about" | "summary" | "peakAward" | "heatmap" | "nextSteps" | "stageGrid";
  /** Each tab has its own filter keys, so narrowing one view never narrows another. */
  summaryMemberFilter: string;
  summaryNameFormat: NameFormat;
  summarySelectedPatrols: string[] | null;
  /** Gotcha: old saved state may hold "progress". OasProgressVueContent falls back to firstName. */
  summarySortBy: "firstName" | "lastName";
  /** Overrides summarySortBy until cleared; choosing a Sort by option clears it. */
  summaryColumnSort: { key: string; descending: boolean } | null;
  /** Off shows one column per skill, holding its highest approved stage. */
  summaryExpandStreams: boolean;
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
  showApproved: boolean;
  showNotStarted: boolean;
  showAnswered: boolean;
  visibleStreams: string[];
  /** A true multi-select, not a range: picking 2 and 5 shows only those. */
  visibleStages: number[];
  sortBy: "lastName" | "firstName" | "stageProgress";

  /** Each falls back when not offered: first member, first Skill - Stream, lowest unapproved stage (also when null). */
  nextStepsMemberId: string;
  nextStepsSkillStream: string;
  nextStepsStage: number | null;
  nextStepsNameFormat: NameFormat;

  /** From skillStreamKey(). A value not in the loaded data falls back to the first Skill - Stream. */
  stageGridSkillStream: string;
  /** null or a stage the Skill - Stream doesn't have falls back to its lowest stage. */
  stageGridStage: number | null;
  stageGridNameFormat: NameFormat;
  stageGridSortBy: "firstName" | "lastName";
  stageGridSelectedPatrols: string[] | null;
  stageGridBreakByPatrol: boolean;
  stageGridShowApproved: boolean;
  /** membersAsColumns (default) matches the Topo xlsx/PDF layout; membersAsRows scales to large units. */
  stageGridLayout: "membersAsColumns" | "membersAsRows";

  /** When this page last caught up with Display Options' "Apply defaults to all pages". Never reset by a tab. */
  filterDefaultsAppliedAt: number | null;
}

// Separate from the React page's key, so the two pages can be configured independently.
const OAS_PROGRESS_VUE_FILTERS_KEY = "summit.oasProgressVue.filters";

export const saveOASProgressVueFilters = (filters: OASProgressVueFilterState) => {
  try {
    window.localStorage.setItem(OAS_PROGRESS_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {}
};

const RENAMED_KEY_PREFIXES: Array<[string, string]> = [
  ["table", "nextSteps"],
  ["worksheet", "stageGrid"],
];
const RENAMED_KEYS: Record<string, string> = { showAwarded: "showApproved", stageGridShowCompleted: "stageGridShowApproved" };
const DROPPED_KEYS = ["showEmptyTopStages"];
const RENAMED_VIEW_MODES: Record<string, OASProgressVueFilterState["viewMode"]> = { table: "nextSteps", worksheets: "stageGrid" };

function renamedKey(key: string): string {
  const match = RENAMED_KEY_PREFIXES.find(([oldPrefix]) => key.indexOf(oldPrefix) === 0 && /[A-Z]/.test(key.charAt(oldPrefix.length)));
  const prefixed = match ? match[1] + key.slice(match[0].length) : key;
  return RENAMED_KEYS[prefixed] ?? prefixed;
}

/**
 * Gotcha: older saved state names the Next Steps and Stage Grid tabs "table" and "worksheets", with table* and worksheet* keys,
 * and calls the Approved filters showAwarded / stageGridShowCompleted. showEmptyTopStages was folded into showNotStarted.
 * A key already saved under its new name wins.
 */
export function migrateRenamedFilters(stored: Record<string, unknown>): Record<string, unknown> {
  const migrated: Record<string, unknown> = {};
  Object.keys(stored).forEach((key) => {
    if (DROPPED_KEYS.indexOf(key) !== -1) return;
    const newKey = renamedKey(key);
    if (newKey === key || !(newKey in stored)) migrated[newKey] = stored[key];
  });
  const viewMode = migrated.viewMode;
  if (typeof viewMode === "string" && RENAMED_VIEW_MODES[viewMode]) migrated.viewMode = RENAMED_VIEW_MODES[viewMode];
  return migrated;
}

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

    return migrateRenamedFilters(parsed) as Partial<OASProgressVueFilterState>;
  } catch {
    return null;
  }
};
