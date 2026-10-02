import type { HeatMapSection, SectionMemberRow } from "./groupRowsForHeatMap";

const UNASSIGNED_PATROL = "Unassigned";

export interface PatrolGroup {
  patrolName: string;
  members: SectionMemberRow[];
}

/** The minimal shape filterMembersByPatrol/groupMembersByPatrol actually need — both are generic over this rather than hard-typed to SectionMemberRow, so OASWorksheetsVue's WorksheetMember (a different, narrower shape) can reuse them directly instead of being force-fit into SectionMemberRow's heat-map-specific fields (highestStage, stages, trunkFullyAwarded) it has no use for. See .claude/OASWorksheets/PLAN_STAGE_1.md §2. */
interface HasPatrolName {
  patrolName: string | null;
}

export interface PatrolGroupOf<T extends HasPatrolName> {
  patrolName: string;
  members: T[];
}

/**
 * True stream names ("Bushwalking", "Bushcraft"...), NOT `OASProgressionRow.stream` (which is
 * actually Terrain's field name for what the UI calls "Skill" — see PLAN_STAGE_3.md round 3).
 * Kept here rather than re-exported from OASHeatMap.tsx to avoid a component<->service import cycle.
 */
export const OAS_SKILLS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

/** Filters a section's members down to only those in one of the selected patrols. Empty selection = no filter. */
export function filterMembersByPatrol<T extends HasPatrolName>(members: T[], selectedPatrols: string[]): T[] {
  if (selectedPatrols.length === 0) {
    return members;
  }
  return members.filter((m) => m.patrolName !== null && selectedPatrols.includes(m.patrolName));
}

/**
 * Groups a section's members by patrol, alphabetically by patrol name — member order WITHIN each
 * patrol group is preserved from the input array (callers should sort members before grouping if
 * a specific within-patrol order, e.g. via sortMembers, is wanted). Members lacking a patrol are
 * collected into a trailing "Unassigned" group — unless NO member in the section has a patrol at
 * all, in which case grouping would add noise for no benefit, so a single unlabeled group
 * containing everyone is returned instead.
 */
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

/** All distinct non-null patrol names present across a set of sections, alphabetically sorted. */
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

/** Slices a list of stage numbers down to those within [min, max] (inclusive). Streams with a lower max simply end up with fewer/no columns past their own range — no special-casing needed since this just filters the stage list already computed for that stream/section. */
export function sliceStagesToRange(allStages: number[], stageRange: [number, number]): number[] {
  const [min, max] = stageRange;
  return allStages.filter((stage) => stage >= min && stage <= max);
}

export interface StageProgressDisplay {
  /** The section's displayed stage number (or null if none), formatted as a plain string, e.g. "5" or "-". */
  stage: string;
  /**
   * Two-digit count of i-statements with any progress (answered or awarded) in the stage
   * immediately above the member's highest AWARDED stage, WITHIN THE SAME SECTION only (a
   * section's own stage list may not include every stage implied by a stream's own
   * highestStage) — null when there's nothing to show (no next stage in this section, or it has
   * zero i-statements with any progress yet).
   */
  nextStageProgress: string | null;
}

interface NextStageProgress {
  ticked: number;
  total: number;
}

/**
 * Ticked (answered or awarded) count and total i-statement count for the stage immediately above
 * `highestStage`, scoped to `stages` — null when there's no next stage or it has zero ticks yet.
 */
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

/**
 * Zero-padded count of i-statements ticked (answered or awarded) in the stage immediately above
 * `highestStage`, scoped to `stages` — null when there's no next stage or it has zero ticks yet
 * (see nextStageProgress). The stage's total i-statement count (also available from
 * nextStageProgress) is deliberately not shown here — see stageProgressProportion for where the
 * total is still used, as a sort tiebreaker.
 */
function nextStageTickProgress(highestStage: number, stages: SectionMemberRow["stages"]): string | null {
  const progress = nextStageProgress(highestStage, stages);
  if (!progress) {
    return null;
  }
  return String(progress.ticked).padStart(2, "0");
}

