import type { HeatMapSection, SectionMemberRow, SkillHeatMapData } from "./groupRowsForHeatMap";
import { formatStageProgress, orderSkills } from "./filterHeatMapSections";
import type { StageProgressDisplay } from "./filterHeatMapSections";

export interface OverallProgressColumn {
  key: string;
  skill: string;
  /** null for the trunk column. */
  stream: string | null;
}

export interface OverallProgressRow {
  memberId: string;
  displayName: string;
  /** Aligned with the columns. */
  cells: StageProgressDisplay[];
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

export interface OverallProgressColumnSort {
  key: string;
  descending: boolean;
}

/** Highest first, then lowest first, then cleared. */
export function nextColumnSort(current: OverallProgressColumnSort | null, key: string): OverallProgressColumnSort | null {
  if (!current || current.key !== key) return { key, descending: true };
  return current.descending ? { key, descending: false } : null;
}

function stageSortValue(cell: StageProgressDisplay): number | null {
  if (cell.stage === "-") return null;
  return Number(cell.stage) * 100 + Number(cell.nextStageProgress ?? 0);
}

/** "-" always sorts last. Ties keep the incoming order, so the Sort by choice breaks them. An unknown column key leaves rows as given. */
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
export function buildOverallProgressRows(grouped: Record<string, SkillHeatMapData>, members: Array<{ memberId: string; displayName: string }>): OverallProgressRow[] {
  const sections = orderedSections(grouped);
  const membersBySection = sections.map((section) => new Map<string, SectionMemberRow>(section.members.map((m) => [m.memberId, m])));

  return members.map(({ memberId, displayName }) => ({
    memberId,
    displayName,
    cells: sections.map((section, index) => {
      const member = membersBySection[index].get(memberId);
      if (!member) return NO_PROGRESS;
      return formatStageProgress(member.highestStage, member.stages, section.stream !== null, section.trunkStageCount, member.trunkFullyAwarded);
    }),
  }));
}
