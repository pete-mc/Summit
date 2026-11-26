// Gotcha: Jest can't parse .vue files, so stub the children.
jest.mock("@/pages/OasProgressVue/components/OASHeatMapVue.vue", () => ({ __esModule: true, default: { name: "OASHeatMapVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASSummaryTabFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASSummaryTabFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASOverallProgressVue.vue", () => ({ __esModule: true, default: { name: "OASOverallProgressVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASPeakAwardSummaryVue.vue", () => ({ __esModule: true, default: { name: "OASPeakAwardSummaryVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASProgressFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASProgressFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASNextStepsVue.vue", () => ({ __esModule: true, default: { name: "OASNextStepsVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASNextStepsFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASNextStepsFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASStageGridFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASStageGridFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASAboutTabsVue.vue", () => ({ __esModule: true, default: { name: "OASAboutTabsVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASStageGridVue.vue", () => ({ __esModule: true, default: { name: "OASStageGridVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASTabJumpMenu.vue", () => ({ __esModule: true, default: { name: "OASTabJumpMenu", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitLoadingState.vue", () => ({ __esModule: true, default: { name: "SummitLoadingState", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPrintButton.vue", () => ({ __esModule: true, default: { name: "SummitPrintButton", render: () => null } }), { virtual: true });

// Gotcha: gridExport's jsPDF/xlsx imports are ESM that Jest can't parse.
jest.mock("@/components/gridExport", () => ({
  __esModule: true,
  exportGridToExcel: jest.fn(),
}));

import OasProgressVueContent, { sanitiseViewMode } from "@/pages/OasProgressVue/components/OasProgressVueContent";
import { loadOASProgressVueFilters, saveOASProgressVueFilters, type OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import { markFilterDefaultsApplied, saveFilterDefaults, SYSTEM_FILTER_DEFAULTS } from "@/shared/filterDefaults";

function makeStoredFilters(overrides: Partial<OASProgressVueFilterState> = {}): OASProgressVueFilterState {
  return {
    viewMode: "heatmap",
    summaryMemberFilter: "",
    summaryNameFormat: "full",
    summarySelectedPatrols: [],
    summarySortBy: "firstName",
    summaryColumnSort: null,
    summaryShowNotStartedSkills: true,
    summaryBreakByPatrol: false,
    peakAwardMemberFilter: "",
    peakAwardNameFormat: "full",
    peakAwardSelectedPatrols: [],
    peakAwardSortBy: "firstName",
    peakAwardBreakByPatrol: false,
    groupBy: "skill",
    memberFilter: "",
    nameFormat: "full",
    selectedPatrols: [],
    breakByPatrol: false,
    showEmptySkillRows: true,
    showApproved: true,
    showNotStarted: true,
    showAnswered: true,
    visibleStreams: ["bushcraft"],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    nextStepsMemberId: "",
    nextStepsSkillStream: "",
    nextStepsStage: null,
    nextStepsNameFormat: "full",
    stageGridSkillStream: "bushcraft::bushcraft",
    stageGridStage: 1,
    stageGridNameFormat: "full",
    stageGridSortBy: "firstName",
    stageGridSelectedPatrols: [],
    stageGridBreakByPatrol: false,
    stageGridShowApproved: true,
    stageGridLayout: "membersAsColumns",
    filterDefaultsAppliedAt: null,
    ...overrides,
  };
}

function loadFiltersViaComponentData(): OASProgressVueFilterState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (OasProgressVueContent as any).data();
  return data.filters as OASProgressVueFilterState;
}

describe("OasProgressVueContent — Display Options filter defaults", () => {
  beforeEach(() => window.localStorage.clear());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = (OasProgressVueContent as any).methods;
  const leaderDefaults = { ...SYSTEM_FILTER_DEFAULTS, nameFormat: "codename" as const, sortBy: "lastName" as const, showApproved: false, showStagesNotStarted: false };

  it("starts a tab never set up from the leader's defaults", () => {
    saveFilterDefaults(leaderDefaults);

    const filters = loadFiltersViaComponentData();

    expect(filters.summaryNameFormat).toBe("codename");
    expect(filters.sortBy).toBe("lastName");
    expect(filters.stageGridShowApproved).toBe(false);
    expect(filters.showNotStarted).toBe(false);
    expect(filters.nextStepsNameFormat).toBe("codename");
  });

  it("keeps a tab's saved filters over the leader's defaults", () => {
    saveFilterDefaults(leaderDefaults);
    saveOASProgressVueFilters(makeStoredFilters({ nameFormat: "first" }));

    expect(loadFiltersViaComponentData().nameFormat).toBe("first");
  });

  it("Reset filters uses the leader's defaults for common filters and the tab's own for the rest", () => {
    saveFilterDefaults(leaderDefaults);
    const context = { filters: makeStoredFilters({ viewMode: "heatmap", groupBy: "member", nameFormat: "first", showApproved: true }), patrolFilterOptions: [] };

    methods.onResetFilters.call(context);

    expect(context.filters.nameFormat).toBe("codename");
    expect(context.filters.sortBy).toBe("lastName");
    expect(context.filters.showApproved).toBe(false);
    expect(context.filters.groupBy).toBe("skill");
    expect(context.filters.stageGridNameFormat).toBe("full");
  });

  it("Apply defaults overwrites common filters on every tab once, keeping tab-specific ones", () => {
    saveOASProgressVueFilters(makeStoredFilters({ nameFormat: "first", stageGridNameFormat: "first", groupBy: "member", visibleStages: [2], summarySelectedPatrols: ["Eagles"], summaryColumnSort: { key: "camping", descending: true } }));
    saveFilterDefaults(leaderDefaults);
    markFilterDefaultsApplied(1000);

    const filters = loadFiltersViaComponentData();

    expect(filters.nameFormat).toBe("codename");
    expect(filters.stageGridNameFormat).toBe("codename");
    expect(filters.groupBy).toBe("member");
    expect(filters.visibleStages).toEqual([2]);
    expect(filters.summarySelectedPatrols).toBeNull();
    expect(filters.summaryColumnSort).toBeNull();
    expect(loadOASProgressVueFilters()?.filterDefaultsAppliedAt).toBe(1000);
  });

  it("doesn't apply the same Apply twice, so later tab changes survive", () => {
    saveFilterDefaults(leaderDefaults);
    markFilterDefaultsApplied(1000);
    saveOASProgressVueFilters(makeStoredFilters({ nameFormat: "first", filterDefaultsAppliedAt: 1000 }));

    expect(loadFiltersViaComponentData().nameFormat).toBe("first");
  });
});

describe("sanitiseViewMode", () => {
  it("passes through a recognised viewMode unchanged", () => {
    expect(sanitiseViewMode("summary")).toBe("summary");
    expect(sanitiseViewMode("peakAward")).toBe("peakAward");
    expect(sanitiseViewMode("nextSteps")).toBe("nextSteps");
    expect(sanitiseViewMode("heatmap")).toBe("heatmap");
    expect(sanitiseViewMode("stageGrid")).toBe("stageGrid");
  });

  it("falls back to summary for an unrecognised value", () => {
    expect(sanitiseViewMode("bogus")).toBe("summary");
    expect(sanitiseViewMode(undefined)).toBe("summary");
    expect(sanitiseViewMode(null)).toBe("summary");
  });
});

describe("OasProgressVueContent view mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads a persisted table viewMode on startup", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "nextSteps" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("nextSteps");
  });

  it("loads a persisted Stage Grid viewMode on startup", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "stageGrid" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("stageGrid");
  });

  it("loads a persisted About viewMode on startup", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "about" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("about");
  });

  it("loads a persisted peakAward viewMode on startup", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "peakAward" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("peakAward");
  });

  // Summary used to offer Sort by Progress, which belongs to the Peak Award table.
  it("falls back to First Name for a saved Summary sort of Progress", () => {
    saveOASProgressVueFilters(makeStoredFilters({ summarySortBy: "progress" as OASProgressVueFilterState["summarySortBy"] }));

    expect(loadFiltersViaComponentData().summarySortBy).toBe("firstName");
  });

  it("keeps a saved Summary sort of Last Name", () => {
    saveOASProgressVueFilters(makeStoredFilters({ summarySortBy: "lastName" }));

    expect(loadFiltersViaComponentData().summarySortBy).toBe("lastName");
  });

  it("choosing a Summary Sort by option clears the column sort", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = { filters: makeStoredFilters({ summaryColumnSort: { key: "camping", descending: true } }) };

    methods.onSummarySortByUpdate.call(context, "lastName");

    expect(context.filters.summarySortBy).toBe("lastName");
    expect(context.filters.summaryColumnSort).toBeNull();
  });

  it("sanitises a present-but-invalid persisted viewMode back to summary rather than selecting nothing", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "bogus" as OASProgressVueFilterState["viewMode"] }));

    expect(loadFiltersViaComponentData().viewMode).toBe("summary");
  });

  it("onViewModeTabChange stores the tab's own value string, not an index", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap" }) };

    methods.onViewModeTabChange.call(context, "nextSteps");

    expect(context.filters.viewMode).toBe("nextSteps");
  });

  it("onResetFilters leaves viewMode untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap", memberFilter: "someone" }), patrolFilterOptions: [] };

    methods.onResetFilters.call(context);

    expect(context.filters.viewMode).toBe("heatmap");
    expect(context.filters.memberFilter).toBe("");
  });

  // Regression: "Reset filters" on one tab used to reset every tab.
  describe("onResetFilters only resets the currently active tab's own filters", () => {
    it("resets Heat Map's own keys while leaving Summary/Stage Grid untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "heatmap",
          memberFilter: "someone",
          sortBy: "lastName",
          summaryMemberFilter: "someone else",
          stageGridSkillStream: "bushcraft::pioneering",
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.memberFilter).toBe("");
      expect(context.filters.sortBy).toBe("firstName");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
      expect(context.filters.stageGridSkillStream).toBe("bushcraft::pioneering");
    });

    it("resets Summary's own keys while leaving Heat Map/Stage Grid untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "summary",
          summaryMemberFilter: "someone",
          summarySortBy: "lastName",
          summaryShowNotStartedSkills: false,
          summaryBreakByPatrol: true,
          memberFilter: "someone else",
          stageGridShowApproved: false,
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.summaryMemberFilter).toBe("");
      expect(context.filters.summarySortBy).toBe("firstName");
      expect(context.filters.summaryShowNotStartedSkills).toBe(true);
      expect(context.filters.summaryBreakByPatrol).toBe(false);
      expect(context.filters.memberFilter).toBe("someone else");
      expect(context.filters.stageGridShowApproved).toBe(false);
    });

    it("resets Peak Award's own keys while leaving Summary untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "peakAward",
          peakAwardMemberFilter: "someone",
          peakAwardSortBy: "progress",
          peakAwardNameFormat: "first",
          peakAwardBreakByPatrol: true,
          summaryMemberFilter: "someone else",
          summaryBreakByPatrol: true,
        }),
        patrolFilterOptions: ["Eagles", "Wolves"],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.peakAwardMemberFilter).toBe("");
      expect(context.filters.peakAwardSortBy).toBe("firstName");
      expect(context.filters.peakAwardNameFormat).toBe("full");
      expect(context.filters.peakAwardBreakByPatrol).toBe(false);
      expect(context.filters.peakAwardSelectedPatrols).toEqual(["Eagles", "Wolves"]);
      expect(context.filters.summaryMemberFilter).toBe("someone else");
      expect(context.filters.summaryBreakByPatrol).toBe(true);
    });

    // Start from non-default values so the reset is actually demonstrated.
    it("resets Stage Grid's own keys while leaving Heat Map/Summary untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "stageGrid",
          stageGridSkillStream: "bushcraft::pioneering",
          stageGridStage: 4,
          stageGridShowApproved: false,
          stageGridSortBy: "lastName",
          stageGridLayout: "membersAsRows",
          memberFilter: "someone",
          summaryMemberFilter: "someone else",
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.stageGridSkillStream).toBe("camping::camping");
      expect(context.filters.stageGridStage).toBe(1);
      expect(context.filters.stageGridShowApproved).toBe(true);
      expect(context.filters.stageGridSortBy).toBe("firstName");
      expect(context.filters.stageGridLayout).toBe("membersAsColumns");
      expect(context.filters.memberFilter).toBe("someone");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
    });

    it("on the Next Steps tab resets only its member, skill and stage", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = { filters: makeStoredFilters({ viewMode: "nextSteps", nextStepsMemberId: "m2", nextStepsSkillStream: "camping::camping", nextStepsStage: 3, memberFilter: "someone" }), patrolFilterOptions: [] };

      methods.onResetFilters.call(context);

      expect(context.filters).toMatchObject({ nextStepsMemberId: "", nextStepsSkillStream: "", nextStepsStage: null, memberFilter: "someone" });
    });
  });

  it("defaults selectedPatrols to null for a new user — 'not yet resolved', not 'show nothing'", () => {
    expect(loadFiltersViaComponentData().selectedPatrols).toBeNull();
  });

  it("defaults stageGridSelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().stageGridSelectedPatrols).toBeNull();
  });

  it("defaults summarySelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().summarySelectedPatrols).toBeNull();
  });

  it("defaults peakAwardSelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().peakAwardSelectedPatrols).toBeNull();
  });

  // Regression: the watcher never fires on reset, so the active tab's patrol must be resolved directly.
  it("onResetFilters resolves only the active tab's own Patrol filter, leaving the other two untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "heatmap", selectedPatrols: ["Eagles"], stageGridSelectedPatrols: ["Wolves"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: ["Eagles", "Wolves", "Unassigned"],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
    expect(context.filters.stageGridSelectedPatrols).toEqual(["Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
  });

  it("onResetFilters falls back to null for the active tab's own Patrol filter when there are no patrol options yet (data hasn't loaded)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "stageGrid", selectedPatrols: ["Eagles"], stageGridSelectedPatrols: ["Eagles"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: [],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.stageGridSelectedPatrols).toBeNull();
    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
  });
});

