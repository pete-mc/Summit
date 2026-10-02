import { filterMembersByPatrol, groupMembersByPatrol, collectPatrolNames, sliceStagesToRange, formatStageProgress, sortMembers } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { HeatMapStage, HeatMapSection, SectionMemberRow } from "@/pages/OasProgression/services/groupRowsForHeatMap";

function makeStage(overrides: Partial<HeatMapStage> = {}): HeatMapStage {
  return { stage: 1, cells: [], complete: false, ...overrides };
}

function makeCell(overrides: Partial<HeatMapStage["cells"][number]> = {}) {
  return { inputId: "a", iStatement: "I can do a thing", inputGroup: "Plan", answered: false, awarded: false, date: null, ...overrides };
}

function makeMemberRow(overrides: Partial<SectionMemberRow> = {}): SectionMemberRow {
  return {
    memberId: "m1",
    memberName: "Alex Scout",
    patrolName: null,
    highestStage: null,
    stages: [],
    trunkFullyAwarded: false,
    ...overrides,
  };
}

function makeSection(members: SectionMemberRow[], overrides: Partial<HeatMapSection> = {}): HeatMapSection {
  return { skill: "bushcraft", stream: null, isEmpty: false, members, trunkStageCount: 0, ...overrides };
}

describe("filterMembersByPatrol", () => {
  it("returns all members unchanged when no patrols are selected", () => {
    const members = [makeMemberRow({ patrolName: "Kookaburras" }), makeMemberRow({ memberId: "m2", patrolName: null })];
    expect(filterMembersByPatrol(members, [])).toEqual(members);
  });

  it("keeps only members in a selected patrol", () => {
    const kooka = makeMemberRow({ memberId: "m1", patrolName: "Kookaburras" });
    const wombat = makeMemberRow({ memberId: "m2", patrolName: "Wombats" });
    const noPatrol = makeMemberRow({ memberId: "m3", patrolName: null });

    const result = filterMembersByPatrol([kooka, wombat, noPatrol], ["Kookaburras"]);

    expect(result).toEqual([kooka]);
  });

  it("excludes members with no patrol when any patrol filter is active", () => {
    const noPatrol = makeMemberRow({ memberId: "m1", patrolName: null });
    expect(filterMembersByPatrol([noPatrol], ["Kookaburras"])).toEqual([]);
  });
});

describe("groupMembersByPatrol", () => {
  it("groups members alphabetically by patrol name", () => {
    const wombat = makeMemberRow({ memberId: "m1", memberName: "Zara", patrolName: "Wombats" });
    const kooka = makeMemberRow({ memberId: "m2", memberName: "Alex", patrolName: "Kookaburras" });

    const groups = groupMembersByPatrol([wombat, kooka]);

    expect(groups.map((g) => g.patrolName)).toEqual(["Kookaburras", "Wombats"]);
  });

  it("puts members with no patrol into a trailing Unassigned group", () => {
    const kooka = makeMemberRow({ memberId: "m1", patrolName: "Kookaburras" });
    const noPatrol = makeMemberRow({ memberId: "m2", patrolName: null });

    const groups = groupMembersByPatrol([kooka, noPatrol]);

    expect(groups.map((g) => g.patrolName)).toEqual(["Kookaburras", "Unassigned"]);
    expect(groups[1].members).toEqual([noPatrol]);
  });

  it("returns a single unlabeled group when no member in the section has any patrol", () => {
    const members = [makeMemberRow({ memberId: "m1", patrolName: null }), makeMemberRow({ memberId: "m2", patrolName: null })];

    const groups = groupMembersByPatrol(members);

    expect(groups).toHaveLength(1);
    expect(groups[0].patrolName).toBe("");
    expect(groups[0].members).toEqual(members);
  });
});

describe("collectPatrolNames", () => {
  it("returns distinct, alphabetically sorted patrol names across sections", () => {
    const sections = [
      makeSection([makeMemberRow({ memberId: "m1", patrolName: "Wombats" }), makeMemberRow({ memberId: "m2", patrolName: "Kookaburras" })]),
      makeSection([makeMemberRow({ memberId: "m3", patrolName: "Kookaburras" }), makeMemberRow({ memberId: "m4", patrolName: null })]),
    ];

    expect(collectPatrolNames(sections)).toEqual(["Kookaburras", "Wombats"]);
  });

  it("returns an empty array when no member has a patrol", () => {
    const sections = [makeSection([makeMemberRow({ patrolName: null })])];
    expect(collectPatrolNames(sections)).toEqual([]);
  });
});

