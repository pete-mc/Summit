import type { Cell, Image, Row } from "write-excel-file/browser";
import type { HeatMapExportView, MemberRowView, StageCellView } from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import { buildHeaderBlock, EXCEL_COLOURS, HEADER_BLOCK_ROWS, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/**
 * OAS Progression → Heatmap tab as a spreadsheet (.claude/Excel/PLAN_STAGE_2.md).
 *
 * Columns: Member (or Skill) | Stage | Next | then per stage: a narrow spacer and one cell per
 * square. A stage is as wide as the most squares it has in any exported row (at least 2, so a
 * stage of bars stays visible); shorter stages leave blank cells. Bars (fully awarded green, not
 * started grey) fill the whole stage width. Hidden squares are blank, as on screen. A blank row
 * separates each section (skill or member) and each patrol group from the one before.
 *
 * Built from OASHeatMapVue.getExportView(): the rows exactly as rendered, in either layout.
 */

const SHEET_NAME = "Heatmap";
const MIN_STAGE_CELLS = 2;
/** Column widths in Excel "characters". Box width matches the Summary sheet. */
const WIDTH = { stage: 7, next: 6, spacer: 1, box: 2.6 };
const LABEL_WIDTH_MIN = 12;
const LABEL_WIDTH_MAX = 45;

export interface SkillHeatmapSheetInput {
  view: HeatMapExportView;
  header: ExcelHeader;
  logo: Image | null;
}

function nulls(n: number): Cell[] {
  return Array.from({ length: n }, () => null);
}

function allRows(view: HeatMapExportView): Array<{ label: string; view: MemberRowView }> {
  return view.sections.flatMap((s) => s.groups.flatMap((g) => g.rows));
}

/** Cells per stage column: the most squares that stage has in any row, at least MIN_STAGE_CELLS. */
export function stageWidths(view: HeatMapExportView): number[] {
  const rows = allRows(view);
  return view.stages.map((_, i) => rows.reduce((max, r) => Math.max(max, r.view.cells[i]?.squares?.length ?? 0), MIN_STAGE_CELLS));
}

const SQUARE_FILL: Record<string, string> = {
  awarded: EXCEL_COLOURS.allMet,
  answered: EXCEL_COLOURS.met,
  unanswered: EXCEL_COLOURS.notMet,
};

/** Squares are separated by white borders; the green bar's outline uses the same colour. */
const SQUARE_BORDER = "#ffffff";

/** A bar `width` cells long: one fill, outlined on its outside edge only (no lines inside it). */
function outlinedBar(width: number, fill: string, outline: string): Cell[] {
  return Array.from({ length: width }, (_, i) => ({
    value: "",
    type: String,
    backgroundColor: fill,
    topBorderStyle: "thin" as const,
    topBorderColor: outline,
    bottomBorderStyle: "thin" as const,
    bottomBorderColor: outline,
    ...(i === 0 ? { leftBorderStyle: "thin" as const, leftBorderColor: outline } : {}),
    ...(i === width - 1 ? { rightBorderStyle: "thin" as const, rightBorderColor: outline } : {}),
  }));
}

/** One stage's cells for one row, exactly `width` long. */
export function stageCells(cell: StageCellView | undefined, width: number): Cell[] {
  if (!cell || cell.kind === "empty") return nulls(width);
  if (cell.kind === "bar-complete") {
    // White outline, the same as a square's border, so the bar is inset like the squares around
    // it. Without it, the white borders of squares above and below nibble its edges unevenly
    // (user, 2026-10-13).
    return outlinedBar(width, EXCEL_COLOURS.allMet, SQUARE_BORDER);
  }
  if (cell.kind === "bar-unstarted") {
    // Outlined in grey like the screen's not-started bar.
    return outlinedBar(width, EXCEL_COLOURS.notMet, EXCEL_COLOURS.headerBorder);
  }
  const squares: Cell[] = (cell.squares ?? []).map((square) =>
    square.state === "hidden"
      ? null
      : {
          value: "",
          type: String,
          backgroundColor: SQUARE_FILL[square.state],
          // White borders read as the gap between squares, as on the Summary sheet.
          borderColor: SQUARE_BORDER,
          borderStyle: "thin" as const,
        },
  );
  return squares.concat(nulls(width - squares.length));
}

function headerCell(text: string, extra: Record<string, unknown> = {}): Cell {
  return { value: text, type: String, fontWeight: "bold", align: "center", alignVertical: "center", bottomBorderStyle: "medium", bottomBorderColor: EXCEL_COLOURS.headerBorder, ...extra } as Cell;
}

function buildTableHeader(view: HeatMapExportView, widths: number[]): Row {
  const row: Row = [headerCell(view.firstColumnHeader, { align: "left" }), headerCell("Stage"), headerCell("Next")];
  view.stages.forEach((stage, i) => {
    row.push(headerCell(""), headerCell(String(stage), { columnSpan: widths[i] }), ...nulls(widths[i] - 1));
  });
  return row;
}

/** A full-width title row (skill or member section, or patrol). */
function titleRow(text: string, totalColumns: number, style: Record<string, unknown>): Row {
  return [{ value: text, type: String, columnSpan: totalColumns, fontWeight: "bold", ...style } as Cell, ...nulls(totalColumns - 1)];
}

function dataRow(label: string, view: MemberRowView, widths: number[]): Row {
  // "-" (nothing awarded, or a stream not yet unlocked) leaves Stage and Next empty, so it sorts last.
  const hasStage = view.stageDisplay !== "-";
  const row: Row = [
    { value: label, type: String },
    hasStage ? { value: Number(view.stageDisplay), type: Number, align: "center" } : null,
    hasStage && view.nextStageProgress ? { value: Number(view.nextStageProgress), type: Number, align: "center" } : null,
  ];
  widths.forEach((width, i) => {
    row.push(null, ...stageCells(view.cells[i], width));
  });
  return row;
}

export function buildSkillHeatmapSheet(input: SkillHeatmapSheetInput): ExcelSheet {
  const { view, header, logo } = input;
  const widths = stageWidths(view);
  const totalColumns = 3 + widths.reduce((sum, w) => sum + 1 + w, 0);

  // A blank row before every section and patrol group after the first, so long sheets don't run
  // together (user, 2026-10-13).
  const blankRow = (): Row => nulls(totalColumns);
  const body: Row[] = [];
  view.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) body.push(blankRow());
    body.push(titleRow(section.patrolName ? `${section.title} — ${section.patrolName}` : section.title, totalColumns, { fontSize: 12, backgroundColor: EXCEL_COLOURS.sectionRow }));
    section.groups.forEach((group, groupIndex) => {
      if (groupIndex > 0) body.push(blankRow());
      if (group.patrolName) body.push(titleRow(group.patrolName, totalColumns, { backgroundColor: EXCEL_COLOURS.mutedRow }));
      group.rows.forEach((r) => body.push(dataRow(r.label, r.view, widths)));
    });
  });

  const longestLabel = allRows(view).reduce((max, r) => Math.max(max, r.label.length), view.firstColumnHeader.length);
  const columns = [{ width: Math.min(LABEL_WIDTH_MAX, Math.max(LABEL_WIDTH_MIN, longestLabel + 2)) }, { width: WIDTH.stage }, { width: WIDTH.next }];
  widths.forEach((w) => {
    columns.push({ width: WIDTH.spacer }, ...Array.from({ length: w }, () => ({ width: WIDTH.box })));
  });

  return {
    rows: buildHeaderBlock(header, !!logo).concat([buildTableHeader(view, widths)], body),
    options: {
      sheet: SHEET_NAME,
      columns,
      // Title block and table header stay on screen, as does the first column (user, 2026-10-12).
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