/**
 * Builds the "Stage X.xx" display for one section.
 *
 * - Non-stream sections (a non-streamed skill, or the base/trunk section of a skill that forks
 *   into streams): plain highest-awarded-stage number, with xx = next-stage tick count as above.
 * - Stream sections: gated — until the skill's trunk has been fully awarded for this member,
 *   nothing is shown ("-"), since a stream can't be started before its base skill is done. Once
 *   unlocked, the WHOLE NUMBER is the skill's trunk stage count as a FLOOR — it only rises once
 *   the stream itself has a fully AWARDED stage (merely answered/in-progress cells in the stage
 *   right above the trunk don't move the whole number, only its .xx). So a member with the trunk
 *   done and stage 4 merely answered (not awarded) still shows "3.xx", but a member with stream
 *   stage 6 fully awarded shows "6" (or "6.xx" if stage 7 has ticks) — never a number below the
 *   trunk floor, and never the trunk number once the stream itself has overtaken it.
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

/** Exported for OASWorksheetsVue's own member sort (.claude/OASWorksheets/PLAN_STAGE_1.md §2) — name-splitting rules stay in one place rather than growing a second copy. */
export function lastNameOf(memberName: string): string {
  const parts = memberName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : memberName;
}

/** Exported for OASWorksheetsVue — see lastNameOf's comment above. */
export function firstNameOf(memberName: string): string {
  return memberName.trim().split(/\s+/)[0] ?? memberName;
}

/**
 * The stage value a member should be sorted/ranked by, matching what's actually displayed: for a
 * stream section this is null (sorts last, same as "no progress") whenever the section is gated
 * ("-" is shown); once unlocked it's the same floored `max(trunkStageCount, own highestStage)`
 * value formatStageProgress would show as the whole number, not the raw (possibly lower) highestStage.
 */
function effectiveHighestStage(member: SectionMemberRow, isStreamSection: boolean, trunkStageCount: number): number | null {
  if (!isStreamSection) {
    return member.highestStage;
  }
  if (!member.trunkFullyAwarded) {
    return null;
  }
  return member.highestStage === null ? trunkStageCount : Math.max(trunkStageCount, member.highestStage);
}

/**
 * Proportion (ticked/total, 0..1) used as the Stage yy/nn tiebreaker — same "next stage above
 * highestStage" cells the displayed yy/nn is built from, but as a raw fraction (0 when there's
 * nothing to show) so members are ranked by how close they are to finishing the next stage,
 * not by its raw i-statement count (a bigger next stage shouldn't out-rank a smaller one that's
 * proportionally further along).
 */
function stageProgressProportion(member: SectionMemberRow, isStreamSection: boolean, trunkStageCount: number): number {
  const effectiveStage = effectiveHighestStage(member, isStreamSection, trunkStageCount);
  if (effectiveStage === null) {
    return 0;
  }
  const progress = nextStageProgress(effectiveStage, member.stages);
  return progress ? progress.ticked / progress.total : 0;
}

/**
 * Sorts a section's (or patrol group's) members by the chosen key. "stageProgress" sorts by
 * (section-appropriate) highestStage descending first (higher stage ranks first, matching how
 * members are usually scanned "who's furthest along"), then by next-stage progress *proportion*
 * (ticked/total, not the raw ticked count shown in the .xx display) descending as a tiebreaker
 * within the same stage — a member with 5 of 6 i-statements ticked in the next stage (83%) ranks
 * above one with 6 of 20 (30%) even though 6 > 5, since the next stage's own size can differ
 * between members, and both rank above a plain "5" with no next-stage progress yet. A null (or
 * gated-to-null, for a locked stream section) highestStage sorts last. `isStreamSection`/
 * `trunkStageCount` describe the section being sorted,
 * matching the same params `formatStageProgress` uses to render it.
 */
export function sortMembers(members: SectionMemberRow[], sortBy: MemberSortBy, isStreamSection = false, trunkStageCount = 0): SectionMemberRow[] {
  const sorted = members.slice();
  switch (sortBy) {
    case "lastName":
      sorted.sort((a, b) => lastNameOf(a.memberName).localeCompare(lastNameOf(b.memberName)) || firstNameOf(a.memberName).localeCompare(firstNameOf(b.memberName)));
      break;
    case "firstName":
      sorted.sort((a, b) => firstNameOf(a.memberName).localeCompare(firstNameOf(b.memberName)) || lastNameOf(a.memberName).localeCompare(lastNameOf(b.memberName)));
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