/** null = not set yet → resolved to all once patrols load. Never overwritten once resolved or emptied. */
describe("OasProgressVueContent — selectedPatrols: null resolution", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patrolFilterOptionsWatcher = (OasProgressVueContent as any).watch.patrolFilterOptions;

  it("resolves null to the full patrolFilterOptions list once real options arrive", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
  });

  it("does nothing while options are still empty (data hasn't loaded yet)", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, []);

    expect(context.filters.selectedPatrols).toBeNull();
  });

  it("never overwrites a user's deliberate empty selection ([] is not null)", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: [] }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves"]);

    expect(context.filters.selectedPatrols).toEqual([]);
  });

  it("never overwrites an already-resolved selection, even if patrolFilterOptions changes again later", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"] }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
  });

  it("resolves stageGridSelectedPatrols independently of selectedPatrols", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], stageGridSelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.stageGridSelectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
  });

  it("resolves selectedPatrols, stageGridSelectedPatrols and summarySelectedPatrols together when all three are still null", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: null, stageGridSelectedPatrols: null, summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.stageGridSelectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles", "Wolves"]);
  });

  it("resolves peakAwardSelectedPatrols independently of summarySelectedPatrols", () => {
    const context = { filters: makeStoredFilters({ summarySelectedPatrols: ["Eagles"], peakAwardSelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves"]);

    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.peakAwardSelectedPatrols).toEqual(["Eagles", "Wolves"]);
  });

  it("resolves summarySelectedPatrols independently of the other two", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], stageGridSelectedPatrols: ["Wolves"], summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.stageGridSelectedPatrols).toEqual(["Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
  });
});

