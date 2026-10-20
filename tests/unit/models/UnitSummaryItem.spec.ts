import UnitSummaryItem from "@/pages/SectionSummary/models/UnitSummarytem";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

function makeMember(): TerrainUnitMember {
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
  };
}

function makeAchievement(stage: number, leader: NonNullable<TerrainAchievements["event_count"]>["leader"], participant: NonNullable<TerrainAchievements["event_count"]>["participant"]): TerrainAchievements {
  return {
    id: "achievement-1",
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: "milestone" as TerrainAchievements["type"],
    status: "in_progress" as TerrainAchievements["status"],
    status_updated: "2026-01-01T00:00:00.000Z",
    achievement_meta: { stage },
    event_count: {
      leader,
      assistant: { community: 100, creative: 100, outdoors: 100, personal_growth: 100 },
      participant,
    },
  };
}

describe("UnitSummaryItem milestone lead requirements", () => {
  it.each([
    { stage: 1, requiredLeads: 2, leader: { community: 1, creative: 0, outdoors: 0, personal_growth: 0 }, requiredParticipants: 6 },
    { stage: 2, requiredLeads: 4, leader: { community: 1, creative: 1, outdoors: 0, personal_growth: 0 }, requiredParticipants: 5 },
    { stage: 3, requiredLeads: 6, leader: { community: 1, creative: 1, outdoors: 1, personal_growth: 1 }, requiredParticipants: 4 },
  ])("reports per-area participants and total remaining leads for Milestone $stage", ({ stage, requiredLeads, leader, requiredParticipants }) => {
    const participant = {
      community: requiredParticipants,
      creative: requiredParticipants - 1,
      outdoors: requiredParticipants - 2,
      personal_growth: requiredParticipants + 1,
    };
    const item = new UnitSummaryItem(makeAchievement(stage, leader, participant), makeMember());
    const existingLeads = Object.values(leader).reduce((total, count) => total + count, 0);

    expect(item.total_leads).toBe(requiredLeads - existingLeads);
    expect(item.community).toBe(0);
    expect(item.creative).toBe(1);
    expect(item.outdoors).toBe(2);
    expect(item.personalGrowth).toBe(0);
    expect(item).not.toHaveProperty("total_assists");
  });
});
