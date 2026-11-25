import { readDevDuplicateCount, duplicateRowsForDevPreview, duplicateUnitMembersForDevPreview, DEV_DUPLICATE_MEMBERS_STORAGE_KEY } from "@/pages/OasProgressVue/services/devDuplicateMembers";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

function makeRow(overrides: Partial<OASProgressRow> = {}): OASProgressRow {
  return {
    unitId: "u1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "a",
    iStatement: "I know why it is important to stick to trails when outdoors.",
    memberId: "m1",
    memberName: "Amy Scout",
    firstName: "Amy",
    lastName: "Scout",
    patrolName: null,
    answered: false,
    approved: false,
    date: "",
    ...overrides,
  } as OASProgressRow;
}

function makeMember(id: string, firstName: string, lastName: string): TerrainUnitMember {
  return { id, first_name: firstName, last_name: lastName } as TerrainUnitMember;
}

afterEach(() => {
  window.localStorage.removeItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY);
});

describe("readDevDuplicateCount", () => {
  it("returns 0 when the key is absent", () => {
    expect(readDevDuplicateCount()).toBe(0);
  });

  it("returns 0 for a non-numeric, zero, or negative value", () => {
    window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "not-a-number");
    expect(readDevDuplicateCount()).toBe(0);

    window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "0");
    expect(readDevDuplicateCount()).toBe(0);

    window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "-5");
    expect(readDevDuplicateCount()).toBe(0);
  });

  it("returns the parsed integer for a valid positive value", () => {
    window.localStorage.setItem(DEV_DUPLICATE_MEMBERS_STORAGE_KEY, "10");
    expect(readDevDuplicateCount()).toBe(10);
  });
});

describe("duplicateRowsForDevPreview", () => {
  it("passes items through unchanged (same reference) when duplicateCount is 0", () => {
    const items = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
    expect(duplicateRowsForDevPreview(items, 0)).toBe(items);
  });

  it("multiplies the member count, with distinct synthesized memberIds", () => {
    const items = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];

    const result = duplicateRowsForDevPreview(items, 3);

    expect(result).toHaveLength(8);
    const memberIds = result.map((r) => r.memberId);
    expect(new Set(memberIds).size).toBe(8);
    expect(memberIds.filter((id) => id.startsWith("m1-dev"))).toHaveLength(3);
  });

  it("keeps every other field identical on each duplicate", () => {
    const items = [makeRow({ memberId: "m1", patrolName: "Wombats", inputId: "a1", answered: true, approved: true, date: "2024-02-03" })];

    const duplicate = duplicateRowsForDevPreview(items, 1).find((r) => r.memberId === "m1-dev1")!;

    expect(duplicate.patrolName).toBe("Wombats");
    expect(duplicate.inputId).toBe("a1");
    expect(duplicate.answered).toBe(true);
    expect(duplicate.approved).toBe(true);
    expect(duplicate.date).toBe("2024-02-03");
  });

  it("gives each duplicate a distinct lastName kept in sync with memberName, because sorting and display read lastName", () => {
    const result = duplicateRowsForDevPreview([makeRow({ memberId: "m1" })], 2);

    const dup1 = result.find((r) => r.memberId === "m1-dev1")!;
    const dup2 = result.find((r) => r.memberId === "m1-dev2")!;
    expect(dup1.lastName).not.toBe("Scout");
    expect(dup1.lastName).not.toBe(dup2.lastName);
    expect(dup1.firstName).toBe("Amy");
    expect(dup1.memberName).toBe(`${dup1.firstName} ${dup1.lastName}`);
  });
});

describe("duplicateUnitMembersForDevPreview", () => {
  it("passes members through unchanged (same reference) when duplicateCount is 0", () => {
    const members = [makeMember("m1", "Amy", "Scout")];
    expect(duplicateUnitMembersForDevPreview(members, 0)).toBe(members);
  });

  // The Summary tab joins rows to members by id; the dev aid first shipped duplicating rows only, so Summary never grew.
  it("gives member copies the same ids and last names as the matching row copies", () => {
    const members = [makeMember("m1", "Amy", "Scout")];
    const rows = [makeRow({ memberId: "m1" })];

    const memberCopies = duplicateUnitMembersForDevPreview(members, 2);
    const rowCopies = duplicateRowsForDevPreview(rows, 2);

    expect(memberCopies.map((m) => m.id)).toEqual(rowCopies.map((r) => r.memberId));
    expect(memberCopies.map((m) => m.last_name)).toEqual(rowCopies.map((r) => r.lastName));
  });
});
