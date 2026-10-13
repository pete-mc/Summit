import type { Cell, Image, Row } from "write-excel-file/browser";
import type { PeakAwardBox, PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import type { PeakAwardRequirement } from "@/pages/OasProgression/data/peakAwardRequirements";
import { getMemberDisplayName, type NameFormat } from "@/pages/OasProgression/services/getMemberDisplayName";
import { buildHeaderBlock, EXCEL_COLOURS, HEADER_BLOCK_ROWS, outlinedBar, type ExcelHeader, type ExcelSheet } from "../summitExcel";

/**
 * OAS Progression → Summary tab as a spreadsheet (.claude/Excel/PLAN_STAGE_1.md).
 *
 * Columns: Member | Progress ("X of Y") | % | then, each after a narrow spacer column: one cell
 * per box for each Core Skill (×3 skills) | Progressions boxes + "X of Y" | Special boxes + "X of Y"
 * (only when the section has a Special condition). Box counts come from the section's requirement,
 * so every row lines up.
 *
 * Box colours follow the screen: yellow = met, grey = not met. Once the whole group is met it
 * becomes one green bar outlined in white, as on the Heatmap sheet (user, 2026-10-13).
 */

const CORE_SKILL_TITLES = ["Bushcraft", "Bushwalking", "Camping"];
const SHEET_NAME = "Summary";

/** Column widths in Excel "characters". Box and spacer widths match the Heatmap sheet. */
const WIDTH = { progress: 11, percent: 6, spacer: 1, box: 2.6, countText: 8 };
const MEMBER_WIDTH_MIN = 12;
const MEMBER_WIDTH_MAX = 40;

export interface PeakAwardSummarySheetInput {
  /** Rows exactly as the Summary tab shows them: filtered and sorted. */
  rows: PeakAwardMemberRow[];
  requirement: PeakAwardRequirement;
  nameFormat: NameFormat;
  /** "4 above Stage 3": the text under the Special header, as on screen. */
  specialConditionText: string;
  header: ExcelHeader;
  logo: Image | null;
}

function nulls(n: number): Cell[] {
  return Array.from({ length: n }, () => null);
}

/** One cell per box, or one green bar across them all when every box in the group is met (as on screen). */
export function boxCells(boxes: PeakAwardBox[]): Cell[] {
  const allMet = boxes.length > 0 && boxes.every((b) => b.met);
  if (allMet) return outlinedBar(boxes.length, EXCEL_COLOURS.allMet, EXCEL_COLOURS.squareBorder);
  return boxes.map((box) => ({
    value: "",
    type: String,
    backgroundColor: box.met ? EXCEL_COLOURS.met : EXCEL_COLOURS.notMet,
    // White borders read as the small gap between squares on screen.
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

/** The two-row table header, merged the same way as the screen's, with a spacer before each group. */
function buildTableHeader(requirement: PeakAwardRequirement, specialConditionText: string): Row[] {
  const core = requirement.coreSkillStage;
  // The three skills plus the two spacers between them.
  const coreSpan = core * 3 + 2;
  const progressionsSpan = requirement.totalProgressions + 1;
  const specialSpan = requirement.special ? requirement.special.minCount + 1 : 0;
  // Cells above the second header row get a light rule, so only the bottom of the header is heavy.
  const upper = { bottomBorderStyle: "thin" };
  // A spacer column's header cell: blank, but carries the header rule so it runs unbroken.
  const spacer = (rows: number) => headerCell("", rows > 1 ? { rowSpan: rows } : {});

  const top: Row = [
    headerCell("Member", { rowSpan: 2, align: "left" }),
    // One "Progress" header over both "X of Y" and %, as on screen (user, 2026-10-13).
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
    // The screen's truncated whole percent, so Excel's display matches it rather than rounding.
    { value: row.progressPercent / 100, type: Number, format: "0%", align: "center" },
  ];
  // A blank spacer cell before each group, as on the Heatmap sheet (user, 2026-10-13).
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
      // Title block and table header stay on screen, as does Member (user, 2026-10-12).
      stickyRowsCount: HEADER_BLOCK_ROWS + tableHeader.length,
      stickyColumnsCount: 1,
      images: logo ? [logo] : undefined,
    },
  };
}
