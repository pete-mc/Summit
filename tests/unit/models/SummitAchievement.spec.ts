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

  it("derives an OAS award's badge key from its branch, not its type", () => {
    // Badge artwork is per skill (oas-bushwalking.svg etc.), so the branch is what identifies it.
    const achievement = makeAchievement({
      type: TerrainAchievementsType.OutdoorAdventureSkill as TerrainAchievements["type"],
      achievement_meta: { branch: "bushwalking", stage: 2 },
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("bushwalking");
  });

  it("falls back to the stream for a forked OAS sub-branch, which wears its parent skill's badge", () => {
    // Paddling forks into canoeing/kayaking/sea-kayaking/white-water-rafting at higher stages.
    // Scouts Australia awards no badge for a sub-branch, and Terrain ships artwork for the nine
    // skills only — so a sub-branch must resolve to its stream or it shows a blank placeholder.
    const achievement = makeAchievement({
      type: TerrainAchievementsType.OutdoorAdventureSkill as TerrainAchievements["type"],
      achievement_meta: { stream: "paddling", branch: "sea-kayaking", stage: 6 },
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("paddling");
  });

  it("prefers the branch over the stream when the branch has artwork of its own", () => {
    // On trunk stages branch and stream are the same value; this also keeps working if artwork
    // for a specific sub-branch is ever added.
    const achievement = makeAchievement({
      type: TerrainAchievementsType.OutdoorAdventureSkill as TerrainAchievements["type"],
      achievement_meta: { stream: "paddling", branch: "paddling", stage: 2 },
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("paddling");
  });

  it("normalises a hyphenated OAS branch to the icon key form", () => {
    const achievement = makeAchievement({
      type: TerrainAchievementsType.OutdoorAdventureSkill as TerrainAchievements["type"],
      achievement_meta: { branch: "Vertical-Climbing", stage: 1 },
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("vertical_climbing");
  });

  it("derives an SIA's badge key from the selected interest area, not the bare type", () => {
    // Artwork is per SIA, so keying on the type would give all six the same icon.
    expect(new SummitAchievement(makeAchievement(), makeMember(), []).badgeKey).toBe("sia_stem_innovation");
  });

  it("falls back to the achievement type when an SIA records no selection", () => {
    const achievement = makeAchievement({ answers: {} } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("special_interest_area");
  });

  it("derives milestone and peak award keys from the section, since artwork differs per section", () => {
    const milestone = makeAchievement({
      type: TerrainAchievementsType.Milestone as TerrainAchievements["type"],
      achievement_meta: { stage: 2 },
    } as Partial<TerrainAchievements>);
    const peak = makeAchievement({
      type: TerrainAchievementsType.PeakAward as TerrainAchievements["type"],
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(milestone, makeMember(), []).badgeKey).toBe("milestone_scout_2");
    expect(new SummitAchievement(peak, makeMember(), []).badgeKey).toBe("peak_award_scout");
  });

  it("falls back to the type when a milestone has no stage recorded", () => {
    const achievement = makeAchievement({
      type: TerrainAchievementsType.Milestone as TerrainAchievements["type"],
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("milestone");
  });

  it("derives an additional award's badge key from its award id, so each award gets its own icon", () => {
    // Without this every additional award would share the key "additional_award" and one icon.
    const achievement = makeAchievement({
      type: TerrainAchievementsType.AdditionalAward as TerrainAchievements["type"],
      achievement_meta: { additional_award_id: "walkabout_100" },
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("walkabout_100");
  });

  it("falls back to the type when an additional award has no award id recorded", () => {
    const achievement = makeAchievement({
      type: TerrainAchievementsType.AdditionalAward as TerrainAchievements["type"],
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("additional_award");
  });

  it("falls back to the type when an OAS award has no branch recorded", () => {
    const achievement = makeAchievement({
      type: TerrainAchievementsType.OutdoorAdventureSkill as TerrainAchievements["type"],
    } as Partial<TerrainAchievements>);

    expect(new SummitAchievement(achievement, makeMember(), []).badgeKey).toBe("outdoor_adventure_skill");
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