describe("OasProgressVueContent — Patrol filter gating", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computed = (OasProgressVueContent as any).computed;

  function makeSection(members: Array<{ patrolName: string | null }>) {
    return { members };
  }

  // Pre-resolve the sibling computeds a bare .call() needs.
  function resolveContext(grouped: Record<string, { sections: ReturnType<typeof makeSection>[] }>) {
    const availablePatrols = computed.availablePatrols.call({ grouped }) as string[];
    const context = { grouped, availablePatrols } as Record<string, unknown>;
    context.patrolFilterOptions = computed.patrolFilterOptions.call(context) as string[];
    return context;
  }

  function callPatrolFilterOptions(grouped: Record<string, { sections: ReturnType<typeof makeSection>[] }>) {
    const context = resolveContext(grouped);
    return computed.patrolFilterOptions.call(context) as string[];
  }

  function callCanFilterByPatrol(grouped: Record<string, { sections: ReturnType<typeof makeSection>[] }>) {
    const context = resolveContext(grouped);
    return computed.canFilterByPatrol.call(context) as boolean;
  }

  describe("patrolFilterOptions", () => {
    it("is just the named patrols when nobody is unassigned", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: "Wolves" }])] } };
      expect(callPatrolFilterOptions(grouped)).toEqual(["Eagles", "Wolves"]);
    });

    // Regression: "Unassigned" must be selectable.
    it("appends Unassigned when at least one member has no patrol", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: null }, { patrolName: null }])] } };
      expect(callPatrolFilterOptions(grouped)).toEqual(["Eagles", "Unassigned"]);
    });

    it("is just Unassigned when there are no named patrols but some members are unassigned", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: null }])] } };
      expect(callPatrolFilterOptions(grouped)).toEqual(["Unassigned"]);
    });
  });

  describe("canFilterByPatrol", () => {
    it("is false when there are no named patrols and nobody is unassigned", () => {
      const grouped = { bushcraft: { sections: [makeSection([])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(false);
    });

    // Regression: a single option has nothing to filter between.
    it("is false with exactly one named patrol and no unassigned members", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: "Eagles" }])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(false);
    });

    it("is true with exactly one named patrol AND at least one unassigned member — a real choice exists", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: null }])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(true);
    });

    it("is true with two or more named patrols", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: "Wolves" }])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(true);
    });

    it("is false when there are no named patrols and only one is-unassigned entry would result", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: null }])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(false);
    });
  });
});

