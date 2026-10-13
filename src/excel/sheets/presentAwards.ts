import type { Cell, Image, Row } from "write-excel-file/browser";
import type { PresentAwardsExportRow, PresentAwardsExportView } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";
import { buildHeaderBlock, EXCEL_COLOURS, EXCEL_DATE_FORMAT, HEADER_BLOCK_ROWS, parseDisplayDate, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/**
 * Present Awards as a spreadsheet (.claude/Excel/PLAN_STAGE_3.md).
 *
 * Columns: Name (only when not grouped) | Type | Award | Date Awarded | Date Presented | Presented
 * (Yes/No) | Present (☑/☐), the same columns as the screen. Grouped by member, each member gets a grey header row ("Alex Example (2 not
 * presented)"), with a blank row before every member after the first. Dates are real Excel dates;
 * Date Presented is empty when not presented. No
 * badge pictures: they float above the cells and wouldn't follow their rows when sorted in Excel.
 *
 * Built from PresentAwardsTableVue.getExportView(): filtered, sorted and grouped as on screen.
 */

const SHEET_NAME = "Present Awards";
/** Excel "characters". Text columns fit their longest value within these limits; date columns fit their header. */
const WIDTH = { date: 16, min: 10, max: 50 };

export interface PresentAwardsSheetInput {
  view: PresentAwardsExportView;
  header: ExcelHeader;
  logo: Image | null;
}

const TICKED = "☑"; // ☑
const UNTICKED = "☐"; // ☐

interface Column {
  header: string;
  /** Text columns size to their longest value; date columns are fixed. */
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
    // Yes/No beside the date, so presented-or-not can be filtered on directly (user, 2026-10-13).
    { header: "Presented", text: (r) => (r.presented ? "Yes" : "No") },
    // The tick box, as a ticked/empty box character: Excel tick boxes can't be written by the library.
    { header: "Present", text: (r) => (r.present ? TICKED : UNTICKED), align: "center" },
  ];
  // Grouped, the name is in each member's header row instead, as on screen.
  return grouped ? columns : [{ header: "Name", text: (r) => r.member } as Column].concat(columns);
}

/** A date cell, empty when there's no date. Text that isn't a DD/MM/YYYY date is kept as text rather than lost. */
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
      // A blank row before every member after the first (as on the Heatmap sheet).
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
      // Title block, column header and first column stay on screen (user, 2026-10-13).
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
