import type { OASProgressionRow } from "./buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

export interface HeatMapCell {
  inputId: string;
  iStatement: string;
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
  firstName: string;
  lastName: string;
  patrolName: string | null;
  /** Highest AWARDED stage within this section only. */
  highestStage: number | null;
  stages: HeatMapStage[];
  /** Gates a stream section's displayed progress. */
  trunkFullyAwarded: boolean;
}

export interface HeatMapSection {
  skill: string;
  /** null for the trunk section. */
  stream: string | null;
  /** Never true for the trunk section. */
  isEmpty: boolean;
  members: SectionMemberRow[];
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

/** An in-progress stage doesn't count (matches OAS Summary). */
function highestStageOf(stages: HeatMapStage[]): number | null {
  return stages.reduce<number | null>((highest, stage) => {
    if (!stage.complete) {
      return highest;
    }
    return highest === null || stage.stage > highest ? stage.stage : highest;
  }, null);
}

/** One section per (skill, stream), each listing EVERY member, even with no progress. */
export function groupRowsForHeatMap(rows: OASProgressionRow[], trunkStageCounts: Record<string, number>, members: TerrainUnitMember[]): Record<string, SkillHeatMapData> {
  const result: Record<string, SkillHeatMapData> = {};

  const memberOrder = members.slice().sort((a, b) => a.first_name.localeCompare(b.first_name) || a.last_name.localeCompare(b.last_name));

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
          firstName: member.first_name,
          lastName: member.last_name,
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
