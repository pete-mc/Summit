import type { HeatMapSection, SectionMemberRow, SkillHeatMapData } from "./groupRowsForHeatMap";

export interface MemberSkillRow {
  key: string;
  skill: string;
  /** null for the trunk section. */
  stream: string | null;
  isStreamSection: boolean;
  trunkStageCount: number;
  member: SectionMemberRow;
}

export interface MemberSectionView {
  memberId: string;
  memberName: string;
  firstName: string;
  lastName: string;
  patrolName: string | null;
  skillRows: MemberSkillRow[];
}

/** Learning: members with no progress are kept. They're exactly who a leader looks for in this view. */
export function groupSectionsByMember(sectionsBySkill: Record<string, SkillHeatMapData>, skillOrder: string[]): MemberSectionView[] {
  const byMember = new Map<string, MemberSectionView>();

  skillOrder.forEach((skill) => {
    const data = sectionsBySkill[skill];
    if (!data) return;

    data.sections.forEach((section: HeatMapSection) => {
      section.members.forEach((member) => {
        let entry = byMember.get(member.memberId);
        if (!entry) {
          entry = {
            memberId: member.memberId,
            memberName: member.memberName,
            firstName: member.firstName,
            lastName: member.lastName,
            patrolName: member.patrolName,
            skillRows: [],
          };
          byMember.set(member.memberId, entry);
        }

        entry.skillRows.push({
          key: `${skill}::${section.stream ?? "base"}`,
          skill,
          stream: section.stream,
          isStreamSection: section.stream !== null,
          trunkStageCount: section.trunkStageCount,
          member,
        });
      });
    });
  });

  return Array.from(byMember.values());
}

export function memberHasNoProgress(section: MemberSectionView): boolean {
  return section.skillRows.every((row) => row.member.stages.every((stage) => stage.cells.every((cell) => !cell.answered && !cell.awarded)));
}
