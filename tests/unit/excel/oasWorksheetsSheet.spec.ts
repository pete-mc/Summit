import { buildWorksheetSheet, worksheetCell, worksheetSheetName } from "@/excel/sheets/oasWorksheets";
import { buildOasTableSheet } from "@/excel/sheets/oasTable";
import { EXCEL_COLOURS, HEADER_BLOCK_ROWS, workbookToBlob } from "@/excel/summitExcel";
import type { WorksheetPage } from "@/pages/OasProgressVue/services/buildWorksheetPages";
import type { OASTableRow } from "@/pages/OasProgressVue/components/OASProgressTableVue";

const HEADER = { title: "OAS Progress - Worksheets", subtitle: "Sample Group · Sample Unit", metaLine: "Skill: Bushcraft" };

type AnyCell = Record<string, unknown> | null;
const value = (cell: unknown) => (cell as AnyCell)?.value ?? null;

function page(): WorksheetPage {
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

describe("worksheetCell", () => {
  it("writes dates as UTC-midnight Excel dates, awarded in the awarded fill, and n/a in grey", () => {
    const awarded = worksheetCell({ date: "2026-03-04", answered: true, awarded: true }) as Record<string, unknown>;
    expect(awarded.value).toEqual(new Date(Date.UTC(2026, 2, 4)));
    expect(awarded.type).toBe(Date);
    expect(awarded.backgroundColor).toBe(EXCEL_COLOURS.allMet);

    const na = worksheetCell({ date: null, answered: false, awarded: false, notApplicable: true }) as Record<string, unknown>;
    expect(na.value).toBe("n/a");
    expect(na.backgroundColor).toBe(EXCEL_COLOURS.mutedRow);

    expect(value(worksheetCell({ date: null, answered: false, awarded: false }))).toBe("");
    expect(value(worksheetCell({ date: "sometime", answered: true, awarded: false }))).toBe("sometime");
  });
});

describe("buildWorksheetSheet", () => {
  const tableRows = (sheet: ReturnType<typeof buildWorksheetSheet>) => sheet.rows.slice(HEADER_BLOCK_ROWS + 1);

  it("names each tab by stage, which is unique within one Skill - Stream", () => {
    expect(worksheetSheetName(page())).toBe("Stage 2");
  });

  it("members as columns: the group band spans its rows, then the I-statement, then one column per member", () => {
    const sheet = buildWorksheetSheet({ page: page(), membersAsRows: false, breakByPatrol: false, header: HEADER, logo: null });
    const [headerRow, first, second] = tableRows(sheet);

    expect(value(sheet.rows[HEADER_BLOCK_ROWS][0])).toBe("Stage 2 - Bushcraft");
    expect(headerRow.map(value)).toEqual(["Group", "I-Statement", "Alex Example", "Blake Sample"]);
    expect(first[0]).toMatchObject({ value: "Plan", rowSpan: 2 });
    expect(second[0]).toBeNull();
    expect(sheet.options.columns).toHaveLength(4);
    expect(sheet.options.stickyColumnsCount).toBe(2);
  });

  it("members as columns with break by patrol adds a patrol row above the names", () => {
    const sheet = buildWorksheetSheet({ page: page(), membersAsRows: false, breakByPatrol: true, header: HEADER, logo: null });
    expect(tableRows(sheet)[0].map(value)).toEqual(["", "", "Possum", "Wombat"]);
  });

  it("members as rows: group spans over the I-statements, then one row per member under its patrol", () => {
    const sheet = buildWorksheetSheet({ page: page(), membersAsRows: true, breakByPatrol: true, header: HEADER, logo: null });
    const [spans, statements, possum, alex, wombat, blake] = tableRows(sheet);

    expect(spans[1]).toMatchObject({ value: "Plan", columnSpan: 2 });
    expect(statements.map(value)).toEqual(["Member", "I can plan a walk.", "I can pack a bag."]);
    expect(value(possum[0])).toBe("Possum");
    expect(value(alex[0])).toBe("Alex Example");
    expect(value(wombat[0])).toBe("Wombat");
    expect(value(blake[2])).toEqual(new Date(Date.UTC(2026, 4, 6)));
  });

  it("writes a workbook with one tab per sheet", async () => {
    const blob = await workbookToBlob([
      buildWorksheetSheet({ page: page(), membersAsRows: false, breakByPatrol: true, header: HEADER, logo: null }),
      buildWorksheetSheet({ page: { ...page(), stage: 3 }, membersAsRows: true, breakByPatrol: false, header: HEADER, logo: null }),
    ]);
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe("buildOasTableSheet", () => {
  it("writes the Table columns with Yes/No flags and a real date", () => {
    const row = {
      memberName: "Alex Example",
      skillStream: "Bushcraft - Pioneering",
      stage: 4,
      inputGroup: "Do",
      iStatement: "I can lash a frame.",
      answered: true,
      awarded: false,
      date: "2026-07-08",
    } as unknown as OASTableRow;
    const sheet = buildOasTableSheet({ rows: [row], header: HEADER, logo: null });
    const [headerRow, dataRow] = sheet.rows.slice(HEADER_BLOCK_ROWS);

    expect(headerRow.map(value)).toEqual(["Member", "Skill", "Stage", "Group", "I-Statement", "Answered", "Awarded", "Date"]);
    expect(dataRow.map(value)).toEqual(["Alex Example", "Bushcraft - Pioneering", 4, "Do", "I can lash a frame.", "Yes", "No", new Date(Date.UTC(2026, 6, 8))]);
  });
});
