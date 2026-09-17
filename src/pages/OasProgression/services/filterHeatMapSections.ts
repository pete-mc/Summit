import type { HeatMapSection, SectionMemberRow } from "./groupRowsForHeatMap";

const UNASSIGNED_PATROL = "Unassigned";

export interface PatrolGroup {
  patrolName: string;
  members: SectionMemberRow[];
}

/**
 * True stream names ("Bushwalking", "Bushcraft"...), NOT `OASProgressionRow.stream` (which is
 * actually Terrain's field name for what the UI calls "Skill" — see PLAN_STAGE_3.md round 3).
 * Kept here rather than re-exported from OASHeatMap.tsx to avoid a component<->service import cycle.
 */
export const OAS_SKILLS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

/** Filters a section's members down to only those in one of the selected patrols. Empty selection = no filter. */
export function filterMembersByPatrol(members: SectionMemberRow[], selectedPatrols: string[]): SectionMemberRow[] {
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
export function groupMembersByPatrol(members: SectionMemberRow[]): PatrolGroup[] {
  if (members.every((m) => m.patrolName === null)) {
    return [{ patrolName: "", members }];
  }

  const groups = new Map<string, SectionMemberRow[]>();
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
  /** The member's highest awarded stage (or null if none), formatted as a plain string, e.g. "5" or "-". */
  stage: string;
  /**
   * Two-digit count of i-statements with any progress (answered or awarded) in the stage
   * immediately above `stage`, WITHIN THE SAME SECTION only (a section's own stage list may not
   * include every stage the member's whole-skill highestStage implies, e.g. a shorter forked
   * stream) — null when there's nothing to show (no next stage in this section, or it has zero
   * i-statements with any progress yet).
   */
  nextStageProgress: string | null;
}

/**
 * Builds the "Stage 5.xx" display: xx is a zero-padded count of i-statements ticked (answered or
 * awarded) in the stage immediately above the member's highest AWARDED stage, scoped to the
 * member's stages as passed in (i.e. one section's own stage list) — never shown when the member
 * has no highestStage, no next stage exists in this section, or that next stage has zero progress.
 */
export function formatStageProgress(highestStage: number | null, stages: SectionMemberRow["stages"]): StageProgressDisplay {
  if (highestStage === null) {
    return { stage: "-", nextStageProgress: null };
  }

  const nextStage = stages.find((s) => s.stage === highestStage + 1);
  if (!nextStage) {
    return { stage: String(highestStage), nextStageProgress: null };
  }

  const tickedCount = nextStage.cells.filter((c) => c.answered || c.awarded).length;
  if (tickedCount === 0) {
    return { stage: String(highestStage), nextStageProgress: null };
  }

  return { stage: String(highestStage), nextStageProgress: String(tickedCount).padStart(2, "0") };
}

export type MemberSortBy = "lastName" | "firstName" | "stageProgress";

function lastNameOf(memberName: string): string {
  const parts = memberName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : memberName;
}

function firstNameOf(memberName: string): string {
  return memberName.trim().split(/\s+/)[0] ?? memberName;
}

/** Count used as the Stage.xx tiebreaker — same "next stage above highestStage" cells this member's displayed .xx is built from, but as a raw number (0 when there's nothing to show) rather than a padded/null display string. */
function stageProgressCount(member: SectionMemberRow): number {
  const progress = formatStageProgress(member.highestStage, member.stages);
  return progress.nextStageProgress ? Number(progress.nextStageProgress) : 0;
}

/**
 * Sorts a section's (or patrol group's) members by the chosen key. "stageProgress" sorts by
 * highestStage descending first (higher stage ranks first, matching how members are usually
 * scanned "who's furthest along"), then by the Stage.xx progress count descending as a
 * tiebreaker within the same stage — a member showing "5.08" ranks above "5.02", and both rank
 * above a plain "5" with no next-stage progress yet. A null highestStage sorts last.
 */
export function sortMembers(members: SectionMemberRow[], sortBy: MemberSortBy): SectionMemberRow[] {
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
        if (a.highestStage === null && b.highestStage === null) return 0;
        if (a.highestStage === null) return 1;
        if (b.highestStage === null) return -1;
        if (a.highestStage !== b.highestStage) return b.highestStage - a.highestStage;
        return stageProgressCount(b) - stageProgressCount(a);
      });
      break;
  }
  return sorted;
}
