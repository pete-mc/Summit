import { buildUnitMemberList, filterMemberRows, sortMembersByName } from "@/pages/OasProgressVue/services/unitMemberList";
import type { TerrainUnitMember } from "@/types/terrainTypes";

function member(id: string, first: string, last: string, patrol: string | null): TerrainUnitMember {
  return { id, first_name: first, last_name: last, patrol: patrol ? { name: patrol } : null } as unknown as TerrainUnitMember;
}

const list = buildUnitMemberList([member("m1", "Zoe", "Adams", "Eagles"), member("m2", "Amy", "Young", null), member("m3", "Ben", "Adams", "Wolves")]);

describe("buildUnitMemberList", () => {
  it("keeps Terrain's separate first and last names, and null for no patrol", () => {
    expect(list[1]).toEqual({ memberId: "m2", firstName: "Amy", lastName: "Young", memberName: "Amy Young", patrolName: null });
  });
});

describe("filterMemberRows", () => {
  it("matches the member filter anywhere in the full name, ignoring case and spaces around it", () => {
    expect(filterMemberRows(list, "  ADAMS ", ["Eagles", "Wolves", "Unassigned"]).map((m) => m.memberId)).toEqual(["m1", "m3"]);
  });

  it("filters by patrol, with Unassigned matching members who have none", () => {
    expect(filterMemberRows(list, "", ["Unassigned"]).map((m) => m.memberId)).toEqual(["m2"]);
  });

  it("shows nobody when no patrol is selected", () => {
    expect(filterMemberRows(list, "", [])).toEqual([]);
  });
});

describe("sortMembersByName", () => {
  it("sorts by first name, then last name", () => {
    expect(sortMembersByName(list, "firstName").map((m) => m.memberId)).toEqual(["m2", "m3", "m1"]);
  });

  it("sorts by last name, then first name, without changing the input", () => {
    expect(sortMembersByName(list, "lastName").map((m) => m.memberId)).toEqual(["m3", "m1", "m2"]);
    expect(list.map((m) => m.memberId)).toEqual(["m1", "m2", "m3"]);
  });
});