describe("OasProgressVueContent Next Steps filters", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computed = (OasProgressVueContent as any).computed;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = (OasProgressVueContent as any).methods;
  const nextStepsMemberOptions = [
    { text: "Alex Scout", value: "m1" },
    { text: "Sam Ranger", value: "m2" },
  ];
  const nextStepsSkillStreams = [
    { key: "camping::camping", skill: "camping", stream: "camping", label: "Camping" },
    { key: "vertical::vertical", skill: "vertical", stream: "vertical", label: "Vertical" },
  ];

  it("member: keeps the saved one while listed, otherwise the first, and empty before rows load", () => {
    expect(computed.resolvedNextStepsMemberId.call({ nextStepsMemberOptions, filters: { nextStepsMemberId: "m2" } })).toBe("m2");
    expect(computed.resolvedNextStepsMemberId.call({ nextStepsMemberOptions, filters: { nextStepsMemberId: "gone" } })).toBe("m1");
    expect(computed.resolvedNextStepsMemberId.call({ nextStepsMemberOptions: [], filters: { nextStepsMemberId: "" } })).toBe("");
  });

  it("lists members from the page's member list by first name", () => {
    const unitMembers = [
      { memberId: "m1", firstName: "Zoe", lastName: "Adams", memberName: "Zoe Adams", patrolName: null },
      { memberId: "m2", firstName: "Amy", lastName: "Young", memberName: "Amy Young", patrolName: null },
    ];
    expect(computed.nextStepsMemberOptions.call({ unitMembers, filters: { nextStepsNameFormat: "full" } })).toEqual([
      { text: "Amy Young", value: "m2" },
      { text: "Zoe Adams", value: "m1" },
    ]);
  });

  it("labels Next Steps members in the tab's name format, still sorted by first name", () => {
    const unitMembers = [
      { memberId: "m1", firstName: "Zoe", lastName: "Adams", memberName: "Zoe Adams", patrolName: null },
      { memberId: "m2", firstName: "Amy", lastName: "Young", memberName: "Amy Young", patrolName: null },
    ];
    expect(computed.nextStepsMemberOptions.call({ unitMembers, filters: { nextStepsNameFormat: "firstLastInitial" } })).toEqual([
      { text: "A.Young", value: "m2" },
      { text: "Z.Adams", value: "m1" },
    ]);
  });

  it("skill: keeps the saved one while offered, otherwise the first", () => {
    expect(computed.resolvedNextStepsSkillStream.call({ nextStepsSkillStreams, filters: { nextStepsSkillStream: "vertical::vertical" } })).toBe("vertical::vertical");
    expect(computed.resolvedNextStepsSkillStream.call({ nextStepsSkillStreams, filters: { nextStepsSkillStream: "scouting::scouting" } })).toBe("camping::camping");
  });

  it("stage: keeps the saved one while offered, otherwise the lowest", () => {
    expect(computed.resolvedNextStepsStage.call({ nextStepsStageOptions: [2, 3], filters: { nextStepsStage: 3 } })).toBe(3);
    expect(computed.resolvedNextStepsStage.call({ nextStepsStageOptions: [2, 3], filters: { nextStepsStage: 1 } })).toBe(2);
    expect(computed.resolvedNextStepsStage.call({ nextStepsStageOptions: [2, 3], filters: { nextStepsStage: null } })).toBe(2);
    expect(computed.resolvedNextStepsStage.call({ nextStepsStageOptions: [], filters: { nextStepsStage: null } })).toBeNull();
  });

  it("a new member or skill goes back to the lowest stage; a new stage is kept", () => {
    const context = { filters: makeStoredFilters({ nextStepsStage: 4 }) };
    methods.onNextStepsMemberUpdate.call(context, "m2");
    expect(context.filters).toMatchObject({ nextStepsMemberId: "m2", nextStepsStage: null });

    methods.onNextStepsStageUpdate.call(context, 5);
    methods.onNextStepsSkillStreamUpdate.call(context, "vertical::vertical");
    expect(context.filters).toMatchObject({ nextStepsSkillStream: "vertical::vertical", nextStepsStage: null });

    methods.onNextStepsStageUpdate.call(context, 3);
    expect(context.filters.nextStepsStage).toBe(3);
  });
});

