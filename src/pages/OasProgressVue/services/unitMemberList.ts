import type { TerrainUnitMember } from "@/types/terrainTypes";
import { filterMembersByPatrol } from "@/pages/OasProgress/services/filterHeatMapSections";

export interface UnitMemberListItem {
  memberId: string;
  firstName: string;
  lastName: string;
  memberName: string;
  patrolName: string | null;
}

interface FilterableMember {
  memberName: string;
  patrolName: string | null;
}

export function buildUnitMemberList(members: TerrainUnitMember[]): UnitMemberListItem[] {
  return members.map((member) => ({
    memberId: member.id,
    firstName: member.first_name,
    lastName: member.last_name,
    memberName: `${member.first_name} ${member.last_name}`,
    patrolName: member.patrol?.name ?? null,
  }));
}

/** Gotcha: an empty patrol selection shows nobody here, unlike filterMembersByPatrol where it means everyone. */
export function filterMemberRows<T extends FilterableMember>(rows: T[], memberFilter: string, selectedPatrols: string[]): T[] {
  if (selectedPatrols.length === 0) {
    return [];
  }
  const needle = memberFilter.trim().toLowerCase();
  const nameFiltered = needle ? rows.filter((row) => row.memberName.toLowerCase().includes(needle)) : rows;
  return filterMembersByPatrol(nameFiltered, selectedPatrols);
}

export function sortMembersByName<T extends { firstName: string; lastName: string }>(rows: T[], sortBy: "firstName" | "lastName"): T[] {
  const byFirst = (a: T, b: T) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
  const byLast = (a: T, b: T) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
  return rows.slice().sort(sortBy === "lastName" ? byLast : byFirst);
}
