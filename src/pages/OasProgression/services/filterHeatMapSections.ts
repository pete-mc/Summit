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

/**
 * Zero-padded count of i-statements ticked (answered or awarded) in the stage immediately above
 * `highestStage`, scoped to `stages` — null when there's no next stage or it has zero progress.
 */
function nextStageTickProgress(highestStage: number, stages: SectionMemberRow["stages"]): string | null {
  const nextStage = stages.find((s) => s.stage === highestStage + 1);
  if (!nextStage) {
    return null;
  }

  const tickedCount = nextStage.cells.filter((c) => c.answered || c.awarded).length;
  if (tickedCount === 0) {
    return null;
  }

  return String(tickedCount).padStart(2, "0");
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

function lastNameOf(memberName: string): string {
  const parts = memberName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : memberName;
}

function firstNameOf(memberName: string): string {
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

/** Count used as the Stage.xx tiebreaker — same "next stage above highestStage" cells this member's displayed .xx is built from, but as a raw number (0 when there's nothing to show) rather than a padded/null display string. */
function stageProgressCount(member: SectionMemberRow, isStreamSection: boolean, trunkStageCount: number): number {
  const progress = formatStageProgress(member.highestStage, member.stages, isStreamSection, trunkStageCount, member.trunkFullyAwarded);
  return progress.nextStageProgress ? Number(progress.nextStageProgress) : 0;
}

/**
 * Sorts a section's (or patrol group's) members by the chosen key. "stageProgress" sorts by
 * (section-appropriate) highestStage descending first (higher stage ranks first, matching how
 * members are usually scanned "who's furthest along"), then by the Stage.xx progress count
 * descending as a tiebreaker within the same stage — a member showing "5.08" ranks above "5.02",
 * and both rank above a plain "5" with no next-stage progress yet. A null (or gated-to-null, for
 * a locked stream section) highestStage sorts last. `isStreamSection`/`trunkStageCount` describe
 * the section being sorted, matching the same params `formatStageProgress` uses to render it.
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
        return stageProgressCount(b, isStreamSection, trunkStageCount) - stageProgressCount(a, isStreamSection, trunkStageCount);
      });
      break;
  }
  return sorted;
}
