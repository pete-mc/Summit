import PeakAwardItem from "@/pages/PeakAward/models/PeakAwardItem";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainAchievementsEventCount, TerrainUnitMember } from "@/types/terrainTypes";

const asSection = (section: string): TerrainAchievements["section"] => section as TerrainAchievements["section"];
const asType = (type: TerrainAchievementsType): TerrainAchievements["type"] => type as TerrainAchievements["type"];
const asStatus = (status: string): TerrainAchievements["status"] => status as TerrainAchievements["status"];
const asStream = (stream: string): NonNullable<NonNullable<TerrainAchievements["achievement_meta"]>["stream"]> => stream as NonNullable<NonNullable<TerrainAchievements["achievement_meta"]>["stream"]>;

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
    section: asSection("scout"),
    type: asType(TerrainAchievementsType.Milestone),
    status: asStatus("in_progress"),
    status_updated: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as TerrainAchievements;
}

describe("PeakAwardItem", () => {
  it("aggregates milestone counts and award status flags for current section", () => {
    const awards: TerrainAchievements[] = [
      makeAward({ type: asType(TerrainAchievementsType.Milestone), section: asSection("scout"), achievement_meta: { stage: 3 }, status: asStatus("in_progress"), event_count: makeEventCount() }),
      makeAward({ type: asType(TerrainAchievementsType.SpecialInterestArea), section: asSection("scout"), status: asStatus("in_progress") }),
      makeAward({ type: asType(TerrainAchievementsType.SpecialInterestArea), section: asSection("scout"), status: asStatus("awarded") }),
      makeAward({ type: asType(TerrainAchievementsType.SpecialInterestArea), section: asSection("cub"), status: asStatus("awarded") }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("scout"), status: asStatus("awarded"), achievement_meta: { stream: asStream("bushcraft"), stage: 2 } }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("cub"), status: asStatus("awarded"), achievement_meta: { stream: asStream("bushcraft"), stage: 6 } }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("scout"), status: asStatus("awarded"), achievement_meta: { stream: asStream("bushwalking"), stage: 3 } }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("cub"), status: asStatus("awarded"), achievement_meta: { stream: asStream("bushwalking"), stage: 8 } }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("scout"), status: asStatus("awarded"), achievement_meta: { stream: asStream("camping"), stage: 1 } }),
      makeAward({ type: asType(TerrainAchievementsType.OutdoorAdventureSkill), section: asSection("cub"), status: asStatus("awarded"), achievement_meta: { stream: asStream("camping"), stage: 7 } }),
      makeAward({ type: asType(TerrainAchievementsType.IntroScouting), status: asStatus("awarded") }),
      makeAward({ type: asType(TerrainAchievementsType.IntroSection), section: asSection("scout"), status: asStatus("in_progress") }),
      makeAward({ type: asType(TerrainAchievementsType.CourseReflection), section: asSection("scout"), status: asStatus("awarded") }),
      makeAward({ type: asType(TerrainAchievementsType.PersonalReflection), section: asSection("scout"), status: asStatus("in_progress") }),
      makeAward({ type: asType(TerrainAchievementsType.AdventurousJourney), section: asSection("scout"), status: asStatus("awarded") }),
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