describe("sliceStagesToRange", () => {
  it("keeps only stages within the inclusive range", () => {
    expect(sliceStagesToRange([1, 2, 3, 4, 5, 6], [3, 5])).toEqual([3, 4, 5]);
  });

  it("returns an empty array when a stream's stages are entirely below the range", () => {
    expect(sliceStagesToRange([1, 2, 3], [5, 8])).toEqual([]);
  });

  it("returns an empty array when a stream's stages are entirely above the range", () => {
    expect(sliceStagesToRange([6, 7, 8], [1, 3])).toEqual([]);
  });
});

describe("formatStageProgress", () => {
  describe("non-stream sections (a non-streamed skill, or a skill's base/trunk section)", () => {
    it("shows a plain dash with no progress when highestStage is null", () => {
      expect(formatStageProgress(null, [], false, 0, false)).toEqual({ stage: "-", nextStageProgress: null });
    });

    it("shows the plain stage number with no .xx when there is no next stage in this section's stages", () => {
      const stages = [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] })];
      expect(formatStageProgress(5, stages, false, 0, false)).toEqual({ stage: "5", nextStageProgress: null });
    });

    it("shows the plain stage number with no .xx when the next stage has zero progress", () => {
      const stages = [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }), makeStage({ stage: 6, cells: [makeCell({ inputId: "b" }), makeCell({ inputId: "c" })] })];
      expect(formatStageProgress(5, stages, false, 0, false)).toEqual({ stage: "5", nextStageProgress: null });
    });

    it("counts answered-or-awarded cells in the next stage above highestStage, zero-padded to 2 digits", () => {
      const stages = [
        makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }),
        makeStage({ stage: 6, cells: [makeCell({ inputId: "b", answered: true }), makeCell({ inputId: "c", awarded: true }), makeCell({ inputId: "d" })] }),
      ];
      expect(formatStageProgress(5, stages, false, 0, false)).toEqual({ stage: "5", nextStageProgress: "02" });
    });

    it("pads a double-digit count the same way (still zero-padded to at least 2 digits)", () => {
      const cells = Array.from({ length: 12 }, (_, i) => makeCell({ inputId: `c${i}`, answered: true }));
      const stages = [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }), makeStage({ stage: 6, cells })];
      expect(formatStageProgress(5, stages, false, 0, false)).toEqual({ stage: "5", nextStageProgress: "12" });
    });
  });

  describe("stream sections", () => {
    it("shows a dash when the base skill's trunk has not been fully awarded yet, even if the stream itself has progress", () => {
      const stages = [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] })];
      expect(formatStageProgress(5, stages, true, 3, false)).toEqual({ stage: "-", nextStageProgress: null });
    });

    it("shows the trunk stage count as a FLOOR when the trunk is done but the stream has zero progress", () => {
      expect(formatStageProgress(null, [], true, 3, true)).toEqual({ stage: "3", nextStageProgress: null });
    });

    it("example: trunk (3) done, next stage (4) has 2 answered-but-not-awarded cells -> 3.02, not 4.xx", () => {
      // highestStage is still null (stage 4 isn't AWARDED yet), so the whole number stays at the
      // trunk floor (3) and .xx counts progress in the stage right above the floor (stage 4).
      const stages = [makeStage({ stage: 4, complete: false, cells: [makeCell({ inputId: "a", answered: true }), makeCell({ inputId: "b", answered: true }), makeCell({ inputId: "c" })] })];
      expect(formatStageProgress(null, stages, true, 3, true)).toEqual({ stage: "3", nextStageProgress: "02" });
    });

    it("example: trunk (3) done, stream stages 5 AND 6 both fully awarded -> whole number is 6, not 3", () => {
      const stages = [makeStage({ stage: 5, complete: true, cells: [makeCell({ inputId: "a", awarded: true })] }), makeStage({ stage: 6, complete: true, cells: [makeCell({ inputId: "b", awarded: true })] })];
      expect(formatStageProgress(6, stages, true, 3, true)).toEqual({ stage: "6", nextStageProgress: null });
    });

    it("once the stream's own highest awarded stage exceeds the trunk, .xx counts progress in the stage above THAT stage, not above the trunk", () => {
      const stages = [
        makeStage({ stage: 5, complete: true, cells: [makeCell({ inputId: "a", awarded: true })] }),
        makeStage({ stage: 6, cells: [makeCell({ inputId: "b", answered: true }), makeCell({ inputId: "c", awarded: true }), makeCell({ inputId: "d" })] }),
      ];
      expect(formatStageProgress(5, stages, true, 3, true)).toEqual({ stage: "5", nextStageProgress: "02" });
    });

    it("never shows a whole number below the trunk stage count, even if the stream's own highestStage is somehow lower", () => {
      const stages = [makeStage({ stage: 2, complete: true, cells: [makeCell({ awarded: true })] })];
      expect(formatStageProgress(2, stages, true, 3, true)).toEqual({ stage: "3", nextStageProgress: null });
    });
  });
});

