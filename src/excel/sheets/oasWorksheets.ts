import type { Cell, Image, Row } from "write-excel-file/browser";
import { transposeWorksheetPage, type WorksheetCell, type WorksheetPage } from "@/pages/OasProgressVue/services/buildWorksheetPages";
import { buildHeaderBlock, EXCEL_COLOURS, EXCEL_DATE_FORMAT, excelTitleRow, HEADER_BLOCK_ROWS, parseIsoDate, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/** Excel "characters". Date columns must fit dd/mm/yyyy, or Excel shows ####. */
const WIDTH = { group: 14, statement: 60, dateColumn: 12, nameMin: 12, nameMax: 40 };
/** Points. */
const ROTATED_HEADER_HEIGHT = { member: 110, statement: 230 };

const BORDER = { borderStyle: "thin" as const, borderColor: EXCEL_COLOURS.headerBorder };

export interface WorksheetSheetInput {
  page: WorksheetPage;
  membersAsRows: boolean;
  breakByPatrol: boolean;
  header: ExcelHeader;
  logo: Image | null;
}

/** Sheet names must be unique and at most 31 characters. Pages share one Skill - Stream, so the stage is unique. */
export function worksheetSheetName(page: WorksheetPage): string {
  return `Stage ${page.stage}`;
}

export function worksheetCell(cell: WorksheetCell): Cell {
  const base = { ...BORDER, align: "center" as const, alignVertical: "center" as const };
  if (cell.notApplicable) return { ...base, value: "n/a", type: String, textColor: EXCEL_COLOURS.muted, backgroundColor: EXCEL_COLOURS.mutedRow };
  const awarded = cell.awarded ? { backgroundColor: EXCEL_COLOURS.allMet, textColor: "#ffffff" } : {};
  if (!cell.date) return { ...base, ...awarded, value: "", type: String };
  const date = parseIsoDate(cell.date);
  return date ? { ...base, ...awarded, value: date, type: Date, format: EXCEL_DATE_FORMAT } : { ...base, ...awarded, value: cell.date, type: String };
}

function headerCell(text: string, extra: Record<string, unknown> = {}): Cell {
  return { value: text, type: String, fontWeight: "bold", alignVertical: "bottom", ...BORDER, ...extra } as Cell;
}

function patrolRuns(patrolNames: Array<string | null>): Array<{ patrolName: string; count: number }> {
  const runs: Array<{ patrolName: string; count: number }> = [];
  patrolNames.forEach((name) => {
    const label = name || "Unassigned";
    const last = runs[runs.length - 1];
    if (last && last.patrolName === label) last.count++;
    else runs.push({ patrolName: label, count: 1 });
  });
  return runs;
}

function spanCells(text: string, span: number, extra: Record<string, unknown>): Cell[] {
  return [headerCell(text, { columnSpan: span, align: "center", ...extra }) as Cell].concat(Array.from({ length: span - 1 }, () => null));
}

function membersAsColumns(page: WorksheetPage, breakByPatrol: boolean): { tableRows: Row[]; headerRowCount: number; columns: Array<{ width: number }> } {
  const header: Row[] = [];
  if (breakByPatrol) {
    const patrolCells = patrolRuns(page.members.map((m) => m.patrolName)).flatMap((run) => spanCells(run.patrolName, run.count, { backgroundColor: EXCEL_COLOURS.mutedRow }));
    header.push([headerCell(""), headerCell("")].concat(patrolCells));
  }
  header.push([headerCell("Group"), headerCell("I-Statement")].concat(page.members.map((m) => headerCell(m.displayName, { textRotation: 90, align: "center", height: ROTATED_HEADER_HEIGHT.member }))));

  const body: Row[] = [];
  page.groups.forEach((group) => {
    group.rows.forEach((row, rowIndex) => {
      const groupCell: Cell = rowIndex === 0 ? { value: group.title, type: String, fontWeight: "bold", rowSpan: group.rows.length, alignVertical: "center", wrap: true, ...BORDER } : null;
      body.push([groupCell, { value: row.iStatement, type: String, wrap: true, alignVertical: "center", ...BORDER } as Cell].concat(row.cells.map(worksheetCell)));
    });
  });

  return {
    tableRows: header.concat(body),
    headerRowCount: header.length,
    columns: [{ width: WIDTH.group }, { width: WIDTH.statement }].concat(page.members.map(() => ({ width: WIDTH.dateColumn }))),
  };
}

function membersAsRows(page: WorksheetPage, breakByPatrol: boolean): { tableRows: Row[]; headerRowCount: number; columns: Array<{ width: number }> } {
  const transposed = transposeWorksheetPage(page);
  const total = transposed.columns.length + 1;
  const header: Row[] = [
    [headerCell("")].concat(transposed.groupSpans.flatMap((span) => spanCells(span.title, span.columnCount, {}))),
    [headerCell("Member")].concat(transposed.columns.map((c) => headerCell(c.iStatement, { fontWeight: undefined, textRotation: 90, wrap: true, height: ROTATED_HEADER_HEIGHT.statement }))),
  ];

  const body: Row[] = [];
  transposed.rows.forEach((row, rowIndex) => {
    if (breakByPatrol && (rowIndex === 0 || row.patrolName !== transposed.rows[rowIndex - 1].patrolName)) {
      body.push(excelTitleRow(row.patrolName || "Unassigned", total, { backgroundColor: EXCEL_COLOURS.mutedRow }));
    }
    body.push([{ value: row.displayName, type: String, alignVertical: "center", ...BORDER } as Cell].concat(row.cells.map(worksheetCell)));
  });

  const longestName = transposed.rows.reduce((max, r) => Math.max(max, r.displayName.length), "Member".length);
  return {
    tableRows: header.concat(body),
    headerRowCount: header.length,
    columns: [{ width: Math.min(WIDTH.nameMax, Math.max(WIDTH.nameMin, longestName + 2)) }].concat(transposed.columns.map(() => ({ width: WIDTH.dateColumn }))),
  };
}

export function buildWorksheetSheet(input: WorksheetSheetInput): ExcelSheet {
  const { page, membersAsRows: asRows, breakByPatrol, header, logo } = input;
  const table = asRows ? membersAsRows(page, breakByPatrol) : membersAsColumns(page, breakByPatrol);
  const titleRow = excelTitleRow(page.title, table.columns.length, { fontSize: 12 });

  return {
    rows: buildHeaderBlock(header, !!logo).concat([titleRow], table.tableRows),
    options: {
      sheet: worksheetSheetName(page),
      columns: table.columns,
      stickyRowsCount: HEADER_BLOCK_ROWS + 1 + table.headerRowCount,
      stickyColumnsCount: asRows ? 1 : 2,
      images: logo ? [logo] : undefined,
    },
  };
}
