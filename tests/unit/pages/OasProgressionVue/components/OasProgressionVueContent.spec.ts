// The content component's .vue sibling imports several child .vue files, which Jest cannot parse
// (vue-loader only merges template + external script at webpack build time). Stub them so the
// options object under test can be required — each child is covered by its own logic tests. See
// tests/unit/pages/PresentAwardsVue/PresentAwardsVueContent.spec.ts for the same pattern.
jest.mock("@/pages/OasProgressionVue/components/OASHeatMapVue.vue", () => ({ __esModule: true, default: { name: "OASHeatMapVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASPeakAwardSummaryFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASPeakAwardSummaryFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASPeakAwardSummaryVue.vue", () => ({ __esModule: true, default: { name: "OASPeakAwardSummaryVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASProgressionFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASProgressionTableVue.vue", () => ({ __esModule: true, default: { name: "OASProgressionTableVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASWorksheetFiltersVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/OasProgressionVue/components/OASWorksheetsVue.vue", () => ({ __esModule: true, default: { name: "OASWorksheetsVue", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitLoadingState.vue", () => ({ __esModule: true, default: { name: "SummitLoadingState", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPrintButton.vue", () => ({ __esModule: true, default: { name: "SummitPrintButton", render: () => null } }), { virtual: true });

// gridExport's top-level jsPDF/xlsx imports are ESM that Jest cannot parse — mocked here the same
// way PresentAwardsVueContent.spec.ts does, since nothing in this spec exercises export behaviour.
jest.mock("@/components/gridExport", () => ({
  __esModule: true,
  exportGridToExcel: jest.fn(),
}));

import OasProgressionVueContent, { sanitiseViewMode } from "@/pages/OasProgressionVue/components/OasProgressionVueContent";
import { saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

// Mirrors the component's own private DEFAULT_FILTERS shape, needed here only to build a
// realistic "stored" filter object for the persistence round-trip tests below.
function makeStoredFilters(overrides: Partial<OASProgressionVueFilterState> = {}): OASProgressionVueFilterState {
  return {
    viewMode: "heatmap",
    summaryMemberFilter: "",
    summaryNameFormat: "full",
    summarySelectedPatrols: [],
    summarySortBy: "firstName",
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
    worksheetVisibleSkills: ["bushcraft"],
    worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    worksheetNameFormat: "full",
    worksheetSelectedPatrols: [],
    worksheetBreakByPatrol: false,
    worksheetShowCompleted: true,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

// The component options object's `data()` is what actually calls loadInitialFilters() — invoking
// it directly here exercises that load path without mounting the component.
function loadFiltersViaComponentData(): OASProgressionVueFilterState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (OasProgressionVueContent as any).data();
  return data.filters as OASProgressionVueFilterState;
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

describe("OasProgressionVueContent view mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads a persisted table viewMode on startup", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "table" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("table");
  });

  it("loads a persisted worksheets viewMode on startup", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "worksheets" }));

    expect(loadFiltersViaComponentData().viewMode).toBe("worksheets");
  });

  it("sanitises a present-but-invalid persisted viewMode back to summary rather than selecting nothing", () => {
    saveOASProgressionVueFilters(makeStoredFilters({ viewMode: "bogus" as OASProgressionVueFilterState["viewMode"] }));

    expect(loadFiltersViaComponentData().viewMode).toBe("summary");
  });

  it("onViewModeTabChange stores the tab's own value string, not an index", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap" }) };

    methods.onViewModeTabChange.call(context, "table");

    expect(context.filters.viewMode).toBe("table");
  });

  it("onResetFilters leaves viewMode untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = { filters: makeStoredFilters({ viewMode: "heatmap", memberFilter: "someone" }), patrolFilterOptions: [] };

    methods.onResetFilters.call(context);

    expect(context.filters.viewMode).toBe("heatmap");
    expect(context.filters.memberFilter).toBe("");
  });

  // Regression coverage for the user's own report (2026-10-09): "Pressing 'reset filters' on
  // [one] tab resets filters on all tabs. They should all be separate." Each tab's own filter
  // bar calls the same onResetFilters method, so it must look at the CURRENTLY ACTIVE viewMode
  // and only touch that tab's own keys, leaving every other tab's filters exactly as the user
  // left them.
  describe("onResetFilters only resets the currently active tab's own filters", () => {
    it("resets Heat Map's own keys while leaving Summary/Worksheets untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressionVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "heatmap",
          memberFilter: "someone",
          sortBy: "lastName",
          summaryMemberFilter: "someone else",
          worksheetVisibleSkills: ["bushcraft", "bushwalking"],
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.memberFilter).toBe("");
      expect(context.filters.sortBy).toBe("firstName");
      // Untouched — belong to other tabs.
      expect(context.filters.summaryMemberFilter).toBe("someone else");
      expect(context.filters.worksheetVisibleSkills).toEqual(["bushcraft", "bushwalking"]);
    });

    it("resets Summary's own keys while leaving Heat Map/Worksheets untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressionVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "summary",
          summaryMemberFilter: "someone",
          summarySortBy: "lastName",
          memberFilter: "someone else",
          worksheetShowCompleted: false,
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.summaryMemberFilter).toBe("");
      expect(context.filters.summarySortBy).toBe("firstName");
      // Untouched — belong to other tabs.
      expect(context.filters.memberFilter).toBe("someone else");
      expect(context.filters.worksheetShowCompleted).toBe(false);
    });

    // Worksheets defaults are now narrowed (Camping / stage 1 only — DEV_NOTES.md: "To limit
    // processing overhead"), not "everything" — set up a "before reset" state that differs from
    // those defaults so the test actually demonstrates a reset, not a coincidental match.
    it("resets Worksheets' own keys while leaving Heat Map/Summary untouched", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressionVueContent as any).methods;
      const context = {
        filters: makeStoredFilters({
          viewMode: "worksheets",
          worksheetVisibleSkills: ["bushcraft", "bushwalking"],
          worksheetVisibleStages: [3, 4, 5],
          worksheetShowCompleted: false,
          memberFilter: "someone",
          summaryMemberFilter: "someone else",
        }),
        patrolFilterOptions: [],
      };

      methods.onResetFilters.call(context);

      expect(context.filters.worksheetVisibleSkills).toEqual(["camping"]);
      expect(context.filters.worksheetVisibleStages).toEqual([1]);
      expect(context.filters.worksheetShowCompleted).toBe(true);
      // Untouched — belong to other tabs.
      expect(context.filters.memberFilter).toBe("someone");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
    });

    it("resets nothing when called on the Table tab, which owns no keys in this filter object", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = (OasProgressionVueContent as any).methods;
      const context = { filters: makeStoredFilters({ viewMode: "table", memberFilter: "someone", summaryMemberFilter: "someone else" }), patrolFilterOptions: [] };

      methods.onResetFilters.call(context);

      expect(context.filters.memberFilter).toBe("someone");
      expect(context.filters.summaryMemberFilter).toBe("someone else");
    });
  });

  it("defaults selectedPatrols to null for a new user — 'not yet resolved', not 'show nothing'", () => {
    expect(loadFiltersViaComponentData().selectedPatrols).toBeNull();
  });

  // Same null-sentinel default as the Heat Map's selectedPatrols, since the Worksheets Patrol
  // filter was added with identical defaults per DEV_NOTES.md: "Add exact same Patrol filter as
  // per Heatmap, with same defaults."
  it("defaults worksheetSelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().worksheetSelectedPatrols).toBeNull();
  });

  // Same null-sentinel default again for the Summary tab's own Patrol filter — see
  // .claude/OASProgression/PLAN_PEAK_AWARD_SUMMARY.md.
  it("defaults summarySelectedPatrols to null for a new user too", () => {
    expect(loadFiltersViaComponentData().summarySelectedPatrols).toBeNull();
  });

  // onResetFilters resolves ONLY the active tab's own Patrol filter synchronously from
  // patrolFilterOptions rather than leaving it null for the watcher — patrol data was already
  // loaded before a reset runs, so patrolFilterOptions's VALUE doesn't change and the watcher
  // would never fire. See .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md's note on the
  // Patrol-reset bug. The OTHER two tabs' Patrol selections are untouched — same per-tab scoping
  // as every other key (see the describe block above).
  it("onResetFilters resolves only the active tab's own Patrol filter, leaving the other two untouched", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "heatmap", selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Wolves"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: ["Eagles", "Wolves", "Unassigned"],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]);
    // Untouched — belong to other tabs.
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
  });

  it("onResetFilters falls back to null for the active tab's own Patrol filter when there are no patrol options yet (data hasn't loaded)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods = (OasProgressionVueContent as any).methods;
    const context = {
      filters: makeStoredFilters({ viewMode: "worksheets", selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Eagles"], summarySelectedPatrols: ["Eagles"] }),
      patrolFilterOptions: [],
    };

    methods.onResetFilters.call(context);

    expect(context.filters.worksheetSelectedPatrols).toBeNull();
    // Untouched — belong to other tabs.
    expect(context.filters.selectedPatrols).toEqual(["Eagles"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles"]);
  });
});

/**
 * Regression tests for "When no patrol is selected, no members should be shown... Default to
 * ALL ON if not set previously" — selectedPatrols: null is the "not set previously" sentinel;
 * the patrolFilterOptions watcher resolves it to the full list the first time real patrol data
 * (including "Unassigned") becomes available, and never touches it again once resolved (or
 * once a user has deliberately emptied it). See
 * .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
 */
describe("OasProgressionVueContent — selectedPatrols: null resolution", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patrolFilterOptionsWatcher = (OasProgressionVueContent as any).watch.patrolFilterOptions;

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

  // worksheetSelectedPatrols resolves independently of selectedPatrols — each is only resolved
  // while it is itself still null, matching "Worksheets gets the exact same Patrol filter, same
  // defaults" without coupling the two views' own choices together.
  it("resolves worksheetSelectedPatrols independently of selectedPatrols", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], worksheetSelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]); // untouched — already resolved
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]); // newly resolved
  });

  it("resolves selectedPatrols, worksheetSelectedPatrols and summarySelectedPatrols together when all three are still null", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: null, worksheetSelectedPatrols: null, summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Eagles", "Wolves"]);
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles", "Wolves"]);
  });

  // summarySelectedPatrols resolves independently too, matching the worksheet/heat-map split above.
  it("resolves summarySelectedPatrols independently of the other two", () => {
    const context = { filters: makeStoredFilters({ selectedPatrols: ["Eagles"], worksheetSelectedPatrols: ["Wolves"], summarySelectedPatrols: null }) };

    patrolFilterOptionsWatcher.call(context, ["Eagles", "Wolves", "Unassigned"]);

    expect(context.filters.selectedPatrols).toEqual(["Eagles"]); // untouched — already resolved
    expect(context.filters.worksheetSelectedPatrols).toEqual(["Wolves"]); // untouched — already resolved
    expect(context.filters.summarySelectedPatrols).toEqual(["Eagles", "Wolves", "Unassigned"]); // newly resolved
  });
});

