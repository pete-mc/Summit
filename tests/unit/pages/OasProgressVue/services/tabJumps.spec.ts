import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import type { PeakAwardMemberRow } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import { OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import {
  buildPeakAwardCoreSkillJumps,
  buildSummaryCellJumps,
  heatMapMemberJumps,
  heatMapSkillStreamJumps,
  heatMapStageCellJump,
  heatMapStageColumnJump,
  lowestStagesByMember,
  memberLowestStage,
  highestAwardedStreams,
  peakAwardCoreSkillHeaderJumps,
  peakAwardCoreSkillsGroupJumps,
  peakAwardMemberJumps,
  cellStream,
  listOutstandingSkillStreams,
  lowestStagesNeeded,
  nextStepsCellJump,
  summaryColumnJumps,
  summaryMemberJumps,
} from "@/pages/OasProgressVue/services/tabJumps";

function progressRow(overrides: Partial<OASProgressRow>): OASProgressRow {
  return {
    unitId: "u1",
    stream: "bushwalking",
    branch: "bushwalking",
    stage: 1,
    inputGroup: "Plan>",
    inputId: "i1",
    iStatement: "I can",
    memberId: "m1",
    memberName: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
    section: null,
    ...overrides,
  };
}

const award = (branch: string, stage: number) => ({ stream: "aquatics", branch, stage, section: "scout", date: null });

const trunk: OverallProgressColumn = { key: "bushwalking::", skill: "bushwalking", stream: null };
const aquaticsMerged: OverallProgressColumn = { key: "aquatics::", skill: "aquatics", stream: null };
const jane: OverallProgressRow = { memberId: "m1", displayName: "Jane Smith", patrolName: null, cells: [] };
const notStarted: OverallProgressCell = { stage: "-", nextStageProgress: null };

describe("listOutstandingSkillStreams", () => {
  it("lists each member's Skill - Streams that still have an un-awarded row", () => {
    const keys = listOutstandingSkillStreams([
      progressRow({ stage: 1, awarded: true }),
      progressRow({ stage: 2 }),
      progressRow({ stream: "aquatics", branch: "swimming", awarded: true }),
      progressRow({ memberId: "m2", stream: "camping", branch: "camping" }),
    ]);

    expect(keys.has("m1|bushwalking::bushwalking")).toBe(true);
    expect(keys.has("m1|aquatics::swimming")).toBe(false);
    expect(keys.has("m2|camping::camping")).toBe(true);
  });
});

describe("cellStream", () => {
  it("uses the column's stream, or the skill for a trunk column", () => {
    expect(cellStream({ key: "aquatics::swimming", skill: "aquatics", stream: "swimming" }, notStarted)).toBe("swimming");
    expect(cellStream(trunk, notStarted)).toBe("bushwalking");
  });

  it("on a merged skill, picks the stream whose award gives the number shown", () => {
    const cell = { stage: "4", nextStageProgress: null, awards: [award("aquatics", 2), award("swimming", 4), award("paddling", 3)] };
    expect(cellStream(aquaticsMerged, cell)).toBe("swimming");
  });

  it("on a tie, picks the first listed (trunk first)", () => {
    const cell = { stage: "3", nextStageProgress: null, awards: [award("aquatics", 3), award("swimming", 3)] };
    expect(cellStream(aquaticsMerged, cell)).toBe("aquatics");
  });

  it("on a merged skill not yet started, uses the trunk", () => {
    expect(cellStream(aquaticsMerged, notStarted)).toBe("aquatics");
  });
});

describe("nextStepsCellJump", () => {
  it("opens Next Steps for that member and Skill - Stream at its lowest un-awarded stage", () => {
    const jump = nextStepsCellJump(jane, trunk, { stage: "3", nextStageProgress: null }, new Set(["m1|bushwalking::bushwalking"]));

    expect(jump).toEqual({
      viewMode: "nextSteps",
      filters: { nextStepsMemberId: "m1", nextStepsSkillStream: "bushwalking::bushwalking", nextStepsStage: null },
      title: "Open Next Steps: Jane Smith – Bushwalking",
      from: { viewMode: "summary", tabName: "Summary", detail: "Jane Smith – Bushwalking" },
    });
  });

  it("names the stream for a stream cell", () => {
    const jump = nextStepsCellJump(jane, aquaticsMerged, { stage: "4", nextStageProgress: null, awards: [award("swimming", 4)] }, new Set(["m1|aquatics::swimming"]));

    expect(jump?.filters.nextStepsSkillStream).toBe("aquatics::swimming");
    expect(jump?.from.detail).toBe("Jane Smith – Aquatics - Swimming");
  });

  it("links a not-started cell while Next Steps has stages to show", () => {
    expect(nextStepsCellJump(jane, trunk, notStarted, new Set(["m1|bushwalking::bushwalking"]))).not.toBeNull();
  });

  it("is not a link when every stage is awarded", () => {
    expect(nextStepsCellJump(jane, trunk, { stage: "9", nextStageProgress: null }, new Set(["m2|bushwalking::bushwalking"]))).toBeNull();
  });
});

describe("buildSummaryCellJumps", () => {
  it("keys jumps by member, aligned with the columns", () => {
    const columns = [trunk, { key: "camping::", skill: "camping", stream: null }];
    const rows = [{ ...jane, cells: [notStarted, notStarted] }];

    const jumps = buildSummaryCellJumps(columns, rows, new Set(["m1|camping::camping"]));

    expect(jumps.m1[0]).toBeNull();
    expect(jumps.m1[1]?.filters.nextStepsSkillStream).toBe("camping::camping");
  });
});

const people = { selectedPatrols: ["Eagles"], memberFilter: "Sm" };
const showEverything = { visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9], showAwarded: true, showNotStarted: true, showAnswered: true, showEmptySkillRows: true, showEmptyTopStages: true };

