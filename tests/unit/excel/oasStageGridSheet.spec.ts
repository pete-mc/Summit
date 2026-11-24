import { buildStageGridSheet, stageGridCell, stageGridSheetName } from "@/excel/sheets/oasStageGrid";
import { buildNextStepsSheet } from "@/excel/sheets/oasNextSteps";
import { EXCEL_COLOURS, HEADER_BLOCK_ROWS, workbookToBlob } from "@/excel/summitExcel";
import type { StageGridPage } from "@/pages/OasProgressVue/services/buildStageGridPages";
import type { NextStepsRow } from "@/pages/OasProgressVue/services/nextStepsRows";

const HEADER = { title: "OAS Progress - Stage Grid", subtitle: "Sample Group · Sample Unit", metaLine: "Skill: Bushcraft" };

type AnyCell = Record<string, unknown> | null;
const value = (cell: unknown) => (cell as AnyCell)?.value ?? null;

function page(): StageGridPage {
  return {
    key: "bushcraft::bushcraft::2",
    skill: "bushcraft",
    stream: "bushcraft",
    stage: 2,
    title: "Stage 2 - Bushcraft",
    members: [
      { memberId: "m1", displayName: "Alex Example", firstName: "Alex", lastName: "Example", patrolName: "Possum" },
      { memberId: "m2", displayName: "Blake Sample", firstName: "Blake", lastName: "Sample", patrolName: "Wombat" },
    ],
    groups: [
      {
        title: "Plan",
        rows: [
          {
            inputId: "p1",
            iStatement: "I can plan a walk.",
            cells: [
              { date: "2026-03-04", answered: true, awarded: true },
              { date: null, answered: false, awarded: false },
            ],
          },
          {
            inputId: "p2",
            iStatement: "I can pack a bag.",
            cells: [
              { date: null, answered: false, awarded: false, notApplicable: true },
              { date: "2026-05-06T00:00:00Z", answered: true, awarded: false },
            ],
          },
        ],
      },
    ],
  };
}

describe("stageGridCell", () => {
  const fill = (cell: Parameters<typeof stageGridCell>[0]) => (stageGridCell(cell) as Record<string, unknown>).backgroundColor;

  it("fills a box like the screen: green awarded, yellow answered, grey not answered, with no date", () => {
    expect(fill({ date: "2026-03-04", answered: true, awarded: true })).toBe(EXCEL_COLOURS.allMet);
    expect(fill({ date: "2026-03-04", answered: true, awarded: false })).toBe(EXCEL_COLOURS.met);
    expect(fill({ date: null, answered: false, awarded: false })).toBe(EXCEL_COLOURS.notMet);
    expect(value(stageGridCell({ date: "2026-03-04", answered: true, awarded: true }))).toBe("");
  });

  it("keeps n/a as grey text", () => {
    const na = stageGridCell({ date: null, answered: false, awarded: false, notApplicable: true }) as Record<string, unknown>;
    expect(na.value).toBe("n/a");
    expect(na.backgroundColor).toBe(EXCEL_COLOURS.mutedRow);
  });
});

describe("buildStageGridSheet", () => {
  const tableRows = (sheet: ReturnType<typeof buildStageGridSheet>) => sheet.rows.slice(HEADER_BLOCK_ROWS + 1);

  it("names each tab by stage, which is unique within one Skill - Stream", () => {
    expect(stageGridSheetName(page())).toBe("Stage 2");
  });

  it("members as columns: the group band spans its rows, then the I-statement, then one column per member", () => {
    const sheet = buildStageGridSheet({ page: page(), membersAsRows: false, breakByPatrol: false, header: HEADER, logo: null });
    const [headerRow, first, second] = tableRows(sheet);

    expect(value(sheet.rows[HEADER_BLOCK_ROWS][0])).toBe("Stage 2 - Bushcraft");
    expect(headerRow.map(value)).toEqual(["Group", "I-Statement", "Alex Example", "Blake Sample"]);
    expect(first[0]).toMatchObject({ value: "Plan", rowSpan: 2 });
    expect(second[0]).toBeNull();
    expect(sheet.options.columns).toHaveLength(4);
    expect(sheet.options.stickyColumnsCount).toBe(2);
  });

  it("members as columns with break by patrol adds a patrol row above the names", () => {
    const sheet = buildStageGridSheet({ page: page(), membersAsRows: false, breakByPatrol: true, header: HEADER, logo: null });
    expect(tableRows(sheet)[0].map(value)).toEqual(["", "", "Possum", "Wombat"]);
  });

  it("members as rows: group spans over the I-statements, then one row per member under its patrol", () => {
    const sheet = buildStageGridSheet({ page: page(), membersAsRows: true, breakByPatrol: true, header: HEADER, logo: null });
    const [spans, statements, possum, alex, wombat, blake] = tableRows(sheet);

    expect(spans[1]).toMatchObject({ value: "Plan", columnSpan: 2 });
    expect(statements.map(value)).toEqual(["Member", "I can plan a walk.", "I can pack a bag."]);
    expect(value(possum[0])).toBe("Possum");
    expect(value(alex[0])).toBe("Alex Example");
    expect(value(wombat[0])).toBe("Wombat");
    expect(blake[2]).toMatchObject({ backgroundColor: EXCEL_COLOURS.met });
  });

  it("writes a workbook with one tab per sheet", async () => {
    const blob = await workbookToBlob([
      buildStageGridSheet({ page: page(), membersAsRows: false, breakByPatrol: true, header: HEADER, logo: null }),
      buildStageGridSheet({ page: { ...page(), stage: 3 }, membersAsRows: true, breakByPatrol: false, header: HEADER, logo: null }),
    ]);
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe("buildNextStepsSheet", () => {
  const row = (inputId: string, inputGroup: string, answered: boolean, date: string | null) => ({ inputId, inputGroup, iStatement: `Statement ${inputId}`, answered, awarded: false, date }) as unknown as NextStepsRow;

  it("matches the screen: Group merged over its rows, an Answered box, the I-Statement and a real date", () => {
    const sheet = buildNextStepsSheet({ rows: [row("a", "Plan", true, "2026-07-08"), row("b", "Plan", false, null), row("c", "Do", false, null)], header: HEADER, logo: null });
    const [headerRow, first, second, third] = sheet.rows.slice(HEADER_BLOCK_ROWS);

    expect(headerRow.map(value)).toEqual(["Group", "Answered", "I-Statement", "Date"]);
    expect(first[0]).toMatchObject({ value: "Plan", rowSpan: 2 });
    expect(second[0]).toBeNull();
    expect(third[0]).toMatchObject({ value: "Do", rowSpan: 1 });
    expect(first[1]).toMatchObject({ value: "", backgroundColor: EXCEL_COLOURS.met });
    expect(second[1]).toMatchObject({ backgroundColor: EXCEL_COLOURS.notMet });
    expect(value(first[2])).toBe("Statement a");
    expect(value(first[3])).toEqual(new Date(Date.UTC(2026, 6, 8)));
    expect(value(second[3])).toBe("");
  });

  it("writes a workbook", async () => {
    const blob = await workbookToBlob([buildNextStepsSheet({ rows: [row("a", "Plan", true, "2026-07-08")], header: HEADER, logo: null })]);
    expect(blob.size).toBeGreaterThan(0);
  });
});
