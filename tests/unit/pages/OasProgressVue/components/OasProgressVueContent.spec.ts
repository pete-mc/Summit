// Gotcha: Jest can't parse .vue files, so stub the children.
jest.mock("@/pages/OasProgressVue/components/OASHeatMapVue.vue", () => ({ __esModule: true, default: { name: "OASHeatMapVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASPeakAwardSummaryFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASPeakAwardSummaryFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASOverallProgressVue.vue", () => ({ __esModule: true, default: { name: "OASOverallProgressVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASPeakAwardSummaryVue.vue", () => ({ __esModule: true, default: { name: "OASPeakAwardSummaryVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASProgressFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASProgressFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASProgressTableVue.vue", () => ({ __esModule: true, default: { name: "OASProgressTableVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASWorksheetFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressVue/components/OASWorksheetsVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetsVue", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitLoadingState.vue", () => ({ __esModule: true, default: { name: "SummitLoadingState", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPrintButton.vue", () => ({ __esModule: true, default: { name: "SummitPrintButton", render: () => null } }), { virtual: true });

// Gotcha: gridExport's jsPDF/xlsx imports are ESM that Jest can't parse.
jest.mock("@/components/gridExport", () => ({
  __esModule: true,
  exportGridToExcel: jest.fn(),
}));

import OasProgressVueContent, { sanitiseViewMode } from "@/pages/OasProgressVue/components/OasProgressVueContent";
import { saveOASProgressVueFilters, type OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

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
    groupBy: "skill",
    memberFilter: "",
    nameFormat: "full",
    selectedPatrols: [],
    breakByPatrol: false,
    showEmptySkillRows: true,
    showEmptyTopStages: true,
    showAwarded: true,
    showNotStarted: true,
    showAnswered: true,
    visibleStreams: ["bushcraft"],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    worksheetSkillStream: "bushcraft::bushcraft",
    worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    worksheetNameFormat: "full",
    worksheetSelectedPatrols: [],
    worksheetBreakByPatrol: false,
    worksheetShowCompleted: true,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

function loadFiltersViaComponentData(): OASProgressVueFilterState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (OasProgressVueContent as any).data();
  return data.filters as OASProgressVueFilterState;
}

describe("sanitiseViewMode", () => {
  it("passes through a recognised viewMode unchanged", () => {
    expect(sanitiseViewMode("summary")).toBe("summary");
    expect(sanitiseViewMode("table")).toBe("table");
    expect(sanitiseViewMode("heatmap")).toBe("heatmap");
    expect(sanitiseViewMode("worksheets")).toBe("worksheets");
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
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "table" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("table");
  });

  it("loads a persisted worksheets viewMode on startup", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "worksheets" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("worksheets");
  });

  it("sanitises a present-but-invalid persisted viewMode back to summary rather than selecting nothing", () => {
    saveOASProgressVueFilters(makeStoredFilters({ viewMode: "bogus" as OASProgressVueFilterState["viewMode"] }));

    expect(loadFiltersViaComponentData().viewMode).toBe("summary");
  });

  it("onViewModeTabChange stores the tab's own value string, not an index", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap" }) };

    methods.onViewModeTabChange.call(context, "table");

    expect(context.filters.viewMode).toBe("table");
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
    it("resets Heat Map's own keys while leaving Summary/Worksheets untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "heatmap",
          memberFilter: "someone",
          sortBy: "lastName",
          summaryMemberFilter: "someone else",
          worksheetSkillStream: "bushcraft::pioneering",
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.memberFilter).toBe("");
      expect(context.filters.sortBy).toBe("firstName");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
      expect(context.filters.worksheetSkillStream).toBe("bushcraft::pioneering");
    });

    it("resets Summary's own keys while leaving Heat Map/Worksheets untouched", () => {
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
          worksheetShowCompleted: false,
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.summaryMemberFilter).toBe("");
      expect(context.filters.summarySortBy).toBe("firstName");
      expect(context.filters.summaryShowNotStartedSkills).toBe(true);
      expect(context.filters.summaryBreakByPatrol).toBe(false);
      expect(context.filters.memberFilter).toBe("someone else");
      expect(context.filters.worksheetShowCompleted).toBe(false);
    });

    // Start from non-default values so the reset is actually demonstrated.
    it("resets Worksheets' own keys while leaving Heat Map/Summary untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "worksheets",
          worksheetSkillStream: "bushcraft::pioneering",
          worksheetVisibleStages: [3, 4, 5],
          worksheetShowCompleted: false,
          memberFilter: "someone",
          summaryMemberFilter: "someone else",
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.worksheetSkillStream).toBe("camping::camping");
      expect(context.filters.worksheetVisibleStages).toEqual([1]);
      expect(context.filters.worksheetShowCompleted).toBe(true);
      expect(context.filters.memberFilter).toBe("someone");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
    });

    it("resets nothing when called on the Table tab, which owns no keys in this filter object", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressVueContent as any).methods;
      const context = { filters: makeStoredFilters({ viewMode: "table", memberFilter: "someone", summaryMemberFilter: "someone else" }), patrolFilterOptions: [] };

      methods.onResetFilters.call(context);

      expect(context.filters.memberFilter).toBe("someone");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
    });
  });

  it("defaults selectedPatrols to null for a new user — 'not yet resolved', not 'show nothing'", () => {
    expect(loadFiltersViaComponentData().selectedPatrols).toBeNull();
  });

  it("defaults worksheetSelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().worksheetSelectedPatrols).toBeNull();
  });

  it("defaults summarySelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().summarySelectedPatrols).toBeNull();
  });

  // Regression: the watcher never fires on reset, so the active tab's patrol must be resolved directly.
  it("onResetFilters resolves only the active tab's own Patrol filter, leaving the other two untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "heatmap", selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Wolves"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: ["Eagles", "Wolves", "Unassigned"],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
  });

  it("onResetFilters falls back to null for the active tab's own Patrol filter when there are no patrol options yet (data hasn't loaded)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "worksheets", selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Eagles"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: [],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.worksheetSelectedPatrols).toBeNull();
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

  it("resolves worksheetSelectedPatrols independently of selectedPatrols", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], worksheetSelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
  });

  it("resolves selectedPatrols, worksheetSelectedPatrols and summarySelectedPatrols together when all three are still null", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: null, worksheetSelectedPatrols: null, summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles", "Wolves"]);
  });

  it("resolves summarySelectedPatrols independently of the other two", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Wolves"], summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Wolves"]);
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

