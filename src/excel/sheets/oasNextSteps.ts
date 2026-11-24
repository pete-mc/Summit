import type { Cell, Image, Row } from "write-excel-file/browser";
import { groupNextStepsRows, type NextStepsRow } from "@/pages/OasProgressVue/services/nextStepsRows";
import { buildHeaderBlock, EXCEL_COLOURS, EXCEL_DATE_FORMAT, HEADER_BLOCK_ROWS, parseIsoDate, type ExcelHeader, type ExcelSheet } from "../summitExcel";

const SHEET_NAME = "Next Steps";

const BORDER = { borderStyle: "thin" as const, borderColor: EXCEL_COLOURS.headerBorder };

export interface NextStepsSheetInput {
  rows: NextStepsRow[];
  header: ExcelHeader;
  logo: Image | null;
}

function dateCell(date: string | null): Cell {
  const base = { ...BORDER, alignVertical: "center" as const };
  const parsed = date ? parseIsoDate(date) : null;
  if (!parsed) return { ...base, value: date ?? "", type: String };
  return { ...base, value: parsed, type: Date, format: EXCEL_DATE_FORMAT, align: "left" };
}

/** White borders read as the gap around a box, like the heat map sheet. */
export function answeredCell(answered: boolean): Cell {
  return { value: "", type: String, backgroundColor: answered ? EXCEL_COLOURS.met : EXCEL_COLOURS.notMet, borderStyle: "thick", borderColor: EXCEL_COLOURS.squareBorder };
}

const COLUMNS = [
  { header: "Group", width: 10 },
  { header: "Answered", width: 10 },
  { header: "I-Statement", width: 80 },
  { header: "Date", width: 12 },
];

export function buildNextStepsSheet(input: NextStepsSheetInput): ExcelSheet {
  const { rows, header, logo } = input;
  const tableHeader: Row = COLUMNS.map((c): Cell => ({ value: c.header, type: String, fontWeight: "bold", bottomBorderStyle: "medium", bottomBorderColor: EXCEL_COLOURS.headerBorder }));
  const body: Row[] = groupNextStepsRows(rows).flatMap((group) =>
    group.rows.map(
      (row, rowIndex): Row => [
        rowIndex === 0 ? { value: group.title, type: String, fontWeight: "bold", rowSpan: group.rows.length, alignVertical: "center", ...BORDER } : null,
        answeredCell(row.answered),
        { value: row.iStatement, type: String, wrap: true, alignVertical: "center", ...BORDER },
        dateCell(row.date),
      ],
    ),
  );
  return {
    rows: buildHeaderBlock(header, !!logo).concat([tableHeader], body),
    options: {
      sheet: SHEET_NAME,
      columns: COLUMNS.map((c) => ({ width: c.width })),
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      images: logo ? [logo] : undefined,
    },
  };
}
