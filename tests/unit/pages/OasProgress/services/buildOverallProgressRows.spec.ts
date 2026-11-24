import {
  buildCollapsedOverallProgressColumns,
  buildCollapsedOverallProgressRows,
  buildOverallProgressColumns,
  buildOverallProgressRows,
  collapsedColumnSort,
  hideNotStartedColumns,
  nextColumnSort,
  sortOverallProgressRows,
} from "@/pages/OasProgress/services/buildOverallProgressRows";
import type { HeatMapStage, HeatMapSection, SectionMemberRow, SkillHeatMapData } from "@/pages/OasProgress/services/groupRowsForHeatMap";

function makeCell(overrides: Partial<HeatMapStage["cells"][number]> = {}) {
  return { inputId: "a", iStatement: "I can do a thing", inputGroup: "Plan", answered: false, awarded: false, date: null, ...overrides };
}

function makeMemberRow(overrides: Partial<SectionMemberRow> = {}): SectionMemberRow {
  return { memberId: "m1", memberName: "Alex Scout", firstName: "Alex", lastName: "Scout", patrolName: null, highestStage: null, stages: [], trunkFullyAwarded: false, ...overrides };
}

function makeSection(members: SectionMemberRow[], overrides: Partial<HeatMapSection> = {}): HeatMapSection {
  return { skill: "bushcraft", stream: null, isEmpty: false, members, trunkStageCount: 0, ...overrides };
}

function makeSkill(sections: HeatMapSection[]): SkillHeatMapData {
  return { sections, maxStage: 9 };
}

describe("buildOverallProgressColumns", () => {
  it("puts core skills first, then the rest alphabetically, with each trunk before its streams", () => {
    const grouped = {
      vertical: makeSkill([makeSection([], { skill: "vertical" })]),
      aquatics: makeSkill([makeSection([], { skill: "aquatics" }), makeSection([], { skill: "aquatics", stream: "snorkelling" }), makeSection([], { skill: "aquatics", stream: "swimming" })]),
      camping: makeSkill([makeSection([], { skill: "camping" })]),
      bushwalking: makeSkill([makeSection([], { skill: "bushwalking" })]),
    };

    const columns = buildOverallProgressColumns(grouped);

    expect(columns.map((c) => c.key)).toEqual(["bushwalking::", "camping::", "aquatics::", "aquatics::snorkelling", "aquatics::swimming", "vertical::"]);
  });

  it("keeps a stream column even when nobody has started it", () => {
    const grouped = { aquatics: makeSkill([makeSection([makeMemberRow()], { skill: "aquatics" }), makeSection([makeMemberRow()], { skill: "aquatics", stream: "swimming", isEmpty: true })]) };

    expect(buildOverallProgressColumns(grouped).map((c) => c.stream)).toEqual([null, "swimming"]);
  });
});

