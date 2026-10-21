import type { OASProgressionRow } from "./buildOASProgressionRows";
import { OAS_STREAMS } from "./buildOASProgressionRows";
import type { PeakAwardRequirement } from "../data/peakAwardRequirements";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";

const CORE_SKILLS = ["bushcraft", "bushwalking", "camping"] as const;
type CoreSkill = (typeof CORE_SKILLS)[number];

export interface StageAward {
  stream: string;
  /** Gotcha: part of a stage's identity. Two branches of a forked skill both have their own "stage 4". Grouping without branch merges them and corrupts every count. */
  branch: string;
  stage: number;
  /** May be a lower section for Core Skills (a lifetime check). */
  section: string | null;
  date: string | null;
}

export interface PeakAwardBox {
  met: boolean;
  award: StageAward | null;
}

export interface PeakAwardCoreSkill {
  skill: CoreSkill;
  requiredStage: number;
  highestAwardedStage: number;
  /** boxes[i] = stage i+1. */
  boxes: PeakAwardBox[];
  met: boolean;
}

export interface PeakAwardSpecial {
  count: number;
  required: number;
  minStage: number;
  boxes: PeakAwardBox[];
  met: boolean;
}

export interface PeakAwardMemberRow {
  memberId: string;
  memberName: string;
  firstName: string;
  lastName: string;
  patrolName: string | null;
  coreSkills: PeakAwardCoreSkill[];
  totalProgressions: number;
  requiredProgressions: number;
  progressionBoxes: PeakAwardBox[];
  special: PeakAwardSpecial | null;
  /** Sum of every drawn box (Venturer: 5+5+5+12+4 = 31). Percent is truncated, not rounded. */
  progressScore: number;
  progressTotal: number;
  progressPercent: number;
}

/** Whole history, all sections. Keyed by member + stream + BRANCH + stage (see StageAward.branch). */
function awardedStagesByMember(rows: OASProgressionRow[]): Map<string, StageAward[]> {
  const byMemberThenKey = new Map<string, Map<string, OASProgressionRow[]>>();

  rows.forEach((row) => {
    const key = `${row.stream}::${row.branch}::${row.stage}`;
    const byKey = byMemberThenKey.get(row.memberId) ?? new Map<string, OASProgressionRow[]>();
    const cells = byKey.get(key) ?? [];
    cells.push(row);
    byKey.set(key, cells);
    byMemberThenKey.set(row.memberId, byKey);
  });

  const result = new Map<string, StageAward[]>();
  byMemberThenKey.forEach((byKey, memberId) => {
    const awards: StageAward[] = [];
    byKey.forEach((cells, key) => {
      if (cells.length === 0 || !cells.every((c) => c.awarded)) {
        return;
      }
      const [stream, branch, stageStr] = key.split("::");
      // All cells of a stage come from one achievement, so any cell's section/date stands for the stage.
      awards.push({ stream, branch, stage: Number(stageStr), section: cells[0].section, date: cells[0].date });
    });
    result.set(memberId, awards);
  });

  return result;
}

function buildCoreSkill(skill: CoreSkill, requiredStage: number, streamAwards: StageAward[]): PeakAwardCoreSkill {
  const awardsByStage = new Map(streamAwards.map((a) => [a.stage, a]));
  const highestAwardedStage = streamAwards.reduce((max, a) => Math.max(max, a.stage), 0);
  const boxes: PeakAwardBox[] = Array.from({ length: requiredStage }, (_, i) => {
    const award = awardsByStage.get(i + 1) ?? null;
    return { met: award !== null, award };
  });
  return { skill, requiredStage, highestAwardedStage, boxes, met: highestAwardedStage >= requiredStage };
}

export type PeakAwardSortBy = "firstName" | "lastName" | "progress";

/** "progress" = score desc, ties broken by name for a stable order. */
export function sortPeakAwardSummaryRows(rowsToSort: PeakAwardMemberRow[], sortBy: PeakAwardSortBy): PeakAwardMemberRow[] {
  const sorted = rowsToSort.slice();
  if (sortBy === "lastName") {
    sorted.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
  } else if (sortBy === "progress") {
    sorted.sort((a, b) => b.progressScore - a.progressScore || a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
  } else {
    sorted.sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));
  }
  return sorted;
}

/** Learning: Progressions/Special only count the current section; Core Skills is a lifetime check. */
export function buildPeakAwardSummaryRows(rows: OASProgressionRow[], members: TerrainUnitMember[], requirement: PeakAwardRequirement, currentSection: TerrainAchievementsSection): PeakAwardMemberRow[] {
  const awardsByMember = awardedStagesByMember(rows);

  return members.map((member) => {
    const allAwards = awardsByMember.get(member.id) ?? [];
    const currentSectionAwards = allAwards.filter((a) => a.section === currentSection);
    const currentSectionAwardsByStream = new Map<string, StageAward[]>();
    currentSectionAwards.forEach((award) => {
      const list = currentSectionAwardsByStream.get(award.stream) ?? [];
      list.push(award);
      currentSectionAwardsByStream.set(award.stream, list);
    });

    const coreSkills = CORE_SKILLS.map((skill) =>
      buildCoreSkill(
        skill,
        requirement.coreSkillStage,
        allAwards.filter((a) => a.stream === skill),
      ),
    );

    // One box per current-section award, in (stream, stage) order.
    const orderedCurrentSectionAwards = OAS_STREAMS.flatMap((stream) => (currentSectionAwardsByStream.get(stream) ?? []).slice().sort((a, b) => a.stage - b.stage));
    const totalProgressions = orderedCurrentSectionAwards.length;
    const progressionBoxes: PeakAwardBox[] = Array.from({ length: requirement.totalProgressions }, (_, i) => {
      const award = orderedCurrentSectionAwards[i] ?? null;
      return { met: award !== null, award };
    });

    let special: PeakAwardSpecial | null = null;
    if (requirement.special) {
      const { minCount, minStage } = requirement.special;
      const qualifyingAwards = orderedCurrentSectionAwards.filter((a) => a.stage >= minStage);
      const count = qualifyingAwards.length;
      const boxes: PeakAwardBox[] = Array.from({ length: minCount }, (_, i) => {
        const award = qualifyingAwards[i] ?? null;
        return { met: award !== null, award };
      });
      special = { count, required: minCount, minStage, boxes, met: count >= minCount };
    }

    // Gotcha: Special boxes are counted again, even though they're a subset of Progressions, because Progress sums the boxes drawn.
    const allBoxes = [...coreSkills.flatMap((c) => c.boxes), ...progressionBoxes, ...(special?.boxes ?? [])];
    const progressTotal = allBoxes.length;
    const progressScore = allBoxes.filter((b) => b.met).length;
    const progressPercent = progressTotal > 0 ? Math.trunc((progressScore / progressTotal) * 100) : 0;

    return {
      memberId: member.id,
      memberName: member.first_name + " " + member.last_name,
      firstName: member.first_name,
      lastName: member.last_name,
      patrolName: member.patrol?.name ?? null,
      coreSkills,
      totalProgressions,
      requiredProgressions: requirement.totalProgressions,
      progressionBoxes,
      special,
      progressScore,
      progressTotal,
      progressPercent,
    };
  });
}
