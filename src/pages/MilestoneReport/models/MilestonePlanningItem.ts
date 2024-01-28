import { TerrainAchievements } from "@/types/terrainTypes";
import { UnitMember } from "@/types/terrainState";

export default class MilestonePlanningItem {
  name: string;
  milestone: number | string;
  total_leads: number;
  total_assists: number;
  outdoors: number;
  creative: number;
  personalGrowth: number;
  community: number;

  constructor(CurrentMilestone: TerrainAchievements | undefined, UnitMember: UnitMember) {
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
    const event_count = CurrentMilestone.event_count;
    this.name = UnitMember.first_name + " " + UnitMember.last_name;
    this.milestone = !CurrentMilestone.achievement_meta?.stage ? 0 : CurrentMilestone.achievement_meta.stage;
    this.total_leads = Math.max(0, maxL - (event_count?.leader ? event_count?.leader.community + event_count?.leader.creative + event_count?.leader.outdoors + event_count?.leader.personal_growth : 0));
    this.total_assists = Math.max(0, maxA - (event_count?.assistant ? event_count?.assistant.community + event_count?.assistant.creative + event_count?.assistant.outdoors + event_count?.leader.personal_growth : 0));
    this.outdoors = Math.max(0, maxP - (event_count?.participant ? event_count?.participant.outdoors : 0));
    this.creative = Math.max(0, maxP - (event_count?.participant ? event_count?.participant.creative : 0));
    this.personalGrowth = Math.max(0, maxP - (event_count?.participant ? event_count?.participant.personal_growth : 0));
    this.community = Math.max(0, maxP - (event_count?.participant ? event_count?.participant.community : 0));
  }
}
