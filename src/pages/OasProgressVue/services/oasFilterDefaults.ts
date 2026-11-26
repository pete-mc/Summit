import type { CommonFilterDefaults } from "@/shared/filterDefaults";
import type { OASProgressVueFilterState } from "./OASProgressVueFilterPersistence";

type ViewMode = OASProgressVueFilterState["viewMode"];

/** Gotcha: patrols map to null, which OasProgressVueContent resolves to All Patrols once patrols are known. */
export function commonDefaultsForTab(viewMode: ViewMode, defaults: CommonFilterDefaults): Partial<OASProgressVueFilterState> {
  switch (viewMode) {
    case "summary":
      return {
        summaryNameFormat: defaults.nameFormat,
        summarySortBy: defaults.sortBy,
        summarySelectedPatrols: null,
        summaryColumnSort: null,
        summaryBreakByPatrol: defaults.breakByPatrol,
        summaryShowNotStartedSkills: defaults.showSkillsNotStarted,
      };
    case "peakAward":
      return {
        peakAwardNameFormat: defaults.nameFormat,
        peakAwardSortBy: defaults.sortBy,
        peakAwardSelectedPatrols: null,
        peakAwardBreakByPatrol: defaults.breakByPatrol,
      };
    case "heatmap":
      return {
        nameFormat: defaults.nameFormat,
        sortBy: defaults.sortBy,
        selectedPatrols: null,
        breakByPatrol: defaults.breakByPatrol,
        showApproved: defaults.showApproved,
        showEmptySkillRows: defaults.showSkillsNotStarted,
        showNotStarted: defaults.showStagesNotStarted,
      };
    case "stageGrid":
      return {
        stageGridNameFormat: defaults.nameFormat,
        stageGridSortBy: defaults.sortBy,
        stageGridSelectedPatrols: null,
        stageGridBreakByPatrol: defaults.breakByPatrol,
        stageGridShowApproved: defaults.showApproved,
      };
    case "nextSteps":
      return { nextStepsNameFormat: defaults.nameFormat };
    case "about":
    default:
      return {};
  }
}

const TABS_WITH_FILTERS: ViewMode[] = ["summary", "peakAward", "heatmap", "stageGrid", "nextSteps"];

export function commonDefaultsForAllTabs(defaults: CommonFilterDefaults): Partial<OASProgressVueFilterState> {
  return TABS_WITH_FILTERS.reduce<Partial<OASProgressVueFilterState>>((all, viewMode) => ({ ...all, ...commonDefaultsForTab(viewMode, defaults) }), {});
}
