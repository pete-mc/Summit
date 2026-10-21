import { unzipSync, strFromU8 } from "fflate";
import { buildOverallProgressSheet, stageText, type OverallProgressSheetInput } from "@/excel/sheets/overallProgress";
import { buildPeakAwardSummarySheet } from "@/excel/sheets/peakAwardSummary";
import { HEADER_BLOCK_ROWS, workbookToBlob } from "@/excel/summitExcel";
import { PEAK_AWARD_REQUIREMENTS } from "@/pages/OasProgression/data/peakAwardRequirements";
import { TerrainAchievementsSection } from "@/shared";

const HEADER = { title: "OAS Progression - Summary - Overall", subtitle: "Sample Group · Sample Unit", metaLine: "Generated: 21/10/2026" };

function input(overrides: Partial<OverallProgressSheetInput> = {}): OverallProgressSheetInput {
  return {
    headers: [
      { skillLabel: "Camping", streamLabel: null },
      { skillLabel: "Aquatics", streamLabel: "Swimming" },
    ],
    rows: [
      {
        memberId: "m1",
        displayName: "Alex Example",
        cells: [
          { stage: "3", nextStageProgress: "10" },
          { stage: "-", nextStageProgress: null },
        ],
      },
      {
        memberId: "m2",
        displayName: "Blake Sample",
        cells: [
          { stage: "5", nextStageProgress: null },
          { stage: "4", nextStageProgress: "02" },
        ],
      },
    ],
    header: HEADER,
    logo: null,
    ...overrides,
  };
}

async function unzip(blob: Blob): Promise<Record<string, Uint8Array>> {
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
  return unzipSync(new Uint8Array(bytes));
}

describe("stageText", () => {
  it("joins the stage and next-stage ticks like the screen", () => {
    expect(stageText({ stage: "3", nextStageProgress: "04" })).toBe("3.04");
    expect(stageText({ stage: "5", nextStageProgress: null })).toBe("5");
    expect(stageText({ stage: "-", nextStageProgress: null })).toBe("-");
  });
});

describe("buildOverallProgressSheet", () => {
  it("puts the table header right after the title block, with rotated two-line labels", () => {
    const { rows } = buildOverallProgressSheet(input());
    const tableHeader = rows[HEADER_BLOCK_ROWS];

    expect(tableHeader[0]).toMatchObject({ value: "Member", fontWeight: "bold" });
    expect(tableHeader[1]).toMatchObject({ value: "Camping", textRotation: 90 });
    expect(tableHeader[2]).toMatchObject({ value: "Aquatics\nSwimming", textRotation: 90, wrap: true });
  });

  // As numbers, 3.10 (ten ticks) would show as 3.1.
  it("writes stage values as text exactly as shown on screen, in member order", () => {
    const { rows } = buildOverallProgressSheet(input());
    const body = rows.slice(HEADER_BLOCK_ROWS + 1);

    expect(body.map((r) => r.map((c) => c && (c as { value: unknown }).value))).toEqual([
      ["Alex Example", "3.10", "-"],
      ["Blake Sample", "5", "4.02"],
    ]);
    body.forEach((r) => r.slice(1).forEach((c) => expect(c).toMatchObject({ type: String })));
  });

  it("names the tab 'Overall', freezes the header and Member column, and gives every stage column one width", () => {
    const { options } = buildOverallProgressSheet(input());

    expect(options.sheet).toBe("Overall");
    expect(options.stickyRowsCount).toBe(HEADER_BLOCK_ROWS + 1);
    expect(options.stickyColumnsCount).toBe(1);
    const stageWidths = (options.columns ?? []).slice(1).map((c) => c.width);
    expect(stageWidths).toHaveLength(2);
    expect(new Set(stageWidths).size).toBe(1);
  });
});

describe("workbookToBlob with both Summary sheets", () => {
  it("writes one file with a tab per sheet, in the given order", async () => {
    const peakAward = buildPeakAwardSummarySheet({
      rows: [],
      requirement: PEAK_AWARD_REQUIREMENTS[TerrainAchievementsSection.Scout],
      nameFormat: "full",
      specialConditionText: "",
      header: { ...HEADER, title: "OAS Progression - Summary - Towards Peak Award" },
      logo: null,
    });

    const files = await unzip(await workbookToBlob([peakAward, buildOverallProgressSheet(input())]));
    const workbook = strFromU8(files["xl/workbook.xml"]);

    expect(workbook.indexOf('name="Towards Peak Award"')).toBeGreaterThan(-1);
    expect(workbook.indexOf('name="Overall"')).toBeGreaterThan(workbook.indexOf('name="Towards Peak Award"'));
    expect(files["xl/worksheets/sheet2.xml"]).toBeDefined();
  });
});