describe("OasProgressVueContent resolvedTableMemberId", () => {
  const resolve = (OasProgressVueContent as unknown as { computed: { resolvedTableMemberId(this: unknown): string } }).computed.resolvedTableMemberId;
  const tableMemberOptions = [
    { text: "Alex Scout", value: "m1" },
    { text: "Sam Ranger", value: "m2" },
  ];

  it("defaults to the first member until one is picked", () => {
    expect(resolve.call({ tableMemberOptions, tableMemberId: "" })).toBe("m1");
  });

  it("keeps the picked member while they are listed, and falls back to the first when they are not", () => {
    expect(resolve.call({ tableMemberOptions, tableMemberId: "m2" })).toBe("m2");
    expect(resolve.call({ tableMemberOptions, tableMemberId: "gone" })).toBe("m1");
  });

  it("is empty while no rows have loaded", () => {
    expect(resolve.call({ tableMemberOptions: [], tableMemberId: "" })).toBe("");
  });
});

describe("OasProgressVueContent resolvedWorksheetSkillStream", () => {
  const resolve = (OasProgressVueContent as unknown as { computed: { resolvedWorksheetSkillStream(this: unknown): string } }).computed.resolvedWorksheetSkillStream;
  const worksheetSkillStreams = [
    { key: "bushcraft::bushcraft", skill: "bushcraft", stream: "bushcraft", label: "Bushcraft" },
    { key: "bushcraft::pioneering", skill: "bushcraft", stream: "pioneering", label: "Bushcraft - Pioneering" },
  ];

  it("keeps the saved Skill - Stream while it is listed, and falls back to the first when it is not", () => {
    expect(resolve.call({ worksheetSkillStreams, filters: { worksheetSkillStream: "bushcraft::pioneering" } })).toBe("bushcraft::pioneering");
    expect(resolve.call({ worksheetSkillStreams, filters: { worksheetSkillStream: "camping::camping" } })).toBe("bushcraft::bushcraft");
  });

  it("is empty while no rows have loaded", () => {
    expect(resolve.call({ worksheetSkillStreams: [], filters: { worksheetSkillStream: "camping::camping" } })).toBe("");
  });
});
