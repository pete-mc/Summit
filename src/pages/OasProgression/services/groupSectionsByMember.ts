import type { HeatMapSection, SectionMemberRow, SkillHeatMapData } from "./groupRowsForHeatMap";

/**
 * Inverts the heat map's grouping: a section per MEMBER listing their skills, rather than a
 * section per skill listing members.
 *
 * Answers "what has this member done across everything?" — the question asked when talking to one
 * member — where the skill-first view answers "how is the unit doing at Bushwalking?".
 *
 * This is a pure regroup of data already in memory. groupRowsForHeatMap() returns sections that
 * each carry their own members with their own stages, so nothing new is fetched and neither
 * buildOASProgressionRows() nor the API layer changes.
 */

/** One skill's row within a member's section — the same per-section member data, relabelled. */
export interface MemberSkillRow {
  /** Stable key for v-for: a member appears once per (skill, stream) section. */
  key: string;
  skill: string;
  /** null for the skill's base/trunk section; the stream name for a forked section. */
  stream: string | null;
  /** Whether this row came from a forked stream section, which gates displayed progress. */
  isStreamSection: boolean;
  trunkStageCount: number;
  /** The member's own data for this section, unchanged — cell rendering is identical either way. */
  member: SectionMemberRow;
}

export interface MemberSectionView {
  memberId: string;
  /** Convenience display/search string — see OASProgressionRow.memberName's own comment on why sorting/initials must use firstName/lastName instead. */
  memberName: string;
  firstName: string;
  lastName: string;
  patrolName: string | null;
  skillRows: MemberSkillRow[];
}

/**
 * Regroups skill-first heat map data into member-first sections.
 *
 * `skillOrder` fixes the order skills appear in within each member, so every member's block reads
 * the same way down the page — passing the caller's already-ordered skill list keeps that
 * consistent with the skill-first view rather than re-deriving it here.
 *
 * Members with no progress anywhere are INCLUDED, with their skill rows rendering empty. Absence
 * of progress is the useful signal in this view: a member who has started nothing is exactly who
 * a leader is looking for, and hiding them would make them invisible in the view most likely to
 * be used to find them. The hideEmptyStreams filter remains an explicit opt-in on top of this.
 */
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

/** True when a member has no answered or awarded cell anywhere across their skill rows. */
export function memberHasNoProgress(section: MemberSectionView): boolean {
  return section.skillRows.every((row) => row.member.stages.every((stage) => stage.cells.every((cell) => !cell.answered && !cell.awarded)));
}