describe("lowestStagesNeeded", () => {
  it("finds the lowest un-awarded stage among the given members only", () => {
    const lowest = lowestStagesNeeded([progressRow({ stage: 1, awarded: true }), progressRow({ stage: 3 }), progressRow({ memberId: "m2", stage: 2 }), progressRow({ memberId: "m3", stage: 1 })], ["m1", "m2"]);

    expect(lowest).toEqual({ "bushwalking::bushwalking": 2 });
  });
});

describe("summaryColumnJumps", () => {
  it("opens Heat Map on the skill, with Summary's people and nothing else hidden", () => {
    const [heatMap] = summaryColumnJumps(trunk, people, {});

    expect(heatMap.viewMode).toBe("heatmap");
    expect(heatMap.filters).toEqual({ ...showEverything, groupBy: "skill", visibleStreams: ["bushwalking"], selectedPatrols: ["Eagles"], memberFilter: "Sm" });
    expect(heatMap.from.detail).toBe("Bushwalking");
  });

  it("gives each tab its own copy of the patrol list", () => {
    const [heatMap, stageGrid] = summaryColumnJumps(trunk, people, { "bushwalking::bushwalking": 2 });

    expect(heatMap.filters.selectedPatrols).not.toBe(people.selectedPatrols);
    expect(stageGrid.filters.stageGridSelectedPatrols).not.toBe(people.selectedPatrols);
  });

  it("opens Stage Grid on the lowest stage still needed, showing completed members", () => {
    const jumps = summaryColumnJumps({ key: "aquatics::swimming", skill: "aquatics", stream: "swimming" }, people, { "aquatics::swimming": 3 });

    expect(jumps[1]).toMatchObject({
      viewMode: "stageGrid",
      filters: { stageGridSkillStream: "aquatics::swimming", stageGridStage: 3, stageGridSelectedPatrols: ["Eagles"], stageGridShowCompleted: true },
      title: "Open in Stage Grid (stage 3)",
      from: { detail: "Aquatics - Swimming stage 3" },
    });
  });

  it("uses the trunk for a merged skill column", () => {
    const jumps = summaryColumnJumps(aquaticsMerged, people, { "aquatics::aquatics": 1, "aquatics::swimming": 1 });
    expect(jumps[1].filters.stageGridSkillStream).toBe("aquatics::aquatics");
  });

  it("leaves Stage Grid out when every shown member has finished", () => {
    expect(summaryColumnJumps(trunk, people, {}).map((j) => j.viewMode)).toEqual(["heatmap"]);
  });
});

