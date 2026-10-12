import { unzipSync, strFromU8 } from "fflate";

/**
 * fflate compresses any file of 160 KB or more in a Web Worker, which jsdom doesn't have. The large-unit test
 * below crosses that line on purpose, so zipping is made synchronous here (same output). In the
 * browser the worker path is used; Terrain sends no Content-Security-Policy, so nothing blocks it
 * (checked 2026-10-12, .claude/Excel/PLAN_STAGE_2.md).
 */
jest.mock("fflate", () => {
  const actual = jest.requireActual("fflate");
  return { ...actual, zip: (data: Record<string, Uint8Array>, cb: (err: Error | null, out: Uint8Array | null) => void) => cb(null, actual.zipSync(data)) };
});

import { buildSkillHeatmapSheet, stageCells, stageWidths } from "@/excel/sheets/skillHeatmap";
import { EXCEL_COLOURS, HEADER_BLOCK_ROWS, workbookToBlob } from "@/excel/summitExcel";
import type { HeatMapExportView, MemberRowView, SquareState, StageCellView } from "@/pages/OasProgressionVue/components/OASHeatMapVue";

function squares(...states: SquareState[]): StageCellView {
  return { kind: "squares", squares: states.map((state, i) => ({ inputId: `i${i}`, state, stateClass: `oas-heatmap-square-${state}`, groupClass: "", title: "" })) };
}
const BAR_DONE: StageCellView = { kind: "bar-complete" };
const BAR_TODO: StageCellView = { kind: "bar-unstarted" };
const EMPTY: StageCellView = { kind: "empty" };

function member(name: string, stage: string, next: string | null, cells: StageCellView[]): { label: string; view: MemberRowView } {
  return { label: name, view: { memberId: name, displayName: name, stageDisplay: stage, nextStageProgress: next, cells } };
}

/** Two stages: stage 1 has at most 3 squares, stage 2 only bars (so it gets the minimum width). Fake names. */
function view(overrides: Partial<HeatMapExportView> = {}): HeatMapExportView {
  return {
    firstColumnHeader: "Member",
    stages: [1, 2],
    sections: [
      {
        title: "Bushcraft",
        patrolName: null,
        groups: [
          {
            patrolName: "",
            rows: [member("Alex Example", "1", "02", [BAR_DONE, BAR_TODO]), member("Blake Sample", "-", null, [squares("answered", "unanswered", "hidden"), EMPTY])],
          },
        ],
      },
    ],
    ...overrides,
  };
}

const HEADER = { title: "OAS Progression - Heatmap", subtitle: "Sample Group · Sample Unit", metaLine: "Generated: 12/10/2026" };
const fills = (cells: unknown[]) => cells.map((c) => (c ? ((c as { backgroundColor?: string }).backgroundColor ?? "none") : null));

const firstValue = (r: unknown[]) => (r[0] ? (r[0] as { value: string }).value : null);

describe("stageWidths", () => {
  it("is the most squares per stage, at least 2", () => {
    expect(stageWidths(view())).toEqual([3, 2]);
  });
});

describe("stageCells", () => {
  it("bars fill the whole stage width", () => {
    expect(fills(stageCells(BAR_DONE, 4))).toEqual(Array(4).fill(EXCEL_COLOURS.allMet));
    expect(fills(stageCells(BAR_TODO, 4))).toEqual(Array(4).fill(EXCEL_COLOURS.notMet));
  });

  it("outlines the not-started bar in grey, on its outside edge only", () => {
    const cells = stageCells(BAR_TODO, 3) as Array<Record<string, unknown>>;
    expect(cells[0]).toMatchObject({ leftBorderStyle: "thin", leftBorderColor: EXCEL_COLOURS.headerBorder });
    expect(cells[1].leftBorderStyle).toBeUndefined();
    expect(cells[1].rightBorderStyle).toBeUndefined();
    expect(cells[2]).toMatchObject({ rightBorderStyle: "thin", rightBorderColor: EXCEL_COLOURS.headerBorder });
    expect(cells.every((c) => c.topBorderStyle === "thin" && c.bottomBorderStyle === "thin")).toBe(true);
  });

  it("outlines the complete bar in white like the squares' borders, with no lines inside it", () => {
    const cells = stageCells(BAR_DONE, 3) as Array<Record<string, unknown>>;
    expect(cells.every((c) => c.topBorderColor === "#ffffff" && c.bottomBorderColor === "#ffffff")).toBe(true);
    expect(cells[0]).toMatchObject({ leftBorderStyle: "thin", leftBorderColor: "#ffffff" });
    expect(cells[2]).toMatchObject({ rightBorderStyle: "thin", rightBorderColor: "#ffffff" });
    expect(cells[1].leftBorderStyle).toBeUndefined();
    expect(cells[1].rightBorderStyle).toBeUndefined();
  });

  it("colours squares by state, leaves hidden ones blank and pads to the width", () => {
    expect(fills(stageCells(squares("awarded", "answered", "hidden", "unanswered"), 6))).toEqual([EXCEL_COLOURS.allMet, EXCEL_COLOURS.met, null, EXCEL_COLOURS.notMet, null, null]);
  });

  it("an empty stage is all blank", () => {
    expect(stageCells(EMPTY, 3)).toEqual([null, null, null]);
    expect(stageCells(undefined, 2)).toEqual([null, null]);
  });
});

