import type { HeatMapSection, SectionMemberRow } from "./groupRowsForHeatMap";

/** Selectable Patrol-filter item for members with no patrol. */
export const UNASSIGNED_PATROL = "Unassigned";

export interface PatrolGroup {
  patrolName: string;
  members: SectionMemberRow[];
}

interface HasPatrolName {
  patrolName: string | null;
}

export interface PatrolGroupOf<T extends HasPatrolName> {
  patrolName: string;
  members: T[];
}

/** Gotcha: Terrain's `stream` field is what the UI calls "Skill". Kept here to avoid a component↔service import cycle. */
export const OAS_SKILLS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

/** Gotcha: an empty selection means NO filter (everyone). The Vue page treats empty as "show nobody" before calling this. */
export function filterMembersByPatrol<T extends HasPatrolName>(members: T[], selectedPatrols: string[]): T[] {
  if (selectedPatrols.length === 0) {
    return members;
  }
  return members.filter((m) => (m.patrolName === null ? selectedPatrols.includes(UNASSIGNED_PATROL) : selectedPatrols.includes(m.patrolName)));
}

/** Keeps input order within each patrol (sort first). If no member has a patrol, returns one unlabelled group. */
export function groupMembersByPatrol<T extends HasPatrolName>(members: T[]): PatrolGroupOf<T>[] {
  if (members.every((m) => m.patrolName === null)) {
    return [{ patrolName: "", members }];
  }

  const groups = new Map<string, T[]>();
  members.forEach((member) => {
    const key = member.patrolName ?? UNASSIGNED_PATROL;
    const existing = groups.get(key);
    if (existing) {
      existing.push(member);
    } else {
      groups.set(key, [member]);
    }
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === UNASSIGNED_PATROL) return 1;
      if (b === UNASSIGNED_PATROL) return -1;
      return a.localeCompare(b);
    })
    .map(([patrolName, patrolMembers]) => ({ patrolName, members: patrolMembers }));
}

export function collectPatrolNames(sections: HeatMapSection[]): string[] {
  const names = new Set<string>();
  sections.forEach((section) => {
    section.members.forEach((member) => {
      if (member.patrolName !== null) {
        names.add(member.patrolName);
      }
    });
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

/** With one named patrol and no unassigned members there's nothing to filter between. */
export function hasUnassignedMembers(sections: HeatMapSection[]): boolean {
  return sections.some((section) => section.members.some((member) => member.patrolName === null));
}

/** Legacy React page only. The Vue page uses sliceStagesToVisible. */
export function sliceStagesToRange(allStages: number[], stageRange: [number, number]): number[] {
  const [min, max] = stageRange;
  return allStages.filter((stage) => stage >= min && stage <= max);
}

export function sliceStagesToVisible(allStages: number[], visibleStages: number[]): number[] {
  const visibleSet = new Set(visibleStages);
  return allStages.filter((stage) => visibleSet.has(stage));
}

export interface StageProgressDisplay {
  stage: string;
  /** Ticked count in the stage above the highest AWARDED one, within this section only. Null when there's nothing to show. */
  nextStageProgress: string | null;
}

interface NextStageProgress {
  ticked: number;
  total: number;
}

function nextStageProgress(highestStage: number, stages: SectionMemberRow["stages"]): NextStageProgress | null {
  const nextStage = stages.find((s) => s.stage === highestStage + 1);
  if (!nextStage) {
    return null;
  }

  const ticked = nextStage.cells.filter((c) => c.answered || c.awarded).length;
  if (ticked === 0) {
    return null;
  }

  return { ticked, total: nextStage.cells.length };
}

function nextStageTickProgress(highestStage: number, stages: SectionMemberRow["stages"]): string | null {
  const progress = nextStageProgress(highestStage, stages);
  if (!progress) {
    return null;
  }
  return String(progress.ticked).padStart(2, "0");
}

/**
 * "Stage X.xx". Learning: a stream section shows "-" until the trunk is fully awarded, then uses the
 * trunk stage count as a FLOOR. The whole number only rises once a stream stage is fully AWARDED.
 */
export function formatStageProgress(highestStage: number | null, stages: SectionMemberRow["stages"], isStreamSection: boolean, trunkStageCount: number, trunkFullyAwarded: boolean): StageProgressDisplay {
  if (!isStreamSection) {
    if (highestStage === null) {
      return { stage: "-", nextStageProgress: null };
    }
    return { stage: String(highestStage), nextStageProgress: nextStageTickProgress(highestStage, stages) };
  }

  if (!trunkFullyAwarded) {
    return { stage: "-", nextStageProgress: null };
  }

  const effectiveStage = highestStage === null ? trunkStageCount : Math.max(trunkStageCount, highestStage);
  return { stage: String(effectiveStage), nextStageProgress: nextStageTickProgress(effectiveStage, stages) };
}

export type MemberSortBy = "lastName" | "firstName" | "stageProgress";

/** Matches what's displayed: null while a stream is gated, otherwise floored at the trunk count. */
function effectiveHighestStage(member: SectionMemberRow, isStreamSection: boolean, trunkStageCount: number): number | null {
  if (!isStreamSection) {
    return member.highestStage;
  }
  if (!member.trunkFullyAwarded) {
    return null;
  }
  return member.highestStage === null ? trunkStageCount : Math.max(trunkStageCount, member.highestStage);
}

/** Tiebreaker uses the proportion, so a small next stage that's further along outranks a bigger one. */
function stageProgressProportion(member: SectionMemberRow, isStreamSection: boolean, trunkStageCount: number): number {
  const effectiveStage = effectiveHighestStage(member, isStreamSection, trunkStageCount);
  if (effectiveStage === null) {
    return 0;
  }
  const progress = nextStageProgress(effectiveStage, member.stages);
  return progress ? progress.ticked / progress.total : 0;
}

/** "stageProgress": highest effective stage desc, then next-stage proportion desc. Null sorts last. */
export function sortMembers(members: SectionMemberRow[], sortBy: MemberSortBy, isStreamSection = false, trunkStageCount = 0): SectionMemberRow[] {
  const sorted = members.slice();
  switch (sortBy) {
    case "lastName":
      sorted.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
      break;
    case "firstName":
      sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
      break;
    case "stageProgress":
      sorted.sort((a, b) => {
        const aStage = effectiveHighestStage(a, isStreamSection, trunkStageCount);
        const bStage = effectiveHighestStage(b, isStreamSection, trunkStageCount);
        if (aStage === null && bStage === null) return 0;
        if (aStage === null) return 1;
        if (bStage === null) return -1;
        if (aStage !== bStage) return bStage - aStage;
        return stageProgressProportion(b, isStreamSection, trunkStageCount) - stageProgressProportion(a, isStreamSection, trunkStageCount);
      });
      break;
  }
  return sorted;
}
