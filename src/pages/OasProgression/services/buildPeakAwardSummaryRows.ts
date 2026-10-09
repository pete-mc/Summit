import type { OASProgressionRow } from "./buildOASProgressionRows";
import { OAS_STREAMS } from "./buildOASProgressionRows";
import type { PeakAwardRequirement } from "../data/peakAwardRequirements";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";

const CORE_SKILLS = ["bushcraft", "bushwalking", "camping"] as const;
type CoreSkill = (typeof CORE_SKILLS)[number];

/** One fully-awarded stage, with the info needed to build a tooltip for it. */
export interface StageAward {
  stream: string;
  /**
   * The tree branch this stage belongs to — distinct from `stream` once a skill forks (e.g.
   * bushcraft's "pioneering" vs "survival-skills" branches both exist at stage 4+, each with
   * their own stage numbering that can overlap the other branch's). MUST be part of a stage's own
   * identity: two different branches can both have an (unrelated) "stage 4", so grouping by
   * (stream, stage) alone — without branch — would wrongly merge rows from both branches into one
   * award, corrupting "every cell awarded" and silently changing every count downstream. See
   * groupRowsForHeatMap.ts's own trunk/branch section split, which this mirrors.
   */
  branch: string;
  stage: number;
  /** The section this stage was awarded in — may be an earlier (lower) section than the unit's
   *  current one for Core Skills, which is a lifetime check; always the current section for a
   *  Progressions/Special award, since those are filtered to the current section up front. */
  section: string | null;
  date: string | null;
}

export interface PeakAwardBox {
  met: boolean;
  /** The award this box represents, when met — null for an unmet box (nothing to show a tooltip for). */
  award: StageAward | null;
}

export interface PeakAwardCoreSkill {
  skill: CoreSkill;
  requiredStage: number;
  highestAwardedStage: number;
  /** One entry per required stage; boxes[i] represents stage (i+1). */
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
  /** Always 3 entries, in CORE_SKILLS order: bushcraft, bushwalking, camping. */
  coreSkills: PeakAwardCoreSkill[];
  totalProgressions: number;
  requiredProgressions: number;
  /** One entry per required progression; boxes[i] represents the (i+1)th progression earned, in stream order. */
  progressionBoxes: PeakAwardBox[];
  /** null when the section has no Special condition. */
  special: PeakAwardSpecial | null;
  /**
   * Overall progress toward the Peak Award, for the "Progress" column: a simple sum of every
   * condition box across every column (Core Skills ×3, Progressions, Special) — e.g. for
   * Venturer, 5 + 5 + 5 + 12 + 4 = 31 total boxes. `progressScore` is how many of those are met
   * (never more than `progressTotal`); `progressPercent` is the truncated (not rounded)
   * percentage, 0 when `progressTotal` is 0 (defensive only — every real requirement has at least
   * one box). Per the user's own spec (2026-10-09).
   */
  progressScore: number;
  progressTotal: number;
  progressPercent: number;
}

/**
 * Every fully-awarded stage per member+stream+branch, across the member's WHOLE OAS history
 * (every section they've ever been in) — a stage counts once every one of its rows is awarded,
 * matching highestStageOf()'s own "every i-statement in the stage awarded" rule in
 * groupRowsForHeatMap.ts, just computed directly here so the award's own section/date can be
 * carried alongside the stage number for tooltips (groupRowsForHeatMap's HeatMapStage does not
 * surface either). Grouped by (memberId, stream, BRANCH, stage) — branch is required in the key,
 * not just stream+stage, since two different branches of a forked skill (e.g. bushcraft's
 * "pioneering" vs "survival-skills") both have their own stage 4+, and merging their rows
 * together under a bare (stream, stage) key would corrupt "every cell awarded" for both.
 */
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
      // Every cell of one stage is stamped from the same achievement record (see
      // applyAchievementsToMatrix), so section/date are consistent across cells — any cell's
      // value represents the whole stage.
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

/**
 * Sorts Peak Award summary rows by name or by overall Progress — unlike the heat map's own
 * sortMembers(), which supports "stageProgress" instead of "progress" (meaningless here: a Peak
 * Award summary row has no single "current stage" the way a heat map section does). "progress"
 * sorts by progressScore descending (furthest along first, matching how a leader scans "who's
 * closest"), tie-broken by firstName/lastName so the order is stable rather than arbitrary
 * between members on the same score.
 */
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

/**
 * Builds one Peak Award summary row per member — pure regroup/aggregation of data already in
 * memory (the same OASProgressionRow[] the heat map renders from), no fetching. `currentSection`
 * scopes Progressions/Special to achievements earned in that section only — per the user's own
 * instruction (2026-10-08): "Progressions must be made in the unit they are currently in... don't
 * count stages made in lower sections" (no rollover-progressions concept exists yet). Core Skills
 * stays a lifetime check: reaching a stage counts regardless of which section it happened in. See
 * .claude/OASProgression/PLAN_PEAK_AWARD_SUMMARY.md for the rule this encodes.
 */
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

    // Core Skills needs every stage UP TO the required one, not just the highest — built from the
    // member's full (lifetime) award list for this stream so each box can show its own
    // award/tooltip. See buildPeakAwardSummaryRows's own doc comment on why this is a lifetime
    // check, unlike Progressions/Special below.
    const coreSkills = CORE_SKILLS.map((skill) =>
      buildCoreSkill(
        skill,
        requirement.coreSkillStage,
        allAwards.filter((a) => a.stream === skill),
      ),
    );

    // Progressions: every current-section award across all 9 streams, in a stable (stream, stage)
    // order, one box per award — deliberately NOT a per-stream cumulative count (see
    // buildCoreSkill's own lifetime-vs-current-section split above).
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

    // Overall "Progress" column: every condition box across every column, counted once each —
    // Special's own boxes ARE a subset of the Progressions achievements (see the rule's own
    // "Special progressions also count toward the total" composition, PLAN_PEAK_AWARD_SUMMARY.md),
    // but here they are deliberately counted again as their own separate boxes, matching the
    // user's own worked example (Venturer: 5+5+5+12+4 = 31, not 5+5+5+12 = 27) — "Progress" sums
    // the boxes actually drawn on screen, not de-duplicated underlying achievements.
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
