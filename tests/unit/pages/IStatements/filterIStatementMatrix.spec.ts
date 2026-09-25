import { type IStatementMatrix } from "@/pages/IStatements/services/buildIStatementMatrix";
import { cellLookupKey, filterIStatementMatrix, type IStatementFilters } from "@/pages/IStatements/services/filterIStatementMatrix";

function row(displayText: string, cells: Array<[string, string, number]>) {
  return {
    key: displayText.toLowerCase(),
    displayText,
    variants: new Map([[displayText, 1]]),
    cells: cells.map(([skill, branch, stage]) => ({ skill, branch, stage })),
  };
}

function matrix(): IStatementMatrix {
  return {
    rows: [
      row("Shared", [
        ["camping", "camping", 1],
        ["paddling", "paddling", 2],
      ]),
      row("Camping only", [["camping", "camping", 3]]),
      row("Paddling only", [["paddling", "paddling", 2]]),
    ],
    groups: [
      { skill: "camping", branch: "camping", label: "Camping · Camping", stages: [1, 2, 3] },
      { skill: "paddling", branch: "paddling", label: "Paddling · Paddling", stages: [1, 2] },
    ],
    failedTemplates: 0,
  };
}

function filters(overrides: Partial<IStatementFilters> = {}): IStatementFilters {
  return { skills: ["camping", "paddling"], stageFrom: 1, stageTo: 9, hideEmptyStages: false, hideEmptyGroups: false, hideEmptyRows: false, ...overrides };
}

describe("filterIStatementMatrix", () => {
  it("shows everything by default", () => {
    const result = filterIStatementMatrix(matrix(), filters());
    expect(result.rows).toHaveLength(3);
    expect(result.groups).toHaveLength(2);
  });

  it("removes a deselected skill's groups", () => {
    const result = filterIStatementMatrix(matrix(), filters({ skills: ["camping"] }));
    expect(result.groups.map((g) => g.label)).toEqual(["Camping · Camping"]);
  });

  it("narrows visible stage columns to the selected range", () => {
    const result = filterIStatementMatrix(matrix(), filters({ stageFrom: 2, stageTo: 3 }));
    expect(result.groups[0].visibleStages).toEqual([2, 3]);
    expect(result.groups[1].visibleStages).toEqual([2, 3]);
  });

  it("tolerates an inverted stage range", () => {
    const result = filterIStatementMatrix(matrix(), filters({ stageFrom: 3, stageTo: 1 }));
    expect(result.groups[0].visibleStages).toEqual([1, 2, 3]);
  });

  it("hides rows with no visible cells", () => {
    const result = filterIStatementMatrix(matrix(), filters({ skills: ["paddling"], hideEmptyRows: true }));
    expect(result.rows.map((r) => r.displayText)).toEqual(["Shared", "Paddling only"]);
  });

  it("hides stage columns that have no squares", () => {
    const result = filterIStatementMatrix(matrix(), filters({ hideEmptyStages: true }));
    // Camping has squares at 1 and 3 only; paddling at 2 only.
    expect(result.groups[0].visibleStages).toEqual([1, 3]);
    expect(result.groups[1].visibleStages).toEqual([2]);
  });

  it("hides a group once all its columns are empty", () => {
    const result = filterIStatementMatrix(matrix(), filters({ stageFrom: 3, stageTo: 3, hideEmptyStages: true, hideEmptyGroups: true }));
    expect(result.groups.map((g) => g.label)).toEqual(["Camping · Camping"]);
  });

  it("cascades: hiding a row empties a column, which empties a group", () => {
    // Only "Camping only" occupies camping stage 3. Restrict to camping stage 3 and
    // paddling: hiding empty rows drops the two rows with nothing visible... then the
    // cascade should still keep camping, since "Camping only" survives.
    const source: IStatementMatrix = {
      rows: [row("Paddling only", [["paddling", "paddling", 2]])],
      groups: [
        { skill: "camping", branch: "camping", label: "Camping · Camping", stages: [3] },
        { skill: "paddling", branch: "paddling", label: "Paddling · Paddling", stages: [2] },
      ],
      failedTemplates: 0,
    };

    const result = filterIStatementMatrix(source, filters({ hideEmptyStages: true, hideEmptyGroups: true, hideEmptyRows: true }));

    expect(result.rows.map((r) => r.displayText)).toEqual(["Paddling only"]);
    expect(result.groups.map((g) => g.label)).toEqual(["Paddling · Paddling"]);
  });

  it("guarantees every visible row and column is non-empty when all toggles are on", () => {
    const result = filterIStatementMatrix(matrix(), filters({ skills: ["paddling"], hideEmptyStages: true, hideEmptyGroups: true, hideEmptyRows: true }));

    result.rows.forEach((r) => {
      const visible = r.cells.filter((c) => result.presentCells.has(cellLookupKey(c.skill, c.branch, c.stage)));
      expect(visible.length).toBeGreaterThan(0);
    });
    result.groups.forEach((g) => {
      g.visibleStages.forEach((stage) => {
        expect(result.presentCells.has(cellLookupKey(g.skill, g.branch, stage))).toBe(true);
      });
    });
  });

  it("restores the full grid when toggles are turned back off", () => {
    const all = filterIStatementMatrix(matrix(), filters());
    const toggledOff = filterIStatementMatrix(matrix(), filters({ hideEmptyStages: false, hideEmptyGroups: false, hideEmptyRows: false }));
    expect(toggledOff.rows).toHaveLength(all.rows.length);
    expect(toggledOff.groups).toEqual(all.groups);
  });
});
