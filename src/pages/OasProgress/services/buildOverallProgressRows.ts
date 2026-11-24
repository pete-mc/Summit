import type { HeatMapSection, SectionMemberRow, SkillHeatMapData } from "./groupRowsForHeatMap";
import { formatStageProgress, orderSkills } from "./filterHeatMapSections";
import type { StageProgressDisplay } from "./filterHeatMapSections";
import type { StageAward } from "./buildPeakAwardSummaryRows";

export interface OverallProgressColumn {
  key: string;
  skill: string;
  /** null for the trunk column. */
  stream: string | null;
}

/** awards: only on a collapsed skill cell, the highest award of each trunk/stream that has one. */
export interface OverallProgressCell extends StageProgressDisplay {
  awards?: StageAward[];
}

export interface OverallProgressRow {
  memberId: string;
  displayName: string;
  patrolName: string | null;
  /** Aligned with the columns. */
  cells: OverallProgressCell[];
}

const NO_PROGRESS: StageProgressDisplay = { stage: "-", nextStageProgress: null };

function columnKey(section: HeatMapSection): string {
  return section.skill + "::" + (section.stream ?? "");
}

function orderedSections(grouped: Record<string, SkillHeatMapData>): HeatMapSection[] {
  return orderSkills(Object.keys(grouped)).flatMap((skill) => grouped[skill].sections);
}

/** Every trunk and stream gets a column, even when nobody has started it. */
export function buildOverallProgressColumns(grouped: Record<string, SkillHeatMapData>): OverallProgressColumn[] {
  return orderedSections(grouped).map((section) => ({ key: columnKey(section), skill: section.skill, stream: section.stream }));
}

export function buildCollapsedOverallProgressColumns(grouped: Record<string, SkillHeatMapData>): OverallProgressColumn[] {
  return orderSkills(Object.keys(grouped)).map((skill) => ({ key: skill + "::", skill, stream: null }));
}

export interface OverallProgressColumnSort {
  key: string;
  descending: boolean;
}

export function nextColumnSort(current: OverallProgressColumnSort | null, key: string): OverallProgressColumnSort | null {
  if (!current || current.key !== key) return { key, descending: true };
  return current.descending ? { key, descending: false } : null;
}

/** A stream sort becomes a sort on its skill. Gotcha: derived, never saved, so expanding again restores the stream sort. */
export function collapsedColumnSort(sort: OverallProgressColumnSort | null): OverallProgressColumnSort | null {
  if (!sort) return null;
  return { key: sort.key.split("::")[0] + "::", descending: sort.descending };
}

function stageSortValue(cell: StageProgressDisplay): number | null {
  if (cell.stage === "-") return null;
  return Number(cell.stage) * 100 + Number(cell.nextStageProgress ?? 0);
}

/** "-" always sorts last. Ties keep the incoming order, so the Sort by choice breaks them. */
export function sortOverallProgressRows(rows: OverallProgressRow[], columns: OverallProgressColumn[], sort: OverallProgressColumnSort | null): OverallProgressRow[] {
  const columnIndex = sort ? columns.findIndex((c) => c.key === sort.key) : -1;
  if (!sort || columnIndex === -1) return rows;

  const direction = sort.descending ? -1 : 1;
  return rows.slice().sort((a, b) => {
    const aValue = stageSortValue(a.cells[columnIndex]);
    const bValue = stageSortValue(b.cells[columnIndex]);
    if (aValue === bValue) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    return (aValue - bValue) * direction;
  });
}

/** Cells match the heat map's Stage column. Rows follow the given member order, so the caller's filters and sort apply. */
export function buildOverallProgressRows(grouped: Record<string, SkillHeatMapData>, members: Array<{ memberId: string; displayName: string; patrolName: string | null }>): OverallProgressRow[] {
  const sections = orderedSections(grouped);
  const membersBySection = sections.map((section) => new Map<string, SectionMemberRow>(section.members.map((m) => [m.memberId, m])));

  return members.map(({ memberId, displayName, patrolName }) => ({
    memberId,
    displayName,
    patrolName,
    cells: sections.map((section, index) => {
      const member = membersBySection[index].get(memberId);
      if (!member) return NO_PROGRESS;
      return formatStageProgress(member.highestStage, member.stages, section.stream !== null, section.trunkStageCount, member.trunkFullyAwarded);
    }),
  }));
}

function highestAward(section: HeatMapSection, member: SectionMemberRow): StageAward | null {
  if (member.highestStage === null) return null;
  const awarded = member.stages.find((stage) => stage.stage === member.highestStage);
  const cell = awarded?.cells[0];
  return { stream: section.skill, branch: section.stream ?? section.skill, stage: member.highestStage, section: cell?.section ?? null, date: cell?.date ?? null };
}

function collapsedCell(skillSections: HeatMapSection[], memberId: string): OverallProgressCell {
  const awards = skillSections
    .map((section) => {
      const member = section.members.find((m) => m.memberId === memberId);
      return member ? highestAward(section, member) : null;
    })
    .filter((award): award is StageAward => award !== null);
  if (awards.length === 0) return NO_PROGRESS;
  const highest = awards.reduce((max, award) => Math.max(max, award.stage), 0);
  return { stage: String(highest), nextStageProgress: null, awards };
}

/** One cell per skill: the highest whole stage awarded in its trunk or any of its streams. */
export function buildCollapsedOverallProgressRows(grouped: Record<string, SkillHeatMapData>, members: Array<{ memberId: string; displayName: string; patrolName: string | null }>): OverallProgressRow[] {
  const skills = orderSkills(Object.keys(grouped));
  return members.map(({ memberId, displayName, patrolName }) => ({
    memberId,
    displayName,
    patrolName,
    cells: skills.map((skill) => collapsedCell(grouped[skill].sections, memberId)),
  }));
}

/** Judged on the rows given, so filtering to a patrol or member trims columns to what they have started. No rows keeps every column. */
export function hideNotStartedColumns(columns: OverallProgressColumn[], rows: OverallProgressRow[]): { columns: OverallProgressColumn[]; rows: OverallProgressRow[] } {
  if (rows.length === 0) return { columns, rows };
  const keep = columns.map((_, index) => rows.some((row) => row.cells[index].stage !== "-"));
  return {
    columns: columns.filter((_, index) => keep[index]),
    rows: rows.map((row) => ({ ...row, cells: row.cells.filter((_, index) => keep[index]) })),
  };
}