describe("sortMembers", () => {
  it("sorts by last name, falling back to first name on a tie", () => {
    const zara = makeMemberRow({ memberId: "m1", memberName: "Zara Anderson" });
    const alex = makeMemberRow({ memberId: "m2", memberName: "Alex Baker" });
    const sam = makeMemberRow({ memberId: "m3", memberName: "Sam Anderson" });

    const result = sortMembers([zara, alex, sam], "lastName");

    expect(result.map((m) => m.memberId)).toEqual(["m3", "m1", "m2"]);
  });

  it("sorts by first name", () => {
    const zara = makeMemberRow({ memberId: "m1", memberName: "Zara Anderson" });
    const alex = makeMemberRow({ memberId: "m2", memberName: "Alex Baker" });

    const result = sortMembers([zara, alex], "firstName");

    expect(result.map((m) => m.memberId)).toEqual(["m2", "m1"]);
  });

  it("does not mutate the input array", () => {
    const members = [makeMemberRow({ memberId: "m1", memberName: "Zara" }), makeMemberRow({ memberId: "m2", memberName: "Alex" })];
    const original = [...members];

    sortMembers(members, "firstName");

    expect(members).toEqual(original);
  });

  it("sorts by stageProgress: higher highestStage ranks first", () => {
    const low = makeMemberRow({ memberId: "m1", highestStage: 2 });
    const high = makeMemberRow({ memberId: "m2", highestStage: 5 });

    const result = sortMembers([low, high], "stageProgress");

    expect(result.map((m) => m.memberId)).toEqual(["m2", "m1"]);
  });

  it("sorts by stageProgress: within the same highestStage, more next-stage progress ranks first", () => {
    const fewTicked = makeMemberRow({
      memberId: "m1",
      highestStage: 5,
      stages: [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }), makeStage({ stage: 6, cells: [makeCell({ inputId: "b", answered: true }), makeCell({ inputId: "c" })] })],
    });
    const manyTicked = makeMemberRow({
      memberId: "m2",
      highestStage: 5,
      stages: [makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }), makeStage({ stage: 6, cells: [makeCell({ inputId: "b", answered: true }), makeCell({ inputId: "c", awarded: true })] })],
    });

    const result = sortMembers([fewTicked, manyTicked], "stageProgress");

    expect(result.map((m) => m.memberId)).toEqual(["m2", "m1"]);
  });

  it("sorts by stageProgress: proportionally-further-along ranks first even with a lower raw ticked count", () => {
    const proportionallyFurther = makeMemberRow({
      memberId: "m1",
      highestStage: 5,
      stages: [
        makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }),
        makeStage({ stage: 6, cells: Array.from({ length: 6 }, (_, i) => makeCell({ inputId: `c${i}`, answered: i < 5 })) }), // 5/6 ticked
      ],
    });
    const higherRawCount = makeMemberRow({
      memberId: "m2",
      highestStage: 5,
      stages: [
        makeStage({ stage: 5, complete: true, cells: [makeCell({ awarded: true })] }),
        makeStage({ stage: 6, cells: Array.from({ length: 20 }, (_, i) => makeCell({ inputId: `d${i}`, answered: i < 6 })) }), // 6/20 ticked
      ],
    });

    const result = sortMembers([higherRawCount, proportionallyFurther], "stageProgress");

    expect(result.map((m) => m.memberId)).toEqual(["m1", "m2"]);
  });

  it("sorts by stageProgress: a null highestStage sorts last", () => {
    const noProgress = makeMemberRow({ memberId: "m1", highestStage: null });
    const someProgress = makeMemberRow({ memberId: "m2", highestStage: 1 });

    const result = sortMembers([noProgress, someProgress], "stageProgress");

    expect(result.map((m) => m.memberId)).toEqual(["m2", "m1"]);
  });

  it("sorts by stageProgress in a stream section: a member with real stream progress but an un-awarded trunk sorts as if they had none", () => {
    const gated = makeMemberRow({ memberId: "m1", highestStage: 5, trunkFullyAwarded: false });
    const unlocked = makeMemberRow({ memberId: "m2", highestStage: 1, trunkFullyAwarded: true });

    const result = sortMembers([gated, unlocked], "stageProgress", true, 3);

    expect(result.map((m) => m.memberId)).toEqual(["m2", "m1"]);
  });
});