describe("OasProgressVueContent tab jumps", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = (OasProgressVueContent as any).methods;
  const from = { viewMode: "summary" as const, tabName: "Summary", detail: "Jane – Camping" };
  const jump = { viewMode: "nextSteps" as const, filters: { nextStepsMemberId: "m1", nextStepsSkillStream: "camping::camping", nextStepsStage: null }, title: "", from };

  function makeContext(overrides: Partial<OASProgressVueFilterState> = {}) {
    const context = { filters: makeStoredFilters({ viewMode: "summary", summaryMemberFilter: "Jane", nextStepsStage: 4, ...overrides }), jumpOrigin: null as unknown };
    return Object.assign(context, { onViewModeTabChange: (viewMode: string) => methods.onViewModeTabChange.call(context, viewMode) });
  }

  it("switches tab, sets the jump's filters and leaves the rest alone", () => {
    const context = makeContext();
    methods.onTabJump.call(context, jump);

    expect(context.filters).toMatchObject({ viewMode: "nextSteps", nextStepsMemberId: "m1", nextStepsSkillStream: "camping::camping", nextStepsStage: null, summaryMemberFilter: "Jane" });
    expect(context.jumpOrigin).toEqual(from);
  });

  it("Back returns to the origin tab and closes the bar", () => {
    const context = makeContext();
    methods.onTabJump.call(context, jump);
    methods.onJumpBack.call(context);

    expect(context.filters.viewMode).toBe("summary");
    expect(context.filters.summaryMemberFilter).toBe("Jane");
    expect(context.jumpOrigin).toBeNull();
  });

  it("switching tab another way closes the bar, but v-tabs echoing the current tab does not", () => {
    const context = makeContext();
    methods.onTabJump.call(context, jump);

    methods.onViewModeTabChange.call(context, "nextSteps");
    expect(context.jumpOrigin).toEqual(from);

    methods.onViewModeTabChange.call(context, "heatmap");
    expect(context.jumpOrigin).toBeNull();
  });

  it("never saves the back bar with the filters", () => {
    const context = makeContext();
    methods.onTabJump.call(context, jump);

    expect(context.filters).not.toHaveProperty("jumpOrigin");
  });
});