describe("summaryMemberJumps", () => {
  const row = { ...jane, displayName: "Jane S" };

  it("opens Heat Map grouped by member, matched on the full name", () => {
    const heatMap = summaryMemberJumps(row, "Jane Smith", people, true)[1];

    expect(heatMap.filters).toEqual({ ...showEverything, groupBy: "member", visibleStreams: OAS_SKILLS, selectedPatrols: ["Eagles"], memberFilter: "Jane Smith" });
    expect(heatMap.from.detail).toBe("Jane S");
  });

  it("opens Peak Award on that member, only when the section is known", () => {
    expect(summaryMemberJumps(row, "Jane Smith", people, true)[0]).toMatchObject({ viewMode: "peakAward", filters: { peakAwardMemberFilter: "Jane Smith", peakAwardSelectedPatrols: ["Eagles"] } });
    expect(summaryMemberJumps(row, "Jane Smith", people, false)).toHaveLength(1);
  });
});

describe("menu order", () => {
  it("lists Open in options in the same order as the tabs", () => {
    expect(summaryMemberJumps(jane, "Jane Smith", people, true).map((j) => j.viewMode)).toEqual(["peakAward", "heatmap"]);
    expect(summaryColumnJumps(trunk, people, { "bushwalking::bushwalking": 1 }).map((j) => j.viewMode)).toEqual(["heatmap", "stageGrid"]);
  });
});

describe("Peak Award jumps", () => {
  const coreSkill = (skill: "bushcraft" | "bushwalking" | "camping", met: boolean) => ({ skill, requiredStage: 5, highestAwardedStage: met ? 5 : 2, boxes: [], met });
  const peakRow = (overrides: Partial<PeakAwardMemberRow> = {}): PeakAwardMemberRow => ({
    memberId: "m1",
    memberName: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    patrolName: null,
    coreSkills: [coreSkill("bushcraft", false), coreSkill("bushwalking", true), coreSkill("camping", false)],
    totalProgressions: 0,
    requiredProgressions: 10,
    progressionBoxes: [],
    special: null,
    progressScore: 0,
    progressTotal: 0,
    progressPercent: 0,
    ...overrides,
  });
  const displayName = () => "Jane S";

  describe("highestAwardedStreams", () => {
    it("picks the stream holding the highest award, the trunk on a tie", () => {
      const streams = highestAwardedStreams([
        progressRow({ stream: "bushcraft", branch: "bushcraft", stage: 3, awarded: true }),
        progressRow({ stream: "bushcraft", branch: "pioneering", stage: 4, awarded: true }),
        progressRow({ stream: "camping", branch: "camping", stage: 2, awarded: true }),
        progressRow({ stream: "aquatics", branch: "swimming", stage: 2, awarded: true }),
        progressRow({ stream: "aquatics", branch: "aquatics", stage: 2, awarded: true }),
        progressRow({ stream: "vertical", branch: "vertical", stage: 6 }),
      ]);

      expect(streams).toEqual({ "m1|bushcraft": "pioneering", "m1|camping": "camping", "m1|aquatics": "aquatics" });
    });
  });

  describe("buildPeakAwardCoreSkillJumps", () => {
    it("links only unmet core skills, using the highest award's stream or the trunk", () => {
      const outstanding = new Set(["m1|bushcraft::pioneering", "m1|bushwalking::bushwalking", "m1|camping::camping"]);
      const jumps = buildPeakAwardCoreSkillJumps([peakRow()], displayName, { "m1|bushcraft": "pioneering" }, outstanding).m1;

      expect(jumps[0]).toMatchObject({
        viewMode: "nextSteps",
        filters: { nextStepsMemberId: "m1", nextStepsSkillStream: "bushcraft::pioneering", nextStepsStage: null },
        from: { viewMode: "peakAward", tabName: "Peak Award", detail: "Jane S – Bushcraft - Pioneering" },
      });
      expect(jumps[1]).toBeNull();
      expect(jumps[2]?.filters.nextStepsSkillStream).toBe("camping::camping");
    });

    it("is not a link when that Skill - Stream has nothing outstanding", () => {
      expect(buildPeakAwardCoreSkillJumps([peakRow()], displayName, {}, new Set()).m1).toEqual([null, null, null]);
    });
  });

  describe("peakAwardCoreSkillHeaderJumps", () => {
    it("offers Heat Map and Stage Grid per core skill, capping Stage Grid at the Peak Award stage", () => {
      const menus = peakAwardCoreSkillHeaderJumps(people, { "bushcraft::bushcraft": 3, "bushwalking::bushwalking": 6 }, 5);

      expect(menus.map((jumps) => jumps.map((j) => j.viewMode))).toEqual([["heatmap", "stageGrid"], ["heatmap"], ["heatmap"]]);
      expect(menus[0][1].filters).toMatchObject({ stageGridSkillStream: "bushcraft::bushcraft", stageGridStage: 3 });
      expect(menus[0][0].filters).toMatchObject({ visibleStreams: ["bushcraft"], selectedPatrols: ["Eagles"], memberFilter: "Sm" });
      expect(menus[0][0].from).toEqual({ viewMode: "peakAward", tabName: "Peak Award", detail: "Bushcraft" });
    });
  });

  it("the Core Skills heading opens Heat Map on all three core skills", () => {
    const [heatMap] = peakAwardCoreSkillsGroupJumps(people);
    expect(heatMap.filters).toMatchObject({ groupBy: "skill", visibleStreams: ["bushcraft", "bushwalking", "camping"], selectedPatrols: ["Eagles"] });
    expect(heatMap.from.detail).toBe("Core Skills");
  });

  it("a member name opens Summary, then Heat Map, on that member", () => {
    const jumps = peakAwardMemberJumps(peakRow(), "Jane S", people);

    expect(jumps.map((j) => j.viewMode)).toEqual(["summary", "heatmap"]);
    expect(jumps[0].filters).toEqual({ summaryMemberFilter: "Jane Smith", summarySelectedPatrols: ["Eagles"] });
    expect(jumps[1].filters).toMatchObject({ groupBy: "member", memberFilter: "Jane Smith" });
    expect(jumps[0].from).toEqual({ viewMode: "peakAward", tabName: "Peak Award", detail: "Jane S" });
  });
});

