import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import { buildSummaryCellJumps, cellStream, listOutstandingSkillStreams, nextStepsCellJump } from "@/pages/OasProgressVue/services/tabJumps";

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