describe("buildSkillHeatmapSheet", () => {
  // Member, Stage, Next + (spacer + 3) + (spacer + 2) = 10 columns.
  const WIDTH = 10;

  it("gives every row the same width, matching the column widths", () => {
    const sheet = buildSkillHeatmapSheet({ view: view(), header: HEADER, logo: null });
    sheet.rows.slice(HEADER_BLOCK_ROWS).forEach((r) => expect(r.length).toBe(WIDTH));
    expect(sheet.options.columns).toHaveLength(WIDTH);
  });

  it("merges each stage number over its cells", () => {
    const header = buildSkillHeatmapSheet({ view: view(), header: HEADER, logo: null }).rows[HEADER_BLOCK_ROWS];
    expect(header[0]).toMatchObject({ value: "Member" });
    expect(header[1]).toMatchObject({ value: "Stage" });
    expect(header[2]).toMatchObject({ value: "Next" });
    expect(header[4]).toMatchObject({ value: "1", columnSpan: 3 });
    expect(header[8]).toMatchObject({ value: "2", columnSpan: 2 });
  });

  it("writes Stage and Next as numbers, and leaves both empty for '-'", () => {
    const rows = buildSkillHeatmapSheet({ view: view(), header: HEADER, logo: null }).rows;
    const alex = rows[HEADER_BLOCK_ROWS + 2];
    const blake = rows[HEADER_BLOCK_ROWS + 3];
    expect(alex[1]).toMatchObject({ value: 1, type: Number });
    expect(alex[2]).toMatchObject({ value: 2, type: Number });
    expect(blake[1]).toBeNull();
    expect(blake[2]).toBeNull();
  });

  it("starts each section with a full-width grey title row", () => {
    const title = buildSkillHeatmapSheet({ view: view(), header: HEADER, logo: null }).rows[HEADER_BLOCK_ROWS + 1];
    expect(title[0]).toMatchObject({ value: "Bushcraft", columnSpan: WIDTH, fontWeight: "bold", backgroundColor: EXCEL_COLOURS.sectionRow });
  });

  it("adds a lighter patrol row for each patrol group (Break by patrol)", () => {
    const v = view();
    v.sections[0].groups = [
      { patrolName: "Eagles", rows: [v.sections[0].groups[0].rows[0]] },
      { patrolName: "Wolves", rows: [v.sections[0].groups[0].rows[1]] },
    ];
    const rows = buildSkillHeatmapSheet({ view: v, header: HEADER, logo: null }).rows.slice(HEADER_BLOCK_ROWS + 1);
    // A blank row before the second patrol, none before the first.
    expect(rows.map(firstValue)).toEqual(["Bushcraft", "Eagles", "Alex Example", null, "Wolves", "Blake Sample"]);
    expect(rows[1][0]).toMatchObject({ backgroundColor: EXCEL_COLOURS.patrolRow, columnSpan: WIDTH });
  });

  it("puts a blank row before every section after the first, and none at the top", () => {
    const v = view();
    v.sections.push({ ...v.sections[0], title: "Camping" }, { ...v.sections[0], title: "Paddling" });
    const rows = buildSkillHeatmapSheet({ view: v, header: HEADER, logo: null }).rows.slice(HEADER_BLOCK_ROWS + 1);
    expect(rows.map(firstValue)).toEqual(["Bushcraft", "Alex Example", "Blake Sample", null, "Camping", "Alex Example", "Blake Sample", null, "Paddling", "Alex Example", "Blake Sample"]);
    // Blank rows are full width, like every other row.
    expect(rows[3]).toEqual(Array(WIDTH).fill(null));
  });

  it("member layout: Skill column and the patrol after the member's name", () => {
    const v = view({ firstColumnHeader: "Skill" });
    v.sections[0] = { ...v.sections[0], title: "Alex Example", patrolName: "Eagles" };
    const rows = buildSkillHeatmapSheet({ view: v, header: HEADER, logo: null }).rows;
    expect(rows[HEADER_BLOCK_ROWS][0]).toMatchObject({ value: "Skill" });
    expect(rows[HEADER_BLOCK_ROWS + 1][0]).toMatchObject({ value: "Alex Example — Eagles" });
  });

  it("freezes the title block, the header row and the first column", () => {
    const { options } = buildSkillHeatmapSheet({ view: view(), header: HEADER, logo: null });
    expect(options.stickyRowsCount).toBe(HEADER_BLOCK_ROWS + 1);
    expect(options.stickyColumnsCount).toBe(1);
  });

  it("writes a large unit (60 members × 15 sections × 9 stages) and reports its size", async () => {
    const stages = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const states: SquareState[] = ["awarded", "answered", "unanswered"];
    const rowCells = (m: number) => stages.map((s) => (s <= 2 ? BAR_DONE : s >= 8 ? BAR_TODO : squares(...Array.from({ length: 10 }, (_, i) => states[(m + i + s) % 3]))));
    const big: HeatMapExportView = {
      firstColumnHeader: "Member",
      stages,
      sections: Array.from({ length: 15 }, (_, s) => ({
        title: `Skill ${s + 1}`,
        patrolName: null,
        groups: [{ patrolName: "", rows: Array.from({ length: 60 }, (_, m) => member(`Member ${m + 1}`, "3", "04", rowCells(m))) }],
      })),
    };
    const blob = await workbookToBlob(buildSkillHeatmapSheet({ view: big, header: HEADER, logo: null }));
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const sheetXml = unzipSync(new Uint8Array(bytes))["xl/worksheets/sheet1.xml"];

    console.log(`large heatmap: sheet XML ${Math.round(sheetXml.length / 1024)} KB, .xlsx ${Math.round(bytes.byteLength / 1024)} KB`);
    expect(strFromU8(sheetXml)).toContain('<pane ySplit="5" xSplit="1" topLeftCell="B6"');
  });
});