describe("OasProgressionVueContent — Patrol filter gating", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computed = (OasProgressionVueContent as any).computed;

  function makeSection(members: Array<{ patrolName: string | null }>) {
    return { members };
  }

  // patrolFilterOptions and canFilterByPatrol both read sibling computeds (availablePatrols,
  // and patrolFilterOptions reads availablePatrols too) — Vue resolves that via reactivity when
  // mounted, but a bare .call() needs the chain resolved by hand first.
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

    // The scenario the bug report described: one named patrol plus unassigned members.
    // "Unassigned" must be a real, selectable item here — it previously wasn't offered at all,
    // so there was no way to filter to just the unassigned members. See
    // .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
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

    // The original bug: with exactly one selectable option (one named patrol, nobody
    // unassigned), the Patrol filter has nothing to narrow between — a single-item
    // multi-select could never actually reach its own "filtered" state.
    it("is false with exactly one named patrol and no unassigned members", () => {
      const grouped = { bushcraft: { sections: [makeSection([{ patrolName: "Eagles" }, { patrolName: "Eagles" }])] } };
      expect(callCanFilterByPatrol(grouped)).toBe(false);
    });

    // The bug report's exact scenario: one named patrol plus unassigned members. Two real
    // options now exist (the patrol, and "Unassigned"), so the filter is meaningful.
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
