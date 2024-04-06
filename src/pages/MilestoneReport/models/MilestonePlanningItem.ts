import { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

export default class MilestonePlanningItem {
  name: string;
  milestone: number | string;
  total_leads: number;
  total_assists: number;
  outdoors: number;
  creative: number;
  personalGrowth: number;
  community: number;

  constructor(CurrentMilestone: TerrainAchievements | undefined, UnitMember: TerrainUnitMember) {
    if (!CurrentMilestone) {
      this.name = UnitMember.first_name;
      this.milestone = "-";
      this.total_leads = 0;
      this.total_assists = 0;
      this.outdoors = 0;
      this.creative = 0;
      this.personalGrowth = 0;
      this.community = 0;
      return;
    }
    const maxL = CurrentMilestone.achievement_meta?.stage === 1 ? 1 : CurrentMilestone.achievement_meta?.stage === 2 ? 2 : 4;
    const maxA = CurrentMilestone.achievement_meta?.stage === 1 ? 2 : CurrentMilestone.achievement_meta?.stage === 2 ? 3 : 4;
    const maxP = CurrentMilestone.achievement_meta?.stage === 1 ? 6 : CurrentMilestone.achievement_meta?.stage === 2 ? 5 : 4;
    const eventCount = CurrentMilestone.event_count;
    this.name = UnitMember.first_name + " " + UnitMember.last_name;
    this.milestone = !CurrentMilestone.achievement_meta?.stage ? 0 : CurrentMilestone.achievement_meta.stage;
    this.total_leads = Math.max(0, maxL - (eventCount?.leader ? eventCount?.leader.community + eventCount?.leader.creative + eventCount?.leader.outdoors + eventCount?.leader.personal_growth : 0));
    this.total_assists = Math.max(0, maxA - (eventCount?.assistant ? eventCount?.assistant.community + eventCount?.assistant.creative + eventCount?.assistant.outdoors + eventCount?.leader.personal_growth : 0));
    this.outdoors = Math.max(0, maxP - (eventCount?.participant ? eventCount?.participant.outdoors : 0));
    this.creative = Math.max(0, maxP - (eventCount?.participant ? eventCount?.participant.creative : 0));
    this.personalGrowth = Math.max(0, maxP - (eventCount?.participant ? eventCount?.participant.personal_growth : 0));
    this.community = Math.max(0, maxP - (eventCount?.participant ? eventCount?.participant.community : 0));
  }
}