describe("buildOverallProgressRows", () => {
  it("shows the same stage and next-stage ticks as the heat map's Stage column", () => {
    const member = makeMemberRow({
      highestStage: 3,
      stages: [{ stage: 4, complete: false, cells: [makeCell({ answered: true }), makeCell({ inputId: "b" })] }],
    });
    const grouped = { bushcraft: makeSkill([makeSection([member])]) };

    const [row] = buildOverallProgressRows(grouped, [{ memberId: "m1", displayName: "Alex", patrolName: null }]);

    expect(row.cells).toEqual([{ stage: "3", nextStageProgress: "01" }]);
  });

  function aquaticsWithSwimmer(swimmer: SectionMemberRow) {
    return { aquatics: makeSkill([makeSection([makeMemberRow({ highestStage: 3 })], { skill: "aquatics", trunkStageCount: 3 }), makeSection([swimmer], { skill: "aquatics", stream: "swimming", trunkStageCount: 3 })]) };
  }

  const startedStreamStages: HeatMapStage[] = [{ stage: 4, complete: false, cells: [makeCell({ answered: true }), makeCell({ inputId: "b" })] }];

  it("shows '-' for a started stream until the trunk is fully awarded", () => {
    const grouped = aquaticsWithSwimmer(makeMemberRow({ trunkFullyAwarded: false, stages: startedStreamStages }));

    const [row] = buildOverallProgressRows(grouped, [{ memberId: "m1", displayName: "Alex", patrolName: null }]);

    expect(row.cells[1]).toEqual({ stage: "-", nextStageProgress: null });
  });

  // A member with the trunk awarded showed the trunk stage in every stream of that skill.
  it("shows '-' for an unstarted stream even once the trunk is fully awarded", () => {
    const grouped = aquaticsWithSwimmer(makeMemberRow({ trunkFullyAwarded: true, stages: [{ stage: 4, complete: false, cells: [makeCell()] }] }));

    const [row] = buildOverallProgressRows(grouped, [{ memberId: "m1", displayName: "Alex", patrolName: null }]);

    expect(row.cells).toEqual([
      { stage: "3", nextStageProgress: null },
      { stage: "-", nextStageProgress: null },
    ]);
  });

  it("shows the heat map's stream value once the stream is started", () => {
    const grouped = aquaticsWithSwimmer(makeMemberRow({ trunkFullyAwarded: true, stages: startedStreamStages }));

    const [row] = buildOverallProgressRows(grouped, [{ memberId: "m1", displayName: "Alex", patrolName: null }]);

    expect(row.cells[1]).toEqual({ stage: "3", nextStageProgress: "01" });
  });

  it("follows the given member order and leaves out members not given", () => {
    const grouped = { bushcraft: makeSkill([makeSection([makeMemberRow({ memberId: "a" }), makeMemberRow({ memberId: "b" }), makeMemberRow({ memberId: "c" })])]) };

    const rows = buildOverallProgressRows(grouped, [
      { memberId: "c", displayName: "C", patrolName: null },
      { memberId: "a", displayName: "A", patrolName: null },
    ]);

    expect(rows.map((r) => r.memberId)).toEqual(["c", "a"]);
  });
});

describe("nextColumnSort", () => {
  it("cycles highest first, then lowest first, then cleared", () => {
    const first = nextColumnSort(null, "camping::");
    const second = nextColumnSort(first, "camping::");
    const third = nextColumnSort(second, "camping::");

    expect([first, second, third]).toEqual([{ key: "camping::", descending: true }, { key: "camping::", descending: false }, null]);
  });

  it("starts highest first when switching to another column", () => {
    expect(nextColumnSort({ key: "camping::", descending: false }, "aquatics::")).toEqual({ key: "aquatics::", descending: true });
  });
});

describe("sortOverallProgressRows", () => {
  const columns = [{ key: "camping::", skill: "camping", stream: null }];

  function makeRow(memberId: string, stage: string, nextStageProgress: string | null = null) {
    return { memberId, displayName: memberId, patrolName: null, cells: [{ stage, nextStageProgress }] };
  }

  const rows = [makeRow("none", "-"), makeRow("two", "2"), makeRow("twoTicks", "2", "03"), makeRow("five", "5"), makeRow("alsoTwo", "2")];

  it("sorts highest stage first, using next-stage ticks within a stage, with '-' last", () => {
    const sorted = sortOverallProgressRows(rows, columns, { key: "camping::", descending: true });

    expect(sorted.map((r) => r.memberId)).toEqual(["five", "twoTicks", "two", "alsoTwo", "none"]);
  });

  it("keeps '-' last when sorting lowest first", () => {
    const sorted = sortOverallProgressRows(rows, columns, { key: "camping::", descending: false });

    expect(sorted.map((r) => r.memberId)).toEqual(["two", "alsoTwo", "twoTicks", "five", "none"]);
  });

  it("leaves rows in the given order when there is no sort or the column no longer exists", () => {
    expect(sortOverallProgressRows(rows, columns, null)).toBe(rows);
    expect(sortOverallProgressRows(rows, columns, { key: "gone::", descending: true })).toBe(rows);
  });
});

describe("hideNotStartedColumns", () => {
  const columns = [
    { key: "camping::", skill: "camping", stream: null },
    { key: "aquatics::", skill: "aquatics", stream: null },
    { key: "aquatics::swimming", skill: "aquatics", stream: "swimming" },
  ];
  const dash = { stage: "-", nextStageProgress: null };

  function makeRow(memberId: string, cells: Array<{ stage: string; nextStageProgress: string | null }>) {
    return { memberId, displayName: memberId, patrolName: null, cells };
  }

  it("drops columns where every listed member shows '-', and the matching cells", () => {
    const rows = [makeRow("a", [{ stage: "2", nextStageProgress: null }, dash, dash]), makeRow("b", [dash, dash, { stage: "4", nextStageProgress: "01" }])];

    const view = hideNotStartedColumns(columns, rows);

    expect(view.columns.map((c) => c.key)).toEqual(["camping::", "aquatics::swimming"]);
    expect(view.rows.map((r) => r.cells.map((c) => c.stage))).toEqual([
      ["2", "-"],
      ["-", "4"],
    ]);
  });

  it("keeps every column when nobody is listed", () => {
    expect(hideNotStartedColumns(columns, []).columns).toEqual(columns);
  });
});

