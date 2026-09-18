import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
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

describe("groupRowsForHeatMap", () => {
  it("groups rows by skill (row.stream), producing at least a base section", () => {
    const rows = [makeRow({ memberId: "m2", memberName: "Zara" }), makeRow({ memberId: "m1", memberName: "Alex" })];
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Zara" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(Object.keys(result)).toEqual(["bushcraft"]);
    expect(result.bushcraft.sections).toHaveLength(1);
    expect(result.bushcraft.sections[0].stream).toBeNull();
  });

  it("lists EVERY unit member in a section, even those with zero rows in it", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Zara" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    const base = result.bushcraft.sections.find((s) => s.stream === null);
    expect(base?.members.map((m) => m.memberName).sort()).toEqual(["Alex Scout", "Zara Scout"]);
    const zara = base?.members.find((m) => m.memberId === "m2");
    expect(zara?.stages).toEqual([]);
  });

  it("sorts members alphabetically by name within a section", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m2", first_name: "Zara", last_name: "Ranger" }), makeMember({ id: "m1", first_name: "Alex", last_name: "Scout" })];

    const result = groupRowsForHeatMap(rows, {}, members);

    expect(result.bushcraft.sections[0].members.map((m) => m.memberName)).toEqual(["Alex Scout", "Zara Ranger"]);
  });

  it("creates one section per forked stream in addition to the base section", () => {
    const rows = [makeRow({ stage: 1, branch: "bushcraft" }), makeRow({ stage: 4, branch: "pioneering", inputId: "p1" }), makeRow({ stage: 4, branch: "survival-skills", inputId: "s1" })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    const streamNames = result.bushcraft.sections.map((s) => s.stream);
    expect(streamNames).toEqual([null, "pioneering", "survival-skills"]);
  });

  it("keeps a forked stream section's stages scoped to only that stream's own rows", () => {
    const rows = [makeRow({ stage: 4, branch: "pioneering", inputId: "p1" }), makeRow({ stage: 4, branch: "survival-skills", inputId: "s1" })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    const pioneering = result.bushcraft.sections.find((s) => s.stream === "pioneering");
    const survival = result.bushcraft.sections.find((s) => s.stream === "survival-skills");
    expect(pioneering?.members[0].stages[0].cells).toHaveLength(1);
    expect(pioneering?.members[0].stages[0].cells[0].inputId).toBe("p1");
    expect(survival?.members[0].stages[0].cells[0].inputId).toBe("s1");
  });

  it("computes highestStage per member SCOPED TO EACH SECTION, not shared across the whole skill", () => {
    const rows = [
      makeRow({ stage: 1, inputId: "a", answered: true, awarded: true, branch: "bushcraft" }),
      makeRow({ stage: 4, branch: "pioneering", inputId: "b", answered: true, awarded: true }),
      makeRow({ stage: 4, branch: "survival-skills", inputId: "c", answered: false, awarded: false }),
    ];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    const base = result.bushcraft.sections.find((s) => s.stream === null);
    const pioneering = result.bushcraft.sections.find((s) => s.stream === "pioneering");
    const survival = result.bushcraft.sections.find((s) => s.stream === "survival-skills");
    expect(base?.members[0].highestStage).toBe(1);
    expect(pioneering?.members[0].highestStage).toBe(4);
    expect(survival?.members[0].highestStage).toBeNull();
  });

  it("marks a stage complete only when every cell in it is awarded", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", awarded: true }), makeRow({ stage: 1, inputId: "b", awarded: true }), makeRow({ stage: 2, inputId: "c", awarded: true }), makeRow({ stage: 2, inputId: "d", awarded: false })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 2 }, members);
    const base = result.bushcraft.sections[0];

    expect(base.members[0].stages.find((s) => s.stage === 1)?.complete).toBe(true);
    expect(base.members[0].stages.find((s) => s.stage === 2)?.complete).toBe(false);
  });

  it("returns highestStage null when no cells have any progress", () => {
    const rows = [makeRow({ stage: 1, answered: false, awarded: false })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(result.bushcraft.sections[0].members[0].highestStage).toBeNull();
  });

  it("does not let an unawarded stage in one forked stream suppress an awarded same-numbered stage in a sibling stream's own section", () => {
    // Both streams have a "stage 4" — Pioneering's is fully awarded, Survival Skills' is not.
    // Each stream's own section must reflect only its own rows.
    const rows = [makeRow({ stage: 4, branch: "pioneering", inputId: "b", answered: true, awarded: true }), makeRow({ stage: 4, branch: "survival-skills", inputId: "c", answered: false, awarded: false })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(result.bushcraft.sections.find((s) => s.stream === "pioneering")?.members[0].highestStage).toBe(4);
    expect(result.bushcraft.sections.find((s) => s.stream === "survival-skills")?.members[0].highestStage).toBeNull();
  });

  it("does NOT count a merely in-progress (answered but not awarded) stage toward highestStage, matching OAS Summary's awarded-only semantics", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 2, inputId: "b", answered: true, awarded: false }), makeRow({ stage: 2, inputId: "c", answered: true, awarded: false })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 2 }, members);

    // Stage 2 is in progress (answered) but not fully awarded, so it must not count.
    expect(result.bushcraft.sections[0].members[0].highestStage).toBe(1);
  });

  it("returns an empty object for no rows", () => {
    expect(groupRowsForHeatMap([], {}, [])).toEqual({});
  });

  it("carries patrolName from the member roster, not the tidy rows", () => {
    const rows = [makeRow()];
    const members = [makeMember({ patrol: { id: "p1", name: "Kookaburras", duty: "member" as TerrainUnitMember["unit"]["duty"] } })];

    const result = groupRowsForHeatMap(rows, {}, members);

    expect(result.bushcraft.sections[0].members[0].patrolName).toBe("Kookaburras");
  });

  it("computes maxStage as the highest stage present across all sections", () => {
    const rows = [makeRow({ stage: 1 }), makeRow({ stage: 4, branch: "pioneering", memberId: "m2", memberName: "Sam" })];
    const members = [makeMember(), makeMember({ id: "m2", first_name: "Sam" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(result.bushcraft.maxStage).toBe(4);
  });

  it("marks a forked stream section empty (isEmpty=true) when zero members have any progress in it", () => {
    const rows = [
      makeRow({ stage: 4, branch: "pioneering", inputId: "p1", answered: true, awarded: true }),
      makeRow({ stage: 4, branch: "survival-skills", inputId: "s1", answered: false, awarded: false }),
      makeRow({ stage: 4, branch: "survival-skills", inputId: "s2", answered: false, awarded: false, memberId: "m2", memberName: "Sam" }),
    ];
    const members = [makeMember(), makeMember({ id: "m2", first_name: "Sam" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(result.bushcraft.sections.find((s) => s.stream === "pioneering")?.isEmpty).toBe(false);
    expect(result.bushcraft.sections.find((s) => s.stream === "survival-skills")?.isEmpty).toBe(true);
  });

  it("never marks the base section as empty", () => {
    const rows = [makeRow({ stage: 1, answered: false, awarded: false })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 1 }, members);

    expect(result.bushcraft.sections[0].isEmpty).toBe(false);
  });

  it("carries the skill's trunkStageCount onto every section, including stream sections", () => {
    const rows = [makeRow({ stage: 1, branch: "bushcraft" }), makeRow({ stage: 4, branch: "pioneering", inputId: "p1" })];
    const members = [makeMember()];

    const result = groupRowsForHeatMap(rows, { bushcraft: 3 }, members);

    result.bushcraft.sections.forEach((section) => {
      expect(section.trunkStageCount).toBe(3);
    });
  });

  it("marks trunkFullyAwarded true only once every trunk stage is fully awarded for that member", () => {
    const rows = [
      makeRow({ memberId: "m1", stage: 1, inputId: "a", awarded: true }),
      makeRow({ memberId: "m1", stage: 2, inputId: "b", awarded: true }),
      makeRow({ memberId: "m1", stage: 3, inputId: "c", awarded: true }),
      makeRow({ memberId: "m2", stage: 1, inputId: "a", awarded: true }),
      makeRow({ memberId: "m2", stage: 2, inputId: "b", awarded: false }),
    ];
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Zara" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 3 }, members);

    const base = result.bushcraft.sections.find((s) => s.stream === null);
    expect(base?.members.find((m) => m.memberId === "m1")?.trunkFullyAwarded).toBe(true);
    expect(base?.members.find((m) => m.memberId === "m2")?.trunkFullyAwarded).toBe(false);
  });

  it("gates trunkFullyAwarded per member on a stream section too, using the same trunk rows regardless of section", () => {
    const rows = [
      makeRow({ memberId: "m1", stage: 1, inputId: "a", awarded: true }),
      makeRow({ memberId: "m1", stage: 2, inputId: "b", awarded: true }),
      makeRow({ memberId: "m1", stage: 3, inputId: "c", awarded: true }),
      makeRow({ memberId: "m1", stage: 4, branch: "pioneering", inputId: "p1", awarded: true }),
    ];
    const members = [makeMember({ id: "m1", first_name: "Alex" })];

    const result = groupRowsForHeatMap(rows, { bushcraft: 3 }, members);

    const pioneering = result.bushcraft.sections.find((s) => s.stream === "pioneering");
    expect(pioneering?.members[0].trunkFullyAwarded).toBe(true);
    expect(pioneering?.members[0].highestStage).toBe(4);
  });
});