describe("OasProgressVueContent resolvedStageGridStage", () => {
  const resolve = (OasProgressVueContent as unknown as { computed: { resolvedStageGridStage(this: unknown): number | null } }).computed.resolvedStageGridStage;

  it("keeps the saved stage while the skill has it, otherwise the skill's lowest", () => {
    expect(resolve.call({ stageGridStageOptions: [4, 5, 6], filters: { stageGridStage: 5 } })).toBe(5);
    expect(resolve.call({ stageGridStageOptions: [4, 5, 6], filters: { stageGridStage: 2 } })).toBe(4);
    expect(resolve.call({ stageGridStageOptions: [], filters: { stageGridStage: 2 } })).toBeNull();
  });
});

describe("OasProgressVueContent resolvedStageGridSkillStream", () => {
  const resolve = (OasProgressVueContent as unknown as { computed: { resolvedStageGridSkillStream(this: unknown): string } }).computed.resolvedStageGridSkillStream;
  const stageGridSkillStreams = [
    { key: "bushcraft::bushcraft", skill: "bushcraft", stream: "bushcraft", label: "Bushcraft" },
    { key: "bushcraft::pioneering", skill: "bushcraft", stream: "pioneering", label: "Bushcraft - Pioneering" },
  ];

  it("keeps the saved Skill - Stream while it is listed, and falls back to the first when it is not", () => {
    expect(resolve.call({ stageGridSkillStreams, filters: { stageGridSkillStream: "bushcraft::pioneering" } })).toBe("bushcraft::pioneering");
    expect(resolve.call({ stageGridSkillStreams, filters: { stageGridSkillStream: "camping::camping" } })).toBe("bushcraft::bushcraft");
  });

  it("is empty while no rows have loaded", () => {
    expect(resolve.call({ stageGridSkillStreams: [], filters: { stageGridSkillStream: "camping::camping" } })).toBe("");
  });
});

