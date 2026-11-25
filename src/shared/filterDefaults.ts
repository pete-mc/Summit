import { NAME_FORMAT_OPTIONS, type NameFormat } from "./nameFormat";

export interface CommonFilterDefaults {
  nameFormat: NameFormat;
  sortBy: "firstName" | "lastName";
  breakByPatrol: boolean;
  showApproved: boolean;
  showSkillsNotStarted: boolean;
  showStagesNotStarted: boolean;
}

export const SYSTEM_FILTER_DEFAULTS: CommonFilterDefaults = {
  nameFormat: "full",
  sortBy: "firstName",
  breakByPatrol: false,
  showApproved: true,
  showSkillsNotStarted: true,
  showStagesNotStarted: true,
};

/** Gotcha: localStorage, not chrome.storage, which doesn't exist in Terrain's MAIN world. */
const FILTER_DEFAULTS_KEY = "summit.filterDefaults";

interface StoredFilterDefaults {
  defaults?: Partial<Record<keyof CommonFilterDefaults, unknown>>;
  appliedAt?: unknown;
}

function readStored(): StoredFilterDefaults {
  try {
    const stored = window.localStorage.getItem(FILTER_DEFAULTS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? (parsed as StoredFilterDefaults) : {};
  } catch {
    return {};
  }
}

function writeStored(stored: StoredFilterDefaults): void {
  try {
    window.localStorage.setItem(FILTER_DEFAULTS_KEY, JSON.stringify(stored));
  } catch {}
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function loadFilterDefaults(): CommonFilterDefaults {
  const stored = readStored().defaults ?? {};
  const system = SYSTEM_FILTER_DEFAULTS;
  return {
    nameFormat: NAME_FORMAT_OPTIONS.some((o) => o.value === stored.nameFormat) ? (stored.nameFormat as NameFormat) : system.nameFormat,
    sortBy: stored.sortBy === "firstName" || stored.sortBy === "lastName" ? stored.sortBy : system.sortBy,
    breakByPatrol: booleanOr(stored.breakByPatrol, system.breakByPatrol),
    showApproved: booleanOr(stored.showApproved, system.showApproved),
    showSkillsNotStarted: booleanOr(stored.showSkillsNotStarted, system.showSkillsNotStarted),
    showStagesNotStarted: booleanOr(stored.showStagesNotStarted, system.showStagesNotStarted),
  };
}

export function saveFilterDefaults(defaults: CommonFilterDefaults): void {
  writeStored({ ...readStored(), defaults: { ...defaults } });
}

export function resetFilterDefaults(): void {
  saveFilterDefaults(SYSTEM_FILTER_DEFAULTS);
}

/** Pages compare this with the time they last caught up, and overwrite their common filters when it is newer. */
export function markFilterDefaultsApplied(now: number = Date.now()): void {
  writeStored({ ...readStored(), appliedAt: now });
}

export function loadFilterDefaultsAppliedAt(): number | null {
  const appliedAt = readStored().appliedAt;
  return typeof appliedAt === "number" ? appliedAt : null;
}
