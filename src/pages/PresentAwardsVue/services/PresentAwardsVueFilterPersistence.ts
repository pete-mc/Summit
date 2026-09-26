export interface PresentAwardsVueFilterState {
  columnFilters: Record<string, string>;
  showPreviouslyPresented: boolean;
}

/**
 * Its own key, separate from the OAS page's — the two pages are configured independently and must
 * not overwrite each other's saved state.
 *
 * Note what is NOT persisted: the ticked selection and any pending date edits. Those are unsaved
 * work, and restoring them on a later visit would make the page look like it held changes that
 * had actually been saved (or worse, silently re-submit them on the next Save).
 */
const PRESENT_AWARDS_VUE_FILTERS_KEY = "summit.presentAwardsVue.filters";

export const DEFAULT_FILTERS: PresentAwardsVueFilterState = {
  columnFilters: {},
  // Matches the React page's default.
  showPreviouslyPresented: false,
};

export const savePresentAwardsVueFilters = (filters: PresentAwardsVueFilterState) => {
  try {
    window.localStorage.setItem(PRESENT_AWARDS_VUE_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // local storage is best-effort only — it throws in private windows and when site data is
    // blocked, and a persistence failure must never take the page down.
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
