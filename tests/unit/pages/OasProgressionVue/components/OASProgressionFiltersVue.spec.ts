// Gotcha: Jest can't parse .vue files, so stub NameFormatSelect.
jest.mock("@/components/NameFormatSelect.vue", () => ({ __esModule: true, default: { name: "NameFormatSelect", render: () => null } }), { virtual: true });

import OASProgressionFiltersVueOptions from "@/pages/OasProgressionVue/components/OASProgressionFiltersVue";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options = OASProgressionFiltersVueOptions as any;

function makeFilters(overrides: Partial<OASProgressionVueFilterState> = {}): OASProgressionVueFilterState {
  return {
    viewMode: "heatmap",
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
    visibleStreams: [],
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    sortBy: "firstName",
    worksheetVisibleSkills: [],
    worksheetVisibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    worksheetNameFormat: "full",
    worksheetBreakByPatrol: false,
    worksheetShowCompleted: true,
    worksheetLayout: "membersAsColumns",
    ...overrides,
  };
}

/** Regression: a display/storage split meant a one-item Patrol list could never be filtered. Now a plain multi-select. */
describe("OASProgressionFiltersVue — Patrol filter", () => {
  it("patches selectedPatrols directly, with no reconciliation/substitution step", () => {
    const emitted: Array<[string, unknown]> = [];
    const context = {
      filters: makeFilters(),
      $emit: (event: string, payload: unknown) => emitted.push([event, payload]),
    };

    options.methods.patch.call(context, { selectedPatrols: ["Eagles"] });

    expect(emitted).toEqual([["update:filters", expect.objectContaining({ selectedPatrols: ["Eagles"] })]]);
  });

  it("has no onPatrolsChange method — the Patrol select's @change is a plain patch() call now", () => {
    expect(options.methods.onPatrolsChange).toBeUndefined();
  });

  it("has no selectedPatrolsForDisplay computed — the display/storage split that caused the bug is gone", () => {
    expect(options.computed.selectedPatrolsForDisplay).toBeUndefined();
  });
});

/** Regression: "Stage" sort is removed when grouped by member. */
describe("OASProgressionFiltersVue — Sort By options", () => {
  function callSortOptions(groupBy: OASProgressionVueFilterState["groupBy"]) {
    const context = { filters: makeFilters({ groupBy }) };
    return options.computed.sortOptions.call(context) as Array<{ value: string; text: string }>;
  }

  it("offers all three options (including Stage) when grouped by skill", () => {
    expect(callSortOptions("skill").map((o) => o.value)).toEqual(["firstName", "lastName", "stageProgress"]);
  });

  it("omits Stage when grouped by member", () => {
    expect(callSortOptions("member").map((o) => o.value)).toEqual(["firstName", "lastName"]);
  });

  it("onGroupByChange resets sortBy to firstName when switching to member mode while sorted by Stage", () => {
    const emitted: Array<[string, unknown]> = [];
    const context = {
      filters: makeFilters({ groupBy: "skill", sortBy: "stageProgress" }),
      $emit: (event: string, payload: unknown) => emitted.push([event, payload]),
      patch: options.methods.patch,
    };

    options.methods.onGroupByChange.call(context, "member");

    expect(emitted).toEqual([["update:filters", expect.objectContaining({ groupBy: "member", sortBy: "firstName" })]]);
  });

  it("onGroupByChange leaves sortBy alone when it's already valid", () => {
    const emitted: Array<[string, unknown]> = [];
    const context = {
      filters: makeFilters({ groupBy: "skill", sortBy: "lastName" }),
      $emit: (event: string, payload: unknown) => emitted.push([event, payload]),
      patch: options.methods.patch,
    };

    options.methods.onGroupByChange.call(context, "member");

    expect(emitted).toEqual([["update:filters", expect.objectContaining({ groupBy: "member", sortBy: "lastName" })]]);
  });
});
