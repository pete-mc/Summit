import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/**
 * Dev aid: preview a large unit without one, on every tab. In DevTools:
 *   localStorage.setItem("summit.oasWorksheetsVue.devDuplicateMembers", "10")
 * Delete this file and its use in OasProgressVue.ts once no longer needed.
 */
export const DEV_DUPLICATE_MEMBERS_STORAGE_KEY = "summit.oasWorksheetsVue.devDuplicateMembers";

export function readDevDuplicateCount(): number {
  try {
    const raw = window.localStorage.getItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function devId(id: string, copy: number): string {
  return `${id}-dev${copy}`;
}

function devLastName(lastName: string, copy: number): string {
  return `${lastName} (dev ${copy})`;
}

/** Gotcha: the suffix must go on lastName, because sorting and display read firstName/lastName. */
export function duplicateRowsForDevPreview(items: OASProgressRow[], duplicateCount: number): OASProgressRow[] {
  if (duplicateCount <= 0) {
    return items;
  }
  const copies: OASProgressRow[] = [];
  for (let i = 1; i <= duplicateCount; i++) {
    items.forEach((row) => {
      const lastName = devLastName(row.lastName, i);
      copies.push({ ...row, memberId: devId(row.memberId, i), memberName: `${row.firstName} ${lastName}`, lastName });
    });
  }
  return [...items, ...copies];
}

/** Gotcha: the Summary tab joins rows to members by id, so member copies must use the same ids as the row copies. */
export function duplicateUnitMembersForDevPreview(members: TerrainUnitMember[], duplicateCount: number): TerrainUnitMember[] {
  if (duplicateCount <= 0) {
    return members;
  }
  const copies: TerrainUnitMember[] = [];
  for (let i = 1; i <= duplicateCount; i++) {
    members.forEach((member) => {
      copies.push({ ...member, id: devId(member.id, i), last_name: devLastName(member.last_name, i) });
    });
  }
  return [...members, ...copies];
}
