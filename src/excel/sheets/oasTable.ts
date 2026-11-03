import type { Cell, Image, Row } from "write-excel-file/browser";
import type { OASTableRow } from "@/pages/OasProgressVue/components/OASProgressTableVue";
import { buildHeaderBlock, EXCEL_COLOURS, EXCEL_DATE_FORMAT, HEADER_BLOCK_ROWS, parseIsoDate, type ExcelHeader, type ExcelSheet } from "../summitExcel";

const SHEET_NAME = "Table";

export interface OasTableSheetInput {
  rows: OASTableRow[];
  header: ExcelHeader;
  logo: Image | null;
}

function dateCell(date: string | null): Cell {
  const parsed = date ? parseIsoDate(date) : null;
  if (!parsed) return date ? { value: date, type: String } : null;
  return { value: parsed, type: Date, format: EXCEL_DATE_FORMAT, align: "left" };
}

const yesNo = (value: boolean): Cell => ({ value: value ? "Yes" : "No", type: String });

/** Must match OASProgressTableVue's columns so the export matches the screen. */
const COLUMNS: Array<{ header: string; width: number; cell: (row: OASTableRow) => Cell }> = [
  { header: "Member", width: 24, cell: (r) => ({ value: r.memberName, type: String }) },
  { header: "Skill", width: 30, cell: (r) => ({ value: r.skillStream, type: String }) },
  { header: "Stage", width: 7, cell: (r) => ({ value: r.stage, type: Number, align: "center" }) },
  { header: "Group", width: 10, cell: (r) => ({ value: r.inputGroup, type: String }) },
  { header: "I-Statement", width: 70, cell: (r) => ({ value: r.iStatement, type: String, wrap: true }) },
  { header: "Answered", width: 10, cell: (r) => yesNo(r.answered) },
  { header: "Awarded", width: 10, cell: (r) => yesNo(r.awarded) },
  { header: "Date", width: 12, cell: (r) => dateCell(r.date) },
];

export function buildOasTableSheet(input: OasTableSheetInput): ExcelSheet {
  const { rows, header, logo } = input;
  const tableHeader: Row = COLUMNS.map((c): Cell => ({ value: c.header, type: String, fontWeight: "bold", bottomBorderStyle: "medium", bottomBorderColor: EXCEL_COLOURS.headerBorder }));
  return {
    rows: buildHeaderBlock(header, !!logo).concat(
      [tableHeader],
      rows.map((row) => COLUMNS.map((c) => c.cell(row))),
    ),
    options: {
      sheet: SHEET_NAME,
      columns: COLUMNS.map((c) => ({ width: c.width })),
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      images: logo ? [logo] : undefined,
    },
  };
}