describe("collapsed streams", () => {
  const member = [{ memberId: "m1", displayName: "Alex", patrolName: null }];

  function awardedStage(stage: number, date: string) {
    return { stage, complete: true, cells: [makeCell({ awarded: true, answered: true, date, section: "scout" })] };
  }

  function bushcraft(trunk: SectionMemberRow, pioneering: SectionMemberRow, survival: SectionMemberRow) {
    return makeSkill([
      makeSection([trunk], { skill: "bushcraft", trunkStageCount: 3 }),
      makeSection([pioneering], { skill: "bushcraft", stream: "pioneering", trunkStageCount: 3 }),
      makeSection([survival], { skill: "bushcraft", stream: "survival", trunkStageCount: 3 }),
    ]);
  }

  it("has one column per skill, keyed like its trunk column so a trunk sort carries over", () => {
    const grouped = { bushcraft: bushcraft(makeMemberRow(), makeMemberRow(), makeMemberRow()), camping: makeSkill([makeSection([], { skill: "camping" })]) };

    expect(buildCollapsedOverallProgressColumns(grouped)).toEqual([
      { key: "bushcraft::", skill: "bushcraft", stream: null },
      { key: "camping::", skill: "camping", stream: null },
    ]);
  });

  it("shows the highest whole stage awarded across the trunk and every stream, without next-stage ticks", () => {
    const grouped = {
      bushcraft: bushcraft(
        makeMemberRow({ highestStage: 3, stages: [awardedStage(3, "2025-02-02")] }),
        makeMemberRow({ highestStage: 5, stages: [awardedStage(5, "2026-03-12"), { stage: 6, complete: false, cells: [makeCell({ answered: true }), makeCell({ inputId: "b" })] }] }),
        makeMemberRow({ highestStage: 4, stages: [awardedStage(4, "2026-01-20")] }),
      ),
    };

    const [row] = buildCollapsedOverallProgressRows(grouped, member);

    expect(row.cells).toEqual([
      {
        stage: "5",
        nextStageProgress: null,
        awards: [
          { stream: "bushcraft", branch: "bushcraft", stage: 3, section: "scout", date: "2025-02-02" },
          { stream: "bushcraft", branch: "pioneering", stage: 5, section: "scout", date: "2026-03-12" },
          { stream: "bushcraft", branch: "survival", stage: 4, section: "scout", date: "2026-01-20" },
        ],
      },
    ]);
  });

  it("shows '-' when nothing in the skill is awarded, even if a stage is in progress", () => {
    const inProgress = makeMemberRow({ stages: [{ stage: 1, complete: false, cells: [makeCell({ answered: true })] }] });
    const grouped = { bushcraft: bushcraft(inProgress, makeMemberRow(), makeMemberRow()) };

    expect(buildCollapsedOverallProgressRows(grouped, member)[0].cells).toEqual([{ stage: "-", nextStageProgress: null }]);
  });

  it("never merges separate skills", () => {
    const grouped = {
      bushcraft: bushcraft(makeMemberRow({ highestStage: 2, stages: [awardedStage(2, "2025-01-01")] }), makeMemberRow(), makeMemberRow()),
      camping: makeSkill([makeSection([makeMemberRow({ highestStage: 4, stages: [awardedStage(4, "2025-01-01")] })], { skill: "camping" })]),
    };

    expect(buildCollapsedOverallProgressRows(grouped, member)[0].cells.map((c) => c.stage)).toEqual(["2", "4"]);
  });

  it("shows a stream sort as a sort on its skill", () => {
    expect(collapsedColumnSort({ key: "bushcraft::pioneering", descending: false })).toEqual({ key: "bushcraft::", descending: false });
    expect(collapsedColumnSort({ key: "camping::", descending: true })).toEqual({ key: "camping::", descending: true });
    expect(collapsedColumnSort(null)).toBeNull();
  });
});
