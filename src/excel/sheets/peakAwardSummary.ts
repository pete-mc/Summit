import type { Cell, Image, Row } from "write-excel-file/browser";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import type { PeakAwardRequirement } from "@/pages/OasProgression/data/peakAwardRequirements";
import { getMemberDisplayName, type NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import { buildHeaderBlock, EXCEL_COLOURS, HEADER_BLOCK_ROWS, outlinedBar, type ExcelHeader, type ExcelSheet } from "../summitExcel";

const CORE_SKILL_TITLES = ["Bushcraft", "Bushwalking", "Camping"];
const SHEET_NAME = "Summary";

/** Excel "characters". Box and spacer widths match the Heatmap sheet. */
const WIDTH = { progress: 11, percent: 6, spacer: 1, box: 2.6, countText: 8 };
const MEMBER_WIDTH_MIN = 12;
const MEMBER_WIDTH_MAX = 40;

export interface PeakAwardSummarySheetInput {
  rows: PeakAwardMemberRow[];
  requirement: PeakAwardRequirement;
  nameFormat: NameFormat;
  specialConditionText: string;
  header: ExcelHeader;
  logo: Image | null;
}

function nulls(n: number): Cell[] {
  return Array.from({ length: n }, () => null);
}

export function boxCells(boxes: PeakAwardBox[]): Cell[] {
  const allMet = boxes.length > 0 && boxes.every((b) => b.met);
  if (allMet) return outlinedBar(boxes.length, EXCEL_COLOURS.allMet, EXCEL_COLOURS.squareBorder);
  return boxes.map((box) => ({
    value: "",
    type: String,
    backgroundColor: box.met ? EXCEL_COLOURS.met : EXCEL_COLOURS.notMet,
    borderColor: EXCEL_COLOURS.squareBorder,
    borderStyle: "thin",
  }));
}

function headerCell(text: string, extra: Record<string, unknown> = {}): Cell {
  return {
    value: text,
    type: String,
    fontWeight: "bold",
    align: "center",
    alignVertical: "center",
    bottomBorderStyle: "medium",
    bottomBorderColor: EXCEL_COLOURS.headerBorder,
    ...extra,
  } as Cell;
}

function buildTableHeader(requirement: PeakAwardRequirement, specialConditionText: string): Row[] {
  const core = requirement.coreSkillStage;
  const coreSpan = core * 3 + 2;
  const progressionsSpan = requirement.totalProgressions + 1;
  const specialSpan = requirement.special ? requirement.special.minCount + 1 : 0;
  const upper = { bottomBorderStyle: "thin" };
  const spacer = (rows: number) => headerCell("", rows > 1 ? { rowSpan: rows } : {});

  const top: Row = [
    headerCell("Member", { rowSpan: 2, align: "left" }),
    headerCell("Progress", { rowSpan: 2, columnSpan: 2 }),
    null,
    spacer(2),
    headerCell("Core Skills", { columnSpan: coreSpan, ...upper }),
    ...nulls(coreSpan - 1),
    spacer(2),
    headerCell("Progressions", { rowSpan: 2, columnSpan: progressionsSpan }),
    ...nulls(progressionsSpan - 1),
  ];
  const bottom: Row = [null, null, null, null];
  CORE_SKILL_TITLES.forEach((title, i) => {
    if (i > 0) bottom.push(spacer(1));
    bottom.push(headerCell(title, { columnSpan: core }), ...nulls(core - 1));
  });
  bottom.push(null, ...nulls(progressionsSpan));

  if (specialSpan) {
    top.push(spacer(2), headerCell("Special", { columnSpan: specialSpan, ...upper }), ...nulls(specialSpan - 1));
    bottom.push(null, headerCell(specialConditionText, { columnSpan: specialSpan }), ...nulls(specialSpan - 1));
  }
  return [top, bottom];
}

function buildMemberRow(row: PeakAwardMemberRow, nameFormat: NameFormat, hasSpecial: boolean): Row {
  const cells: Row = [
    { value: getMemberDisplayName(row.firstName, row.lastName, row.memberId, nameFormat), type: String },
    { value: `${row.progressScore} of ${row.progressTotal}`, type: String, align: "center" },
    // Already truncated, so Excel shows the same whole percent as the screen.
    { value: row.progressPercent / 100, type: Number, format: "0%", align: "center" },
  ];
  row.coreSkills.forEach((skill) => cells.push(null, ...boxCells(skill.boxes)));
  cells.push(null, ...boxCells(row.progressionBoxes), { value: `${row.totalProgressions} of ${row.requiredProgressions}`, type: String });
  if (hasSpecial && row.special) {
    cells.push(null, ...boxCells(row.special.boxes), { value: `${row.special.count} of ${row.special.required}`, type: String });
  }
  return cells;
}

export function buildPeakAwardSummarySheet(input: PeakAwardSummarySheetInput): ExcelSheet {
  const { rows, requirement, nameFormat, specialConditionText, header, logo } = input;
  const hasSpecial = !!requirement.special;
  const tableHeader = buildTableHeader(requirement, specialConditionText);
  const names = rows.map((r) => getMemberDisplayName(r.firstName, r.lastName, r.memberId, nameFormat));
  const longestName = names.reduce((max, n) => Math.max(max, n.length), "Member".length);

  const spacer = { width: WIDTH.spacer };
  const boxColumns = (n: number) => Array.from({ length: n }, () => ({ width: WIDTH.box }));
  const columns = [{ width: Math.min(MEMBER_WIDTH_MAX, Math.max(MEMBER_WIDTH_MIN, longestName + 2)) }, { width: WIDTH.progress }, { width: WIDTH.percent }];
  CORE_SKILL_TITLES.forEach(() => columns.push(spacer, ...boxColumns(requirement.coreSkillStage)));
  columns.push(spacer, ...boxColumns(requirement.totalProgressions), { width: WIDTH.countText });
  if (hasSpecial && requirement.special) columns.push(spacer, ...boxColumns(requirement.special.minCount), { width: WIDTH.countText });

  return {
    rows: buildHeaderBlock(header, !!logo).concat(
      tableHeader,
      rows.map((r) => buildMemberRow(r, nameFormat, hasSpecial)),
    ),
    options: {
      sheet: SHEET_NAME,
      columns,
      stickyRowsCount: HEADER_BLOCK_ROWS + tableHeader.length,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
