import type { Cell, Image, Row } from "write-excel-file/browser";
import type { PresentAwardsExportRow, PresentAwardsExportView } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";
import { buildHeaderBlock, EXCEL_COLOURS, EXCEL_DATE_FORMAT, HEADER_BLOCK_ROWS, parseDisplayDate, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/** Learning: no badge pictures. Images float above cells and don't follow their rows when sorted in Excel. */

const SHEET_NAME = "Present Awards";
const WIDTH = { date: 16, min: 10, max: 50 };

export interface PresentAwardsSheetInput {
  view: PresentAwardsExportView;
  header: ExcelHeader;
  logo: Image | null;
}

const TICKED = "☑";
const UNTICKED = "☐";

interface Column {
  header: string;
  text?: (row: PresentAwardsExportRow) => string;
  date?: (row: PresentAwardsExportRow) => string;
  align?: "center";
}

function columnsFor(grouped: boolean): Column[] {
  const columns: Column[] = [
    { header: "Type", text: (r) => r.type },
    { header: "Award", text: (r) => r.award },
    { header: "Date Awarded", date: (r) => r.dateAwarded },
    { header: "Date Presented", date: (r) => r.presented },
    { header: "Presented", text: (r) => (r.presented ? "Yes" : "No") },
    // The library can't write Excel tick boxes, so use ☑ / ☐ characters.
    { header: "Present", text: (r) => (r.present ? TICKED : UNTICKED), align: "center" },
  ];
  return grouped ? columns : [{ header: "Name", text: (r) => r.member } as Column].concat(columns);
}

/** Non-date text is kept as text rather than lost. */
export function dateCell(text: string): Cell {
  if (!text) return null;
  const date = parseDisplayDate(text);
  return date ? { value: date, type: Date, format: EXCEL_DATE_FORMAT, align: "left" } : { value: text, type: String };
}

function dataRow(row: PresentAwardsExportRow, columns: Column[]): Row {
  return columns.map((c): Cell => (c.date ? dateCell(c.date(row)) : { value: c.text ? c.text(row) : "", type: String, ...(c.align ? { align: c.align } : {}) }));
}

export function buildPresentAwardsSheet(input: PresentAwardsSheetInput): ExcelSheet {
  const { view, header, logo } = input;
  const columns = columnsFor(view.grouped);
  const width = columns.length;
  const allRows = view.groups.flatMap((g) => g.rows);

  const tableHeader: Row = columns.map((c): Cell => ({ value: c.header, type: String, fontWeight: "bold", alignVertical: "center", bottomBorderStyle: "medium", bottomBorderColor: EXCEL_COLOURS.headerBorder }));

  const body: Row[] = [];
  view.groups.forEach((group, index) => {
    if (view.grouped) {
      if (index > 0) body.push(Array.from({ length: width }, () => null));
      body.push([{ value: group.label, type: String, columnSpan: width, fontWeight: "bold", backgroundColor: EXCEL_COLOURS.mutedRow } as Cell].concat(Array.from({ length: width - 1 }, () => null)));
    }
    group.rows.forEach((row) => body.push(dataRow(row, columns)));
  });

  const sheetColumns = columns.map((c) => {
    if (c.date) return { width: WIDTH.date };
    const longest = allRows.reduce((max, r) => Math.max(max, c.text ? c.text(r).length : 0), c.header.length);
    return { width: Math.min(WIDTH.max, Math.max(WIDTH.min, longest + 2)) };
  });

  return {
    rows: buildHeaderBlock(header, !!logo).concat([tableHeader], body),
    options: {
      sheet: SHEET_NAME,
      columns: sheetColumns,
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
