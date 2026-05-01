import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
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
      duty: "member" as TerrainUnitMember["unit"]["duty"],
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeAchievement(overrides: Partial<TerrainAchievements> = {}): TerrainAchievements {
  return {
    id: "achv-1",
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.SpecialInterestArea as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: "2026-03-05T00:00:00.000Z",
    answers: {
      special_interest_area_selection: "sia_stem_innovation",
    },
    ...overrides,
  } as TerrainAchievements;
}

describe("SummitAchievement", () => {
  it("maps achievement type/name and formats dates for SIA awards", () => {
    const achievement = makeAchievement();
    const item = new SummitAchievement(achievement, makeMember(), []);

    expect(item.id).toBe("achv-1");
    expect(item.memberid).toBe("member-1");
    expect(item.member).toBe("Alex Scout");
    expect(item.type).toBe("Special Interest Area");
    expect(item.achievementName).toBe("STEM & Innovation (Scouts)");
    expect(item.dateAwarded).toBe("05/03/2026");
    expect(item.presented).toBe("No");
    expect(item.previouslyPresented).toBe(false);
  });

  it("uses presentation date when available and supports updatePresented", () => {
    const achievement = makeAchievement();
    const item = new SummitAchievement(achievement, makeMember(), [{ guid: "achv-1", date: new Date("2026-03-12T00:00:00.000Z") }]);

    expect(item.presented).toBe("12/03/2026");
    expect(item.previouslyPresented).toBe(true);

    item.updatePresented("15/03/2026");
    expect(item.presented).toBe("15/03/2026");
  });

  it("falls back to status-updated date when previously presented without explicit date", () => {
    const achievement = makeAchievement({ status_updated: "2026-03-06T00:00:00.000Z" });
    const item = new SummitAchievement(achievement, makeMember(), [{ guid: "achv-1", date: null }]);

    expect(item.presented).toBe("06/03/2026");
    expect(item.previouslyPresented).toBe(true);
  });

  it("uses default unknown mapping for unsupported achievement types", () => {
    const achievement = makeAchievement({ type: "unexpected_type" as unknown as TerrainAchievements["type"] });
    const item = new SummitAchievement(achievement, makeMember(), []);

    expect(item.type).toBe("Unexpected Type");
    expect(item.achievementName).toBe("Unknown Achievement");
  });
});
