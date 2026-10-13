import { unzipSync, strFromU8 } from "fflate";
import { boxCells, buildPeakAwardSummarySheet, type PeakAwardSummarySheetInput } from "@/excel/sheets/peakAwardSummary";
import { EXCEL_COLOURS, HEADER_BLOCK_ROWS, workbookToBlob } from "@/excel/summitExcel";
import { PEAK_AWARD_REQUIREMENTS } from "@/pages/OasProgression/data/peakAwardRequirements";
import { TerrainAchievementsSection } from "@/shared";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";

const VENTURER = PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Venturer]; // 5 core, 12 progressions, special 4
const SCOUT = PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Scout]; // 5 core, 10 progressions, no special

function boxes(count: number, met: number): PeakAwardBox[] {
  return Array.from({ length: count }, (_, i) => ({ met: i < met, award: null }));
}

/** A fake member (no real names). `core` = boxes met per core skill. */
function memberRow(id: string, first: string, last: string, core: [number, number, number], progressions: number, special: number | null, requirement = VENTURER): PeakAwardMemberRow {
  const coreSkills = (["bushcraft", "bushwalking", "camping"] as const).map((skill, i) => ({
    skill,
    requiredStage: requirement.coreSkillStage,
    highestAwardedStage: core[i],
    boxes: boxes(requirement.coreSkillStage, core[i]),
    met: core[i] >= requirement.coreSkillStage,
  }));
  const specialRow =
    special === null || !requirement.special
      ? null
      : { count: special, required: requirement.special.minCount, minStage: requirement.special.minStage, boxes: boxes(requirement.special.minCount, special), met: special >= requirement.special.minCount };
  const all = coreSkills.flatMap((c) => c.boxes).concat(boxes(requirement.totalProgressions, progressions), specialRow ? specialRow.boxes : []);
  const score = all.filter((b) => b.met).length;
  return {
    memberId: id,
    memberName: `${first} ${last}`,
    firstName: first,
    lastName: last,
    patrolName: null,
    coreSkills,
    totalProgressions: progressions,
    requiredProgressions: requirement.totalProgressions,
    progressionBoxes: boxes(requirement.totalProgressions, progressions),
    special: specialRow,
    progressScore: score,
    progressTotal: all.length,
    progressPercent: Math.trunc((score / all.length) * 100),
  };
}

const HEADER = { title: "OAS Progression - Summary for Peak Award", subtitle: "Sample Group · Sample Unit", metaLine: "Generated: 12/10/2026" };

function input(overrides: Partial<PeakAwardSummarySheetInput> = {}): PeakAwardSummarySheetInput {
  return {
    rows: [memberRow("m1", "Alex", "Example", [5, 5, 5], 12, 4), memberRow("m2", "Blake", "Sample", [5, 3, 0], 9, 2)],
    requirement: VENTURER,
    nameFormat: "full",
    specialConditionText: "4 above Stage 3",
    header: HEADER,
    logo: null,
    ...overrides,
  };
}

// Venturer: Member, Progress, % + 3 skills of (spacer + 5) + spacer + 12 progressions + text +
// spacer + 4 special + text = 41.
const VENTURER_COLUMNS = 3 + 3 * 6 + 14 + 6;
const FIRST_DATA_ROW = HEADER_BLOCK_ROWS + 2;

describe("boxCells", () => {
  it("colours met yellow and unmet grey", () => {
    const cells = boxCells(boxes(3, 1)) as Array<{ backgroundColor: string }>;
    expect(cells.map((c) => c.backgroundColor)).toEqual([EXCEL_COLOURS.met, EXCEL_COLOURS.notMet, EXCEL_COLOURS.notMet]);
  });

  it("draws a fully met group as one green bar: white outline, no borders inside", () => {
    const cells = boxCells(boxes(3, 3)) as Array<Record<string, unknown>>;
    expect(cells).toHaveLength(3);
    expect(cells.every((c) => c.backgroundColor === EXCEL_COLOURS.allMet && !c.columnSpan && !c.borderColor)).toBe(true);
    expect(cells.every((c) => c.topBorderColor === EXCEL_COLOURS.squareBorder && c.bottomBorderColor === EXCEL_COLOURS.squareBorder)).toBe(true);
    expect(cells.map((c) => !!c.leftBorderStyle)).toEqual([true, false, false]);
    expect(cells.map((c) => !!c.rightBorderStyle)).toEqual([false, false, true]);
  });
});

