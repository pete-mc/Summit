export interface OASProgressionFilterState {
  viewMode: "heatmap" | "table";
  memberFilter: string;
  hideLastName: boolean;
  useCodenames: boolean;
  selectedPatrols: string[];
  breakByPatrol: boolean;
  hideEmptyStreams: boolean;
  hideEmptyTopColumns: boolean;
  onlyInProgress: boolean;
  stageRange: [number, number];
  sortBy: "lastName" | "firstName" | "stageProgress";
}

const OAS_PROGRESSION_FILTERS_KEY = "summit.oasProgression.filters";

export const saveOASProgressionFilters = (filters: OASProgressionFilterState) => {
  try {
    window.localStorage.setItem(OAS_PROGRESSION_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // local storage is best-effort only
  }
};

/**
 * Migrates a stored filter blob from the pre-rename "surname" vocabulary (sortBy: "surname",
 * hideSurname) to the current "lastName" vocabulary, so existing users don't lose their saved
 * sort/display preference when this field was renamed to match Terrain's own "last_name" field.
 */
function migrateLegacyKeys(parsed: Record<string, unknown>): Record<string, unknown> {
  if (parsed.sortBy === "surname") {
    parsed.sortBy = "lastName";
  }
  if (typeof parsed.hideSurname === "boolean" && parsed.hideLastName === undefined) {
    parsed.hideLastName = parsed.hideSurname;
  }
  delete parsed.hideSurname;
  return parsed;
}

export const loadOASProgressionFilters = (): Partial<OASProgressionFilterState> | null => {
  try {
    const stored = window.localStorage.getItem(OAS_PROGRESSION_FILTERS_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return migrateLegacyKeys(parsed as Record<string, unknown>) as Partial<OASProgressionFilterState>;
  } catch {
    return null;
  }
};
