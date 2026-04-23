import OasReportItem from "@/pages/OasReport/models/OasReportItem";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: {
      id: "unit-1",
      section: "scout",
      duty: "member" as any,
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeOasAchievement(template: string, stream: string, branch: string, stage: number): TerrainAchievements {
  return {
    id: `${template}-${branch}-${stage}`,
    member_id: "member-1",
    section: "scout" as any,
    type: "outdoor_adventure_skill" as any,
    status: "awarded" as any,
    status_updated: "2026-01-01T00:00:00.000Z",
    template,
    achievement_meta: { stream: stream as any, branch, stage },
  };
}

describe("OasReportItem", () => {
  it("builds name and keeps highest stage per branch for each stream", () => {
    const item = new OasReportItem(
      [makeOasAchievement("oas-bw-1", "bushwalking", "navigation", 1), makeOasAchievement("oas-bw-3", "bushwalking", "navigation", 3), makeOasAchievement("oas-bw-2", "bushwalking", "navigation", 2)],
      makeMember(),
    );

    expect(item.name).toBe("Alex Scout");
    expect(item.bushwalking).toEqual([{ template: "oas-bw-1", stream: "bushwalking", branch: "navigation", stage: 3 }]);
  });

  it("removes broader templates when a more specific template progression exists", () => {
    const item = new OasReportItem([makeOasAchievement("core-1", "camping", "campcraft", 2), makeOasAchievement("core-advanced-2", "camping", "expedition-campcraft", 4)], makeMember());

    expect(item.camping).toEqual([{ template: "core-advanced-2", stream: "camping", branch: "expedition-campcraft", stage: 4 }]);
  });

  it("initializes non-achieved streams as empty arrays", () => {
    const item = new OasReportItem([], makeMember());

    expect(item.bushwalking).toEqual([]);
    expect(item.bushcraft).toEqual([]);
    expect(item.camping).toEqual([]);
    expect(item.alpine).toEqual([]);
    expect(item.cycling).toEqual([]);
    expect(item.vertical).toEqual([]);
    expect(item.aquatics).toEqual([]);
    expect(item.boating).toEqual([]);
    expect(item.paddling).toEqual([]);
  });
});
