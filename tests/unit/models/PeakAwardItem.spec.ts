import PeakAwardItem from "@/pages/PeakAward/models/PeakAwardItem";
import { TerrainAchievementsType } from "@/shared";
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
      duty: "member" as any,
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeEventCount(): TerrainAchievementsEventCount {
  return {
    leader: { community: 1, creative: 2, outdoors: 3, personal_growth: 4 },
    assistant: { community: 4, creative: 3, outdoors: 2, personal_growth: 1 },
    participant: { community: 9, creative: 8, outdoors: 7, personal_growth: 6 },
  };
}

function makeAward(overrides: Partial<TerrainAchievements>): TerrainAchievements {
  return {
    id: Math.random().toString(),
    member_id: "member-1",
    section: "scout" as any,
    type: TerrainAchievementsType.Milestone as any,
    status: "in_progress" as any,
    status_updated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as TerrainAchievements;
}

describe("PeakAwardItem", () => {
  it("aggregates milestone counts and award status flags for current section", () => {
    const awards: TerrainAchievements[] = [
      makeAward({ type: TerrainAchievementsType.Milestone as any, section: "scout" as any, achievement_meta: { stage: 3 }, status: "in_progress" as any, event_count: makeEventCount() }),
      makeAward({ type: TerrainAchievementsType.SpecialInterestArea as any, section: "scout" as any, status: "in_progress" as any }),
      makeAward({ type: TerrainAchievementsType.SpecialInterestArea as any, section: "scout" as any, status: "awarded" as any }),
      makeAward({ type: TerrainAchievementsType.SpecialInterestArea as any, section: "cub" as any, status: "awarded" as any }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "scout" as any, status: "awarded" as any, achievement_meta: { stream: "bushcraft" as any, stage: 2 } }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "cub" as any, status: "awarded" as any, achievement_meta: { stream: "bushcraft" as any, stage: 6 } }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "scout" as any, status: "awarded" as any, achievement_meta: { stream: "bushwalking" as any, stage: 3 } }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "cub" as any, status: "awarded" as any, achievement_meta: { stream: "bushwalking" as any, stage: 8 } }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "scout" as any, status: "awarded" as any, achievement_meta: { stream: "camping" as any, stage: 1 } }),
      makeAward({ type: TerrainAchievementsType.OutdoorAdventureSkill as any, section: "cub" as any, status: "awarded" as any, achievement_meta: { stream: "camping" as any, stage: 7 } }),
      makeAward({ type: TerrainAchievementsType.IntroScouting as any, status: "awarded" as any }),
      makeAward({ type: TerrainAchievementsType.IntroSection as any, section: "scout" as any, status: "in_progress" as any }),
      makeAward({ type: TerrainAchievementsType.CourseReflection as any, section: "scout" as any, status: "awarded" as any }),
      makeAward({ type: TerrainAchievementsType.PersonalReflection as any, section: "scout" as any, status: "in_progress" as any }),
      makeAward({ type: TerrainAchievementsType.AdventurousJourney as any, section: "scout" as any, status: "awarded" as any }),
    ];

    const item = new PeakAwardItem(awards, "scout", makeMember());

    expect(item.name).toBe("Alex Scout");
    expect(item.milestone3).toBe("⌛");
    expect(item.leads).toBe(10);
    expect(item.assists).toBe(10);
    expect(item.outdoors).toBe(7);
    expect(item.creative).toBe(8);
    expect(item.personalGrowth).toBe(6);
    expect(item.community).toBe(9);

    expect(item.SIAInProgress).toBe(1);
    expect(item.SIACompleted).toBe(1);
    expect(item.OASProgressions).toBe(3);

    expect(item.Bushcraft).toBe(2);
    expect(item.Bushwalking).toBe(3);
    expect(item.Camping).toBe(1);

    expect(item.Scouts).toBe("✅");
    expect(item.Section).toBe("⌛");
    expect(item.PersonalDevelopment).toBe("✅");
    expect(item.Reflection).toBe("⌛");
    expect(item.Journey).toBe("✅");
  });

  it("defaults milestone-3 fields when no stage-3 milestone exists for the section", () => {
    const item = new PeakAwardItem([], "scout", makeMember());

    expect(item.milestone3).toBe("❌");
    expect(item.leads).toBe(0);
    expect(item.assists).toBe(0);
    expect(item.outdoors).toBe(0);
    expect(item.creative).toBe(0);
    expect(item.personalGrowth).toBe(0);
    expect(item.community).toBe(0);
  });
});