describe("Heat Map jumps", () => {
  const target = { memberId: "m1", displayName: "Jane S", skill: "aquatics", stream: "swimming" };

  it("a stage cell opens that exact stage, and only when it isn't awarded or hidden", () => {
    expect(heatMapStageCellJump(target, 3, "squares")).toMatchObject({
      viewMode: "nextSteps",
      filters: { nextStepsMemberId: "m1", nextStepsSkillStream: "aquatics::swimming", nextStepsStage: 3 },
      title: "Open Next Steps: Jane S – Aquatics - Swimming stage 3",
      from: { viewMode: "heatmap", tabName: "Heat Map" },
    });
    expect(heatMapStageCellJump(target, 3, "bar-unstarted")?.filters.nextStepsStage).toBe(3);
    expect(heatMapStageCellJump(target, 3, "bar-complete")).toBeNull();
    expect(heatMapStageCellJump(target, 3, "empty")).toBeNull();
  });

  it("the Stage number opens the lowest stage still needed, while there is one", () => {
    expect(heatMapStageColumnJump(target, new Set(["m1|aquatics::swimming"]))?.filters.nextStepsStage).toBeNull();
    expect(heatMapStageColumnJump(target, new Set())).toBeNull();
  });

  it("a member opens Summary, then Peak Award when the section is known", () => {
    expect(heatMapMemberJumps("Jane Smith", "Jane S", people, true).map((j) => j.viewMode)).toEqual(["summary", "peakAward"]);
    expect(heatMapMemberJumps("Jane Smith", "Jane S", people, false).map((j) => j.viewMode)).toEqual(["summary"]);
    expect(heatMapMemberJumps("Jane Smith", "Jane S", people, true)[1].filters).toEqual({ peakAwardMemberFilter: "Jane Smith", peakAwardSelectedPatrols: ["Eagles"] });
  });

  it("a Skill - Stream opens Stage Grid at the given stage, or nothing when no stage is needed", () => {
    expect(heatMapSkillStreamJumps("aquatics", "swimming", 4, people)[0].filters).toMatchObject({ stageGridSkillStream: "aquatics::swimming", stageGridStage: 4 });
    expect(heatMapSkillStreamJumps("aquatics", "swimming", undefined, people)).toEqual([]);
  });

  it("finds each member's own next stage", () => {
    const lowest = lowestStagesByMember([progressRow({ stage: 1, awarded: true }), progressRow({ stage: 3 }), progressRow({ stage: 2 }), progressRow({ memberId: "m2", stage: 1 })]);
    expect(memberLowestStage(lowest, "m1", "bushwalking", "bushwalking")).toBe(2);
    expect(memberLowestStage(lowest, "m2", "bushwalking", "bushwalking")).toBe(1);
    expect(memberLowestStage(lowest, "m1", "camping", "camping")).toBeUndefined();
  });
});
