import { type IStatementMatrix, type IStatementRow, type SkillBranchGroup } from "./buildIStatementMatrix";

export const ALL_STAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface IStatementFilters {
  skills: string[];
  stageFrom: number;
  stageTo: number;
  hideEmptyStages: boolean;
  hideEmptyGroups: boolean;
  hideEmptyRows: boolean;
}

export interface VisibleGroup extends SkillBranchGroup {
  visibleStages: number[];
}

export interface FilteredMatrix {
  rows: IStatementRow[];
  groups: VisibleGroup[];
  presentCells: Set<string>;
}

export function cellLookupKey(skill: string, branch: string, stage: number): string {
  return skill + "|" + branch + "|" + stage;
}

/**
 * Order matters and is load-bearing (see .claude/I_Statement/PLAN_STAGE_4.md):
 * filter -> hide rows -> hide stage columns -> hide groups. Hiding rows can empty a
 * column, which is intended; the reverse cannot happen, so one pass suffices.
 */
export function filterIStatementMatrix(matrix: IStatementMatrix, filters: IStatementFilters): FilteredMatrix {
  const skills = new Set(filters.skills);
  const low = Math.min(filters.stageFrom, filters.stageTo);
  const high = Math.max(filters.stageFrom, filters.stageTo);

  const candidateGroups = matrix.groups.filter((group) => skills.has(group.skill)).map((group) => ({ ...group, visibleStages: ALL_STAGES.filter((stage) => stage >= low && stage <= high) }));

  const candidateCells = new Set<string>();
  candidateGroups.forEach((group) => {
    group.visibleStages.forEach((stage) => {
      if (group.stages.includes(stage)) {
        candidateCells.add(cellLookupKey(group.skill, group.branch, stage));
      }
    });
  });

  const presentCells = new Set<string>();
  const rowsWithVisibleCells = matrix.rows.map((row) => {
    const visible = row.cells.map((cell) => cellLookupKey(cell.skill, cell.branch, cell.stage)).filter((key) => candidateCells.has(key));
    visible.forEach((key) => presentCells.add(key));
    return { row, visibleCount: visible.length };
  });

  const rows = filters.hideEmptyRows ? rowsWithVisibleCells.filter((entry) => entry.visibleCount > 0).map((entry) => entry.row) : rowsWithVisibleCells.map((entry) => entry.row);

  // Recomputed against surviving rows only — a row hidden above can empty a column.
  const occupiedCells = new Set<string>();
  rows.forEach((row) => {
    row.cells.forEach((cell) => {
      const key = cellLookupKey(cell.skill, cell.branch, cell.stage);
      if (candidateCells.has(key)) {
        occupiedCells.add(key);
      }
    });
  });

  const groups = candidateGroups
    .map((group) => ({
      ...group,
      visibleStages: filters.hideEmptyStages ? group.visibleStages.filter((stage) => occupiedCells.has(cellLookupKey(group.skill, group.branch, stage))) : group.visibleStages,
    }))
    .filter((group) => !filters.hideEmptyGroups || group.visibleStages.some((stage) => occupiedCells.has(cellLookupKey(group.skill, group.branch, stage))));

  return { rows, groups, presentCells: occupiedCells };
}
