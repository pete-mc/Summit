import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { groupSectionsByMember, memberHasNoProgress } from "@/pages/OasProgression/services/groupSectionsByMember";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can do a thing",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
    ...overrides,
  };
}

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

/** `members` decides which rows exist; an empty list gives sections with no members. */
function invert(rows: OASProgressionRow[], members: TerrainUnitMember[], skillOrder: string[], trunkCounts: Record<string, number> = {}) {
  const grouped = groupRowsForHeatMap(rows, trunkCounts, members);
  return groupSectionsByMember(grouped, skillOrder);
}

function skillsOf(section: { skillRows: Array<{ skill: string }> }): string[] {
  return section.skillRows.map((row) => row.skill).filter((skill, index, all) => all.indexOf(skill) === index);
}

describe("groupSectionsByMember", () => {
  it("produces one section per member, not per skill", () => {
    const rows = [
      makeRow({ memberId: "member-1", memberName: "Alex Scout", stream: "bushcraft", branch: "bushcraft" }),
      makeRow({ memberId: "member-1", memberName: "Alex Scout", stream: "camping", branch: "camping", inputId: "def456" }),
      makeRow({ memberId: "member-2", memberName: "Sam Scout", stream: "bushcraft", branch: "bushcraft", inputId: "ghi789" }),
    ];
    const members = [makeMember({ id: "member-1" }), makeMember({ id: "member-2", first_name: "Sam" })];

    const sections = invert(rows, members, ["bushcraft", "camping"]);

    expect(sections.map((s) => s.memberId).sort()).toEqual(["member-1", "member-2"]);
  });

  it("lists each member's skills as rows beneath them", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft" }), makeRow({ stream: "camping", branch: "camping", inputId: "def456" })];

    const sections = invert(rows, [makeMember()], ["bushcraft", "camping"]);

    expect(skillsOf(sections[0])).toEqual(["bushcraft", "camping"]);
  });

  it("orders skills the same way for every member", () => {
    const rows = [
      makeRow({ memberId: "member-1", stream: "camping", branch: "camping" }),
      makeRow({ memberId: "member-1", stream: "bushcraft", branch: "bushcraft", inputId: "b" }),
      makeRow({ memberId: "member-2", memberName: "Sam Scout", stream: "bushcraft", branch: "bushcraft", inputId: "c" }),
      makeRow({ memberId: "member-2", memberName: "Sam Scout", stream: "camping", branch: "camping", inputId: "d" }),
    ];
    const members = [makeMember({ id: "member-1" }), makeMember({ id: "member-2", first_name: "Sam" })];

    const sections = invert(rows, members, ["bushcraft", "camping"]);

    sections.forEach((section) => {
      expect(skillsOf(section)).toEqual(["bushcraft", "camping"]);
    });
  });

  it("carries the member's own cell data through unchanged", () => {
    const rows = [makeRow({ answered: true, awarded: true })];

    const sections = invert(rows, [makeMember()], ["bushcraft"]);
    const cells = sections[0].skillRows.flatMap((row) => row.member.stages.flatMap((stage) => stage.cells));

    expect(cells.some((cell) => cell.answered && cell.awarded)).toBe(true);
  });

  it("keeps the member's patrol available on the section", () => {
    const member = makeMember({ patrol: { id: "patrol-1", name: "Tawny" } as TerrainUnitMember["patrol"] });

    const sections = invert([makeRow()], [member], ["bushcraft"]);

    expect(sections[0].patrolName).toBe("Tawny");
  });

  it("gives each skill row a key that distinguishes a stream from its trunk", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 1 }), makeRow({ stream: "bushcraft", branch: "bushcraft-vertical", stage: 4, inputId: "def456" })];

    const sections = invert(rows, [makeMember()], ["bushcraft"], { bushcraft: 3 });
    const keys = sections[0].skillRows.map((r) => r.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("flags stream sections so displayed progress stays gated", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft", stage: 1 }), makeRow({ stream: "bushcraft", branch: "bushcraft-vertical", stage: 4, inputId: "def456" })];

    const sections = invert(rows, [makeMember()], ["bushcraft"], { bushcraft: 3 });

    expect(sections[0].skillRows.some((r) => r.isStreamSection)).toBe(true);
    expect(sections[0].skillRows.some((r) => !r.isStreamSection)).toBe(true);
  });

  it("ignores a skill absent from the order list", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "bushcraft" }), makeRow({ stream: "camping", branch: "camping", inputId: "def456" })];

    const sections = invert(rows, [makeMember()], ["bushcraft"]);

    expect(skillsOf(sections[0])).toEqual(["bushcraft"]);
  });

  it("returns nothing when there is no data", () => {
    expect(groupSectionsByMember({}, ["bushcraft"])).toEqual([]);
  });
});

describe("memberHasNoProgress", () => {
  it("is true for a member who has started nothing", () => {
    const sections = invert([makeRow({ answered: false, awarded: false })], [makeMember()], ["bushcraft"]);

    expect(memberHasNoProgress(sections[0])).toBe(true);
  });

  it("is false once any cell is answered", () => {
    const sections = invert([makeRow({ answered: true })], [makeMember()], ["bushcraft"]);

    expect(memberHasNoProgress(sections[0])).toBe(false);
  });

  it("is false once any cell is awarded", () => {
    const sections = invert([makeRow({ awarded: true })], [makeMember()], ["bushcraft"]);

    expect(memberHasNoProgress(sections[0])).toBe(false);
  });

  it("still includes a no-progress member in the output", () => {
    const rows = [makeRow({ memberId: "member-1", answered: true }), makeRow({ memberId: "member-2", memberName: "Sam Scout", inputId: "def456" })];
    const members = [makeMember({ id: "member-1" }), makeMember({ id: "member-2", first_name: "Sam" })];

    const sections = invert(rows, members, ["bushcraft"]);

    expect(sections).toHaveLength(2);
    expect(sections.find((s) => s.memberId === "member-2")).toBeDefined();
  });
});
