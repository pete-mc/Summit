import type { PageSettings } from "./summitPrint";

/**
 * The print dialog's choices (page size, orientation, margins, layout), remembered per profile.
 *
 * localStorage, not chrome.storage: Summit's page code runs in Terrain's MAIN world, where
 * chrome.storage doesn't exist (.claude/Print/PLAN.md I3). Best-effort, same pattern as
 * OASProgressionVueFilterPersistence.ts — a failure just means the defaults are used next time.
 */
const PRINT_SETTINGS_KEY = "summit.print.settings";

type StoredSettings = Record<string, Partial<PageSettings>>;

function loadAll(): StoredSettings {
  try {
    const stored = window.localStorage.getItem(PRINT_SETTINGS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? (parsed as StoredSettings) : {};
  } catch {
    return {};
  }
}

export function loadPrintSettings(profile: string): Partial<PageSettings> {
  const settings = loadAll()[profile];
  return settings && typeof settings === "object" ? settings : {};
}

export function savePrintSettings(profile: string, settings: PageSettings): void {
  try {
    const all = loadAll();
    all[profile] = { pageSize: settings.pageSize, orientation: settings.orientation, margins: settings.margins, layout: settings.layout };
    window.localStorage.setItem(PRINT_SETTINGS_KEY, JSON.stringify(all));
  } catch {
    // local storage is best-effort only
  }
}
