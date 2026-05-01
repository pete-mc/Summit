import MilestonePlanningItem from "@/pages/MilestoneReport/models/MilestonePlanningItem";
import type { TerrainAchievements, TerrainAchievementsEventCount, TerrainUnitMember } from "@/types/terrainTypes";

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
      duty: "member" as TerrainUnitMember["unit"]["duty"],
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeEventCount(overrides: Partial<TerrainAchievementsEventCount> = {}): TerrainAchievementsEventCount {
  return {
    leader: { community: 0, creative: 0, outdoors: 0, personal_growth: 0 },
    assistant: { community: 0, creative: 0, outdoors: 0, personal_growth: 0 },
    participant: { community: 0, creative: 0, outdoors: 0, personal_growth: 0 },
    ...overrides,
  };
}

function makeMilestoneAchievement(stage: number, eventCount?: TerrainAchievementsEventCount): TerrainAchievements {
  return {
    id: "achv-1",
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: "milestone" as TerrainAchievements["type"],
    status: "in_progress" as TerrainAchievements["status"],
    status_updated: "2026-01-01T00:00:00.000Z",
    achievement_meta: { stage },
    event_count: eventCount,
  };
}

describe("MilestonePlanningItem", () => {
  it("uses defaults when no current milestone exists", () => {
    const item = new MilestonePlanningItem(undefined, makeMember());

    expect(item.name).toBe("Alex");
    expect(item.milestone).toBe("-");
    expect(item.overall_percent).toBe("");
    expect(item.total_leads).toBe(0);
    expect(item.total_assists).toBe(0);
    expect(item.outdoors).toBe(0);
    expect(item.creative).toBe(0);
    expect(item.personal_growth).toBe(0);
    expect(item.community).toBe(0);
  });

  it("calculates stage-1 remaining counts and overall percentage deterministically", () => {
    const eventCount = makeEventCount({
      leader: { community: 1, creative: 0, outdoors: 0, personal_growth: 0 },
      assistant: { community: 1, creative: 1, outdoors: 0, personal_growth: 0 },
      participant: { community: 6, creative: 2, outdoors: 3, personal_growth: 4 },
    });

    const item = new MilestonePlanningItem(makeMilestoneAchievement(1, eventCount), makeMember());

    expect(item.name).toBe("Alex Scout");
    expect(item.milestone).toBe(1);
    expect(item.total_leads).toBe(0);
    expect(item.total_assists).toBe(0);
    expect(item.outdoors).toBe(3);
    expect(item.creative).toBe(4);
    expect(item.personal_growth).toBe(2);
    expect(item.community).toBe(0);
    expect(item.overall_percent).toBe("66%");
  });

  it("defaults to 0% when milestone stage has no defined requirements", () => {
    const item = new MilestonePlanningItem(makeMilestoneAchievement(99, makeEventCount()), makeMember());

    expect(item.milestone).toBe(99);
    expect(item.total_leads).toBe(0);
    expect(item.total_assists).toBe(0);
    expect(item.outdoors).toBe(0);
    expect(item.creative).toBe(0);
    expect(item.personal_growth).toBe(0);
    expect(item.community).toBe(0);
    expect(item.overall_percent).toBe("0%");
  });
});
