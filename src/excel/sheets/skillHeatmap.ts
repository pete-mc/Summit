import type { Cell, Image, Row } from "write-excel-file/browser";
import type { HeatMapExportView, MemberRowView, StageCellView } from "@/pages/OasProgressionVue/components/OASHeatMapVue";
import { buildHeaderBlock, EXCEL_COLOURS, HEADER_BLOCK_ROWS, outlinedBar, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/** A stage is as wide as its most squares in any row (min 2, so bars stay visible). */

const SHEET_NAME = "Heatmap";
const MIN_STAGE_CELLS = 2;
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

export function stageWidths(view: HeatMapExportView): number[] {
  const rows = allRows(view);
  return view.stages.map((_, i) => rows.reduce((max, r) => Math.max(max, r.view.cells[i]?.squares?.length ?? 0), MIN_STAGE_CELLS));
}

const SQUARE_FILL: Record<string, string> = {
  awarded: EXCEL_COLOURS.allMet,
  answered: EXCEL_COLOURS.met,
  unanswered: EXCEL_COLOURS.notMet,
};

export function stageCells(cell: StageCellView | undefined, width: number): Cell[] {
  if (!cell || cell.kind === "empty") return nulls(width);
  if (cell.kind === "bar-complete") {
    // White outline so the bar is inset like the squares; otherwise their borders nibble its edges.
    return outlinedBar(width, EXCEL_COLOURS.allMet, EXCEL_COLOURS.squareBorder);
  }
  if (cell.kind === "bar-unstarted") {
    return outlinedBar(width, EXCEL_COLOURS.notMet, EXCEL_COLOURS.headerBorder);
  }
  const squares: Cell[] = (cell.squares ?? []).map((square) =>
    square.state === "hidden"
      ? null
      : {
          value: "",
          type: String,
          backgroundColor: SQUARE_FILL[square.state],
          borderColor: EXCEL_COLOURS.squareBorder,
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

function titleRow(text: string, totalColumns: number, style: Record<string, unknown>): Row {
  return [{ value: text, type: String, columnSpan: totalColumns, fontWeight: "bold", ...style } as Cell, ...nulls(totalColumns - 1)];
}

function dataRow(label: string, view: MemberRowView, widths: number[]): Row {
  // "-" leaves Stage and Next empty, so it sorts last.
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
      stickyRowsCount: HEADER_BLOCK_ROWS + 1,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
