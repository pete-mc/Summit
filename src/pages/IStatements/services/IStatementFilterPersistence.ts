import { OAS_STREAMS } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { ALL_STAGES, type IStatementFilters } from "./filterIStatementMatrix";

const I_STATEMENT_FILTERS_KEY = "summit.iStatements.filters";

/** Defaults open small: the full grid is ~180 x ~500 and slow. */
const DEFAULT_STAGE_TO = 5;

export function defaultIStatementFilters(): IStatementFilters {
  return {
    skills: [...OAS_STREAMS],
    stageFrom: ALL_STAGES[0],
    stageTo: DEFAULT_STAGE_TO,
    hideEmptyStages: false,
    hideEmptyGroups: false,
    hideEmptyRows: true,
  };
}

export function saveIStatementFilters(filters: IStatementFilters): void {
  try {
    window.localStorage.setItem(I_STATEMENT_FILTERS_KEY, JSON.stringify(filters));
  } catch {}
}

function coerceStage(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && ALL_STAGES.includes(value) ? value : fallback;
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Validates every field, so state saved before a skill or stage change can't break the page. */
export function loadIStatementFilters(): IStatementFilters {
  const defaults = defaultIStatementFilters();

  try {
    const stored = window.localStorage.getItem(I_STATEMENT_FILTERS_KEY);
    if (!stored) {
      return defaults;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return defaults;
    }

    const skills = Array.isArray(parsed.skills) ? parsed.skills.filter((skill: unknown): skill is string => typeof skill === "string" && OAS_STREAMS.includes(skill)) : defaults.skills;

    const stageFrom = coerceStage(parsed.stageFrom, defaults.stageFrom);
    const stageTo = coerceStage(parsed.stageTo, defaults.stageTo);

    return {
      skills: skills.length > 0 ? skills : defaults.skills,
      stageFrom: Math.min(stageFrom, stageTo),
      stageTo: Math.max(stageFrom, stageTo),
      hideEmptyStages: coerceBoolean(parsed.hideEmptyStages, defaults.hideEmptyStages),
      hideEmptyGroups: coerceBoolean(parsed.hideEmptyGroups, defaults.hideEmptyGroups),
      hideEmptyRows: coerceBoolean(parsed.hideEmptyRows, defaults.hideEmptyRows),
    };
  } catch {
    return defaults;
  }
}
