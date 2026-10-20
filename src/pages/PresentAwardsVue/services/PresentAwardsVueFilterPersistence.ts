export interface PresentAwardsVueFilterState {
  columnFilters: Record<string, string>;
  showPreviouslyPresented: boolean;
  groupByMember: boolean;
}

/** Gotcha: ticks and pending dates are never persisted. Restoring them would look saved, or get re-submitted on the next Save. */
const PRESENT_AWARDS_VUE_FILTERS_KEY = "summit.presentAwardsVue.filters";

export const DEFAULT_FILTERS: PresentAwardsVueFilterState = {
  columnFilters: {},
  showPreviouslyPresented: false,
  groupByMember: true,
};

export const savePresentAwardsVueFilters = (filters: PresentAwardsVueFilterState) => {
  try {
    window.localStorage.setItem(PRESENT_AWARDS_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Best effort: localStorage throws in private windows.
  }
};

export const loadPresentAwardsVueFilters = (): Partial<PresentAwardsVueFilterState> | null => {
  try {
    const stored = window.localStorage.getItem(PRESENT_AWARDS_VUE_FILTERS_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as Partial<PresentAwardsVueFilterState>;
  } catch {
    return null;
  }
};