describe("OasProgressVueContent Summary rows", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computed = (OasProgressVueContent as any).computed;
  const unitMembers = [
    { memberId: "m1", firstName: "Zoe", lastName: "Adams", memberName: "Zoe Adams", patrolName: "Eagles" },
    { memberId: "m2", firstName: "Amy", lastName: "Young", memberName: "Amy Young", patrolName: "Wolves" },
  ];

  // Regression: Summary rows came from the Peak Award rows, so an unknown section emptied the Summary table.
  it("lists members from the page's member list, without needing the unit's section", () => {
    const context = { unitMembers, grouped: {}, overallProgressColumns: [], section: undefined, filters: makeStoredFilters({ summarySelectedPatrols: ["Eagles", "Wolves"] }) };

    const rows = computed.overallProgressRows.call(context) as Array<{ memberId: string }>;

    expect(rows.map((r) => r.memberId)).toEqual(["m2", "m1"]);
  });

  it("uses Summary's own member, patrol and sort filters", () => {
    const context = {
      unitMembers,
      grouped: {},
      overallProgressColumns: [],
      filters: makeStoredFilters({ summarySelectedPatrols: ["Eagles", "Wolves"], summarySortBy: "lastName", peakAwardSelectedPatrols: [] }),
    };
    expect((computed.overallProgressRows.call(context) as Array<{ memberId: string }>).map((r) => r.memberId)).toEqual(["m1", "m2"]);

    context.filters = makeStoredFilters({ summarySelectedPatrols: ["Wolves"] });
    expect((computed.overallProgressRows.call(context) as Array<{ memberId: string }>).map((r) => r.memberId)).toEqual(["m2"]);
  });
});
