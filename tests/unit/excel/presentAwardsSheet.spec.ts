import { unzipSync, strFromU8 } from "fflate";
import { buildPresentAwardsSheet, dateCell } from "@/excel/sheets/presentAwards";
import { EXCEL_COLOURS, EXCEL_DATE_FORMAT, HEADER_BLOCK_ROWS, parseDisplayDate, workbookToBlob } from "@/excel/summitExcel";
import type { PresentAwardsExportRow, PresentAwardsExportView } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

const HEADER = { title: "Present Awards", subtitle: "Sample Group · Sample Unit", metaLine: "Generated: 13/10/2026" };

function row(member: string, award: string, dateAwarded: string, presented = ""): PresentAwardsExportRow {
  return { member, type: "OAS", award, dateAwarded, presented };
}

const FLAT: PresentAwardsExportView = {
  grouped: false,
  groups: [{ label: "", rows: [row("Alex Example", "Bushcraft Stage 1", "05/03/2026", "20/03/2026"), row("Blake Sample", "Camping Stage 2", "01/12/2025")] }],
};

const GROUPED: PresentAwardsExportView = {
  grouped: true,
  groups: [
    { label: "Alex Example (1 not presented)", rows: [row("Alex Example", "Bushcraft Stage 1", "05/03/2026"), row("Alex Example", "Camping Stage 1", "06/03/2026", "07/03/2026")] },
    { label: "Blake Sample (all presented)", rows: [row("Blake Sample", "Camping Stage 2", "01/12/2025", "02/12/2025")] },
  ],
};

const value = (c: unknown) => (c ? (c as { value: unknown }).value : null);

describe("parseDisplayDate", () => {
  it("makes a UTC-midnight date, so Excel shows the same day in any time zone", () => {
    const date = parseDisplayDate("05/03/2026") as Date;
    expect(date.toISOString()).toBe("2026-03-05T00:00:00.000Z");
  });

  it("rejects text that isn't a real DD/MM/YYYY date", () => {
    expect(parseDisplayDate("No")).toBeNull();
    expect(parseDisplayDate("31/02/2026")).toBeNull();
    expect(parseDisplayDate("2026-03-05")).toBeNull();
  });
});

describe("dateCell", () => {
  it("is a real date cell formatted dd/mm/yyyy", () => {
    expect(dateCell("05/03/2026")).toMatchObject({ type: Date, format: EXCEL_DATE_FORMAT });
  });

  it("is empty when there's no date (not presented)", () => {
    expect(dateCell("")).toBeNull();
  });

  it("keeps unexpected text as text rather than losing it", () => {
    expect(dateCell("soon")).toMatchObject({ value: "soon", type: String });
  });
});

describe("buildPresentAwardsSheet", () => {
  it("flat: Name, Type, Award, Date, Presented, one row per award", () => {
    const rows = buildPresentAwardsSheet({ view: FLAT, header: HEADER, logo: null }).rows.slice(HEADER_BLOCK_ROWS);
    expect(rows[0].map(value)).toEqual(["Name", "Type", "Award", "Date", "Presented"]);
    expect(rows[1].slice(0, 3).map(value)).toEqual(["Alex Example", "OAS", "Bushcraft Stage 1"]);
    expect((value(rows[1][3]) as Date).toISOString()).toBe("2026-03-05T00:00:00.000Z");
    expect((value(rows[1][4]) as Date).toISOString()).toBe("2026-03-20T00:00:00.000Z");
    // Not presented: empty.
    expect(rows[2][4]).toBeNull();
  });

  it("grouped: no Name column; a grey member row, and a blank row before every member after the first", () => {
    const rows = buildPresentAwardsSheet({ view: GROUPED, header: HEADER, logo: null }).rows.slice(HEADER_BLOCK_ROWS);
    expect(rows[0].map(value)).toEqual(["Type", "Award", "Date", "Presented"]);
    expect(rows.slice(1).map((r) => value(r[0]))).toEqual(["Alex Example (1 not presented)", "OAS", "OAS", null, "Blake Sample (all presented)", "OAS"]);
    expect(rows[1][0]).toMatchObject({ columnSpan: 4, fontWeight: "bold", backgroundColor: EXCEL_COLOURS.mutedRow });
    expect(rows[4]).toEqual([null, null, null, null]);
  });

  it("gives every table row the same width as the columns", () => {
    [FLAT, GROUPED].forEach((view) => {
      const sheet = buildPresentAwardsSheet({ view, header: HEADER, logo: null });
      const width = view.grouped ? 4 : 5;
      sheet.rows.slice(HEADER_BLOCK_ROWS).forEach((r) => expect(r.length).toBe(width));
      expect(sheet.options.columns).toHaveLength(width);
    });
  });

  it("freezes the title block, the column header and the first column", () => {
    const { options } = buildPresentAwardsSheet({ view: FLAT, header: HEADER, logo: null });
    expect(options.stickyRowsCount).toBe(HEADER_BLOCK_ROWS + 1);
    expect(options.stickyColumnsCount).toBe(1);
  });

  it("writes the dates as Excel date serials for the same day (no time-zone shift)", async () => {
    const blob = await workbookToBlob(buildPresentAwardsSheet({ view: FLAT, header: HEADER, logo: null }));
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const xml = strFromU8(unzipSync(new Uint8Array(bytes))["xl/worksheets/sheet1.xml"]);
    // 05/03/2026 is Excel serial 46086: a whole number, i.e. midnight on that day.
    expect(xml).toContain("<v>46086</v>");
  });
});