describe("buildPeakAwardSummarySheet", () => {
  it("gives every table row the same width, matching the column widths", () => {
    const sheet = buildPeakAwardSummarySheet(input());
    const tableRows = sheet.rows.slice(HEADER_BLOCK_ROWS);
    expect(tableRows.length).toBe(4);
    tableRows.forEach((r) => expect(r.length).toBe(VENTURER_COLUMNS));
    expect(sheet.options.columns).toHaveLength(VENTURER_COLUMNS);
  });

  it("writes Member, 'X of Y' progress and a sortable percent", () => {
    const row = buildPeakAwardSummarySheet(input()).rows[FIRST_DATA_ROW + 1];
    expect(row[0]).toMatchObject({ value: "Blake Sample" });
    // 5+3+0 core + 9 progressions + 2 special = 19 of 31, 61% truncated like the screen.
    expect(row[1]).toMatchObject({ value: "19 of 31" });
    expect(row[2]).toMatchObject({ value: 0.61, type: Number, format: "0%" });
  });

  it("puts the Progressions and Special 'X of Y' text after their boxes", () => {
    const row = buildPeakAwardSummarySheet(input()).rows[FIRST_DATA_ROW + 1];
    expect(row[34]).toMatchObject({ value: "9 of 12" });
    expect(row[VENTURER_COLUMNS - 1]).toMatchObject({ value: "2 of 4" });
  });

  it("follows the screen's name format", () => {
    const sheet = buildPeakAwardSummarySheet(input({ nameFormat: "first" }));
    expect(sheet.rows[FIRST_DATA_ROW][0]).toMatchObject({ value: "Alex" });
  });

  it("merges the header like the screen", () => {
    const [top, bottom] = buildPeakAwardSummarySheet(input()).rows.slice(HEADER_BLOCK_ROWS, FIRST_DATA_ROW);
    expect(top[0]).toMatchObject({ value: "Member", rowSpan: 2 });
    // One Progress header over "X of Y" and %, as on screen.
    expect(top[1]).toMatchObject({ value: "Progress", rowSpan: 2, columnSpan: 2 });
    expect(top[2]).toBeNull();
    // Core Skills spans the three skills and the two spacers between them.
    expect(top[4]).toMatchObject({ value: "Core Skills", columnSpan: 17 });
    expect(top[22]).toMatchObject({ value: "Progressions", rowSpan: 2, columnSpan: 13 });
    expect(top[36]).toMatchObject({ value: "Special", columnSpan: 5 });
    expect(bottom[4]).toMatchObject({ value: "Bushcraft", columnSpan: 5 });
    expect(bottom[10]).toMatchObject({ value: "Bushwalking", columnSpan: 5 });
    expect(bottom[16]).toMatchObject({ value: "Camping", columnSpan: 5 });
    expect(bottom[36]).toMatchObject({ value: "4 above Stage 3", columnSpan: 5 });
  });

  it("puts a narrow blank spacer column before each group, as on the Heatmap sheet", () => {
    const sheet = buildPeakAwardSummarySheet(input());
    const spacers = [3, 9, 15, 21, 35];
    const widths = sheet.options.columns as Array<{ width: number }>;
    spacers.forEach((i) => {
      expect(widths[i].width).toBe(1);
      expect(sheet.rows[FIRST_DATA_ROW][i]).toBeNull();
    });
    const [top, bottom] = sheet.rows.slice(HEADER_BLOCK_ROWS, FIRST_DATA_ROW);
    [3, 21, 35].forEach((i) => expect(top[i]).toMatchObject({ value: "", rowSpan: 2 }));
    [9, 15].forEach((i) => expect(bottom[i]).toMatchObject({ value: "" }));
  });

  it("draws a fully met skill as one bar and a part-met one as separate boxes", () => {
    const row = buildPeakAwardSummarySheet(input()).rows[FIRST_DATA_ROW + 1] as Array<Record<string, unknown>>;
    // Blake: Bushcraft 5 of 5 (bar), Bushwalking 3 of 5 (boxes).
    expect(row.slice(4, 9).every((c) => c.backgroundColor === EXCEL_COLOURS.allMet && !c.borderColor)).toBe(true);
    expect(row.slice(10, 15).map((c) => c.backgroundColor)).toEqual([EXCEL_COLOURS.met, EXCEL_COLOURS.met, EXCEL_COLOURS.met, EXCEL_COLOURS.notMet, EXCEL_COLOURS.notMet]);
  });

  it("leaves out the Special columns for a section without one", () => {
    const rows = [memberRow("m1", "Alex", "Example", [5, 2, 0], 4, null, SCOUT)];
    const sheet = buildPeakAwardSummarySheet(input({ rows, requirement: SCOUT, specialConditionText: "" }));
    const width = 3 + 3 * 6 + 12;
    sheet.rows.slice(HEADER_BLOCK_ROWS).forEach((r) => expect(r.length).toBe(width));
    expect(sheet.options.columns).toHaveLength(width);
  });

  it("freezes the title block, the table header and Member", () => {
    const { options } = buildPeakAwardSummarySheet(input());
    expect(options.stickyRowsCount).toBe(HEADER_BLOCK_ROWS + 2);
    expect(options.stickyColumnsCount).toBe(1);
  });

  it("embeds the logo only when there is one", () => {
    expect(buildPeakAwardSummarySheet(input()).options.images).toBeUndefined();
    const logo = { content: new Blob(["x"]), contentType: "image/jpeg", width: 1, height: 1, dpi: 96, anchor: { row: 1, column: 1 } };
    expect(buildPeakAwardSummarySheet(input({ logo })).options.images).toEqual([logo]);
  });

  it("produces a real workbook with the merges and frozen panes", async () => {
    const blob = await workbookToBlob(buildPeakAwardSummarySheet(input()));
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const xml = strFromU8(unzipSync(new Uint8Array(bytes))["xl/worksheets/sheet1.xml"]);
    expect(xml).toContain('<pane ySplit="6" xSplit="1" topLeftCell="B7"');
    ["A5:A6", "B5:C6", "D5:D6", "E5:U5", "E6:I6", "K6:O6", "Q6:U6", "V5:V6", "W5:AI6", "AJ5:AJ6", "AK5:AO5", "AK6:AO6"].forEach((ref) => expect(xml).toContain(`<mergeCell ref="${ref}"/>`));
  });
});
