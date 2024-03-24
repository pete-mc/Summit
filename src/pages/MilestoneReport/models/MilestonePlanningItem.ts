import { TerrainAchievements, TerrainAchievementsEventCount, TerrainUnitMember } from "@/types/terrainTypes";

interface MilestoneObject {
  [key: string]: number;
  leads: number;
  assists: number;
  outdoors: number;
  creative: number;
  personalGrowth: number;
  community: number;
}

class MilestoneRequirements implements MilestoneObject {
  milestone: number = 0;
  leads: number = 0;
  assists: number = 0;
  outdoors: number = 0;
  creative: number = 0;
  personalGrowth: number = 0;
  community: number = 0;

  constructor(CurrentMilestone: TerrainAchievements) {
    if (!CurrentMilestone || !CurrentMilestone.achievement_meta) {
      return;
    }
    this.milestone = CurrentMilestone?.achievement_meta?.stage ?? 0;
    switch (CurrentMilestone.achievement_meta.stage) {
      case 1:
        this.outdoors = 6;
        this.creative = 6;
        this.personalGrowth = 6;
        this.community = 6;
        this.assists = 2;
        this.leads = 1;
        return;
      case 2:
        this.outdoors = 5;
        this.creative = 5;
        this.personalGrowth = 5;
        this.community = 5;
        this.assists = 2;
        this.leads = 2;
        return;
      case 3:
        this.outdoors = 4;
        this.creative = 4;
        this.personalGrowth = 4;
        this.community = 4;
        this.assists = 4;
        this.leads = 4;
        return;
    }
  }

  [key: string]: number;
}
class MilestoneCurrent implements MilestoneObject {
  leads: number = 0;
  assists: number = 0;
  outdoors: number = 0;
  creative: number = 0;
  personalGrowth: number = 0;
  community: number = 0;

  constructor(eventCount: TerrainAchievementsEventCount | undefined) {
    if (!eventCount) {
      return;
    }
    this.leads = Object.values(eventCount.leader).reduce((acc, currVal) => acc + currVal, 0);
    this.assists = Object.values(eventCount.assistant).reduce((acc, currVal) => acc + currVal, 0);
    this.outdoors = eventCount.participant.outdoors;
    this.creative = eventCount.participant.creative;
    this.personalGrowth = eventCount.participant.personal_growth;
    this.community = eventCount.participant.community;
  }

  [key: string]: number;
}

function calculateMilestone(currentRequirements: MilestoneRequirements, eventCount: MilestoneCurrent) {
  const calKeys = ["leads", "assists", "outdoors", "creative", "personalGrowth", "community"];

  function calculateEventResult(requiredEvents: number, completedEvents: number) {
    const result = requiredEvents - completedEvents;
    return result < 0 ? 0 : result;
  }

  function calculateOverallPercent(currentRequirements: MilestoneRequirements, eventCount: MilestoneCurrent) {
    let totalRequirements = 0;
    let totalCompleted = 0;
    calKeys.forEach((key) => {
      totalRequirements += currentRequirements[key];
      totalCompleted += eventCount[key];
    });
    return Math.floor((totalCompleted / totalRequirements) * 100);
  }

  const resultObj: {
    [key: string]: number;
  } = {};

  calKeys.forEach((key) => {
    resultObj[key] = calculateEventResult(currentRequirements[key], eventCount[key]);
  });

  resultObj["overallPercent"] = calculateOverallPercent(currentRequirements, eventCount);

  return resultObj;
}

export default class MilestonePlanningItem {
  name: string;
  milestone: number | string;
  total_leads: number;
  total_assists: number;
  overall_percent: string;
  outdoors: number;
  creative: number;
  personal_growth: number;
  community: number;

  constructor(CurrentMilestone: TerrainAchievements | undefined, UnitMember: TerrainUnitMember) {
    if (!CurrentMilestone) {
      this.name = UnitMember.first_name;
      this.milestone = "-";
      this.overall_percent = "";
      this.total_leads = 0;
      this.total_assists = 0;
      this.outdoors = 0;
      this.creative = 0;
      this.personal_growth = 0;
      this.community = 0;
      return;
    }
    const currentRequirements = new MilestoneRequirements(CurrentMilestone);
    const eventCount = new MilestoneCurrent(CurrentMilestone.event_count);

    this.name = UnitMember.first_name + " " + UnitMember.last_name;
    this.milestone = currentRequirements.milestone;

    const result = calculateMilestone(currentRequirements, eventCount);
    this.total_leads = result.leads;
    this.total_assists = result.assists;
    this.overall_percent = result.overallPercent + "%";
    this.outdoors = result.outdoors;
    this.creative = result.creative;
    this.personal_growth = result.personalGrowth;
    this.community = result.community;
  }
}
