import type { OASProgressionRow } from "./buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

export interface HeatMapCell {
  inputId: string;
  iStatement: string;
  /** e.g. "Plan", "Do", "Review" — the template's input-group title this i-statement belongs to. */
  inputGroup: string;
  answered: boolean;
  awarded: boolean;
  date: string | null;
}

export interface HeatMapStage {
  stage: number;
  cells: HeatMapCell[];
  complete: boolean;
}

export interface SectionMemberRow {
  memberId: string;
  memberName: string;
  patrolName: string | null;
  /** The member's highest AWARDED stage within THIS section only (base section: trunk stages only; a stream section: that stream's own stages only). */
  highestStage: number | null;
  stages: HeatMapStage[];
  /** Whether this member has fully awarded every trunk stage of the skill — gates a stream section's displayed progress. Always true/false consistently per member per skill; unused (but still computed) for the base section itself. */
  trunkFullyAwarded: boolean;
}

export interface HeatMapSection {
  skill: string;
  /** null for the base/trunk section (the skill's own name, before any fork); the stream name for a forked section. */
  stream: string | null;
  /** Whether every member has zero progress across this section's own stages — candidate for hide-by-default. Never true for the base section. */
  isEmpty: boolean;
  members: SectionMemberRow[];
  /** Number of stages in the skill's trunk before it forks into streams (or the skill's whole stage count if it never forks). Same value across every section of a skill. */
  trunkStageCount: number;
}

export interface SkillHeatMapData {
  sections: HeatMapSection[];
  maxStage: number;
}

function buildStages(rows: OASProgressionRow[]): HeatMapStage[] {
  const byStage = new Map<number, OASProgressionRow[]>();
  rows.forEach((row) => {
    const existing = byStage.get(row.stage);
    if (existing) {
      existing.push(row);
    } else {
      byStage.set(row.stage, [row]);
    }
  });

  return Array.from(byStage.entries())
    .sort(([a], [b]) => a - b)
    .map(([stage, stageRows]) => {
      const cells: HeatMapCell[] = stageRows.map((r) => ({
        inputId: r.inputId,
        iStatement: r.iStatement,
        inputGroup: r.inputGroup,
        answered: r.answered,
        awarded: r.awarded,
        date: r.date,
      }));
      const complete = cells.length > 0 && cells.every((c) => c.awarded);
      return { stage, cells, complete };
    });
}

/** Highest stage that has itself been AWARDED (every i-statement awarded), matching
 * OAS Summary's semantics — an in-progress stage does not count toward the Stage value. */
function highestStageOf(stages: HeatMapStage[]): number | null {
  return stages.reduce<number | null>((highest, stage) => {
    if (!stage.complete) {
      return highest;
    }
    return highest === null || stage.stage > highest ? stage.stage : highest;
  }, null);
}

/**
 * Groups tidy progression rows into per-skill heat-map data, laid out as independent
 * "sections": one section per (skill, stream) pair, each listing EVERY member (even those
 * with zero progress in that particular section) so a leader can see the whole roster under
 * every stream. `trunkStageCounts` (keyed by skill, i.e. row.stream) comes from the OAS
 * tree's fixed structure (see getTrunkStageCount) — it tells us how many stages belong to
 * the shared base section before a skill forks into named streams (row.branch).
 */
export function groupRowsForHeatMap(rows: OASProgressionRow[], trunkStageCounts: Record<string, number>, members: TerrainUnitMember[]): Record<string, SkillHeatMapData> {
  const result: Record<string, SkillHeatMapData> = {};

  const memberOrder = members.slice().sort((a, b) => (a.first_name + " " + a.last_name).localeCompare(b.first_name + " " + b.last_name));

  const bySkill = new Map<string, OASProgressionRow[]>();
  rows.forEach((row) => {
    const existing = bySkill.get(row.stream);
    if (existing) {
      existing.push(row);
    } else {
      bySkill.set(row.stream, [row]);
    }
  });

  bySkill.forEach((skillRows, skill) => {
    const trunkStageCount = trunkStageCounts[skill] ?? 0;

    const trunkRows = skillRows.filter((r) => r.stage <= trunkStageCount);
    const forkedRows = skillRows.filter((r) => r.stage > trunkStageCount);

    // Whether each member has fully awarded every trunk stage — gates a stream section's
    // displayed progress (a stream shows nothing until the base skill's trunk is done).
    const trunkRowsByMember = new Map<string, OASProgressionRow[]>();
    trunkRows.forEach((row) => {
      const existing = trunkRowsByMember.get(row.memberId);
      if (existing) {
        existing.push(row);
      } else {
        trunkRowsByMember.set(row.memberId, [row]);
      }
    });
    const trunkFullyAwardedByMember = new Map<string, boolean>();
    trunkRowsByMember.forEach((memberRows, memberId) => {
      trunkFullyAwardedByMember.set(memberId, highestStageOf(buildStages(memberRows)) === trunkStageCount);
    });

    const streamNames = Array.from(new Set(forkedRows.map((r) => r.branch))).sort((a, b) => a.localeCompare(b));

    function buildSection(stream: string | null, sectionRows: OASProgressionRow[]): HeatMapSection {
      const rowsByMemberId = new Map<string, OASProgressionRow[]>();
      sectionRows.forEach((row) => {
        const existing = rowsByMemberId.get(row.memberId);
        if (existing) {
          existing.push(row);
        } else {
          rowsByMemberId.set(row.memberId, [row]);
        }
      });

      const sectionMembers: SectionMemberRow[] = memberOrder.map((member) => {
        const memberRows = rowsByMemberId.get(member.id) ?? [];
        const stages = buildStages(memberRows);
        return {
          memberId: member.id,
          memberName: member.first_name + " " + member.last_name,
          patrolName: member.patrol?.name ?? null,
          highestStage: highestStageOf(stages),
          stages,
          trunkFullyAwarded: trunkFullyAwardedByMember.get(member.id) ?? false,
        };
      });

      const isEmpty = stream !== null && sectionMembers.every((m) => m.stages.every((s) => s.cells.every((c) => !c.answered && !c.awarded)));

      return { skill, stream, isEmpty, members: sectionMembers, trunkStageCount };
    }

    const sections: HeatMapSection[] = [
      buildSection(null, trunkRows),
      ...streamNames.map((stream) =>
        buildSection(
          stream,
          forkedRows.filter((r) => r.branch === stream),
        ),
      ),
    ];

    let maxStage = 0;
    sections.forEach((section) => {
      section.members.forEach((m) => {
        m.stages.forEach((s) => {
          if (s.stage > maxStage) {
            maxStage = s.stage;
          }
        });
      });
    });

    result[skill] = { sections, maxStage };
  });

  return result;
}
