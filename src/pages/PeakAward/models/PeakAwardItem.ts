import { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import { TerrainAchievementsType } from "@/shared";

export default class PeakAwardItem {
  name: string;
  progress: number;
  milestone3: string;
  leads: number;
  assists: number;
  outdoors: number;
  creative: number;
  personalGrowth: number;
  community: number;
  SIAInProgress: number;
  SIACompleted: number;
  OASProgressions: number;
  Bushcraft: number;
  Bushwalking: number;
  Camping: number;
  Scouts: string;
  Section: string;
  PersonalDevelopment: string;
  Reflection: string;
  Journey: string;

  constructor(Awards: TerrainAchievements[] | undefined, CurrentSection: string | undefined, UnitMember: TerrainUnitMember) {
    this.name = UnitMember.first_name + " " + UnitMember.last_name;
    this.progress = 0;
    const ms3record = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.Milestone && award.achievement_meta?.stage === 3)[0];
    if (!ms3record) {
      // get max milestone level
      this.milestone3 = "❌";

      this.leads = 0;
      this.assists = 0;
      this.outdoors = 0;
      this.creative = 0;
      this.personalGrowth = 0;
      this.community = 0;
    } else {
      this.milestone3 = ms3record.status === "awarded" ? "✅" : ms3record.status === "in_progress" ? "⌛" : "❌";
      this.leads = ms3record.event_count?.leader ? ms3record.event_count?.leader.community + ms3record.event_count?.leader.creative + ms3record.event_count?.leader.outdoors + ms3record.event_count?.leader.personal_growth : 0;
      this.assists = ms3record.event_count?.assistant
        ? ms3record.event_count?.assistant.community + ms3record.event_count?.assistant.creative + ms3record.event_count?.assistant.outdoors + ms3record.event_count?.assistant.personal_growth
        : 0;
      this.outdoors = ms3record.event_count?.participant?.outdoors ?? 0;
      this.creative = ms3record.event_count?.participant?.creative ?? 0;
      this.personalGrowth = ms3record.event_count?.participant?.personal_growth ?? 0;
      this.community = ms3record.event_count?.participant?.community ?? 0;
    }
    this.SIAInProgress = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.SpecialInterestArea && award.status !== "awarded").length ?? 0;
    this.SIACompleted = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.SpecialInterestArea && award.status === "awarded").length ?? 0;
    this.OASProgressions = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.OutdoorAdventureSkill && award.status === "awarded").length ?? 0;
    this.Bushcraft = Math.max(
      ...(Awards?.filter((award) => award.type === TerrainAchievementsType.OutdoorAdventureSkill && award.status === "awarded" && award.achievement_meta?.stream === "bushcraft" && award.achievement_meta?.stage !== undefined).map(
        (award) => award.achievement_meta!.stage ?? 0,
      ) ?? [0]),
      0,
    );
    this.Bushwalking = Math.max(
      ...(Awards?.filter((award) => award.type === TerrainAchievementsType.OutdoorAdventureSkill && award.status === "awarded" && award.achievement_meta?.stream === "bushwalking" && award.achievement_meta?.stage !== undefined).map(
        (award) => award.achievement_meta!.stage ?? 0,
      ) ?? [0]),
      0,
    );
    this.Camping = Math.max(
      ...(Awards?.filter((award) => award.type === TerrainAchievementsType.OutdoorAdventureSkill && award.status === "awarded" && award.achievement_meta?.stream === "camping" && award.achievement_meta?.stage !== undefined).map(
        (award) => award.achievement_meta!.stage ?? 0,
      ) ?? [0]),
      0,
    );
    this.Scouts = Awards?.filter((award) => award.type === TerrainAchievementsType.IntroScouting && award.status === "awarded").length
      ? "✅"
      : Awards?.filter((award) => award.type === TerrainAchievementsType.IntroScouting && award.status === "in_progress").length
        ? "⌛"
        : "-";
    this.Section = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.IntroSection && award.status === "awarded").length
      ? "✅"
      : Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.IntroSection && award.status === "in_progress").length
        ? "⌛"
        : "-";
    this.PersonalDevelopment = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.CourseReflection && award.status === "awarded").length
      ? "✅"
      : Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.CourseReflection && award.status === "in_progress").length
        ? "⌛"
        : "-";
    this.Reflection = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.PersonalReflection && award.status === "awarded").length
      ? "✅"
      : Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.PersonalReflection && award.status === "in_progress").length
        ? "⌛"
        : "-";
    this.Journey = Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.AdventurousJourney && award.status === "awarded").length
      ? "✅"
      : Awards?.filter((award) => award.section === CurrentSection && award.type === TerrainAchievementsType.AdventurousJourney && award.status === "in_progress").length
        ? "⌛"
        : "-";
  }
}
