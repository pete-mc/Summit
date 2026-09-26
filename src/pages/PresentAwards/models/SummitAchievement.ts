import moment from "moment";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import { TerrainAchievementsType, siaTypes } from "@/shared";

export default class SummitAchievement {
  id: string;
  memberid: string;
  member: string;
  type: string;
  achievementName: string;
  dateAwarded: string;
  presented: string;
  previouslyPresented: boolean;
  /**
   * Lower-case key identifying which badge artwork this award should show, e.g. "bushwalking" for
   * an OAS award or "milestone" for a milestone. Consumed by getBadgeIconUrl(); award types with
   * no artwork yet fall back to a placeholder rather than rendering nothing.
   */
  badgeKey: string;

  constructor(
    achievement: TerrainAchievements,
    member: TerrainUnitMember,
    existingPresentation: {
      guid: string;
      date: Date | null;
    }[],
  ) {
    this.id = achievement.id;
    this.memberid = achievement.member_id;
    this.member = `${member?.first_name} ${member?.last_name}`;
    this.type = achievement.type.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    this.achievementName = SummitAchievement.getName(achievement).toString();
    this.dateAwarded = moment(achievement.status_updated).format("DD/MM/YYYY");
    const presentation = existingPresentation.find((g) => g.guid === achievement.id);
    this.presented = presentation && presentation.date ? moment(presentation.date).format("DD/MM/YYYY") : presentation ? moment(achievement.status_updated).format("DD/MM/YYYY") : "No";
    this.previouslyPresented = presentation ? true : false;
    this.badgeKey = SummitAchievement.getBadgeKey(achievement);
  }

  /**
   * Which badge artwork identifies this award.
   *
   * OAS awards resolve to their branch ("bushwalking", "canoeing", …), which is what the existing
   * skill icons in src/images/oas-skills/ are named after. Every other award type resolves to its
   * own achievement type, so artwork can be dropped in per type later without touching this code.
   */
  private static getBadgeKey(achievement: TerrainAchievements): string {
    if (achievement.type === TerrainAchievementsType.OutdoorAdventureSkill) {
      // The branch is the specific skill; the stream is the broader grouping. Icons are per skill.
      const branch = achievement.achievement_meta?.branch;
      if (branch) return branch.replace(/-/g, "_").toLowerCase();
    }
    return String(achievement.type ?? "").toLowerCase();
  }

  public updatePresented(newValue: string) {
    this.presented = newValue;
  }

  private static getName(achievement: TerrainAchievements): string {
    let section = achievement.section?.replace(/-/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    section = section ? `${section}s` : "";
    switch (achievement.type) {
      case TerrainAchievementsType.AdditionalAward:
        return achievement.achievement_meta?.additional_award_id?.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Additional Award";
      case TerrainAchievementsType.AdventurousJourney:
        return `Adventurous Journey (${section})`;
      case TerrainAchievementsType.CourseReflection:
        return `LS/PD Course (${section})`;
      case TerrainAchievementsType.IntroScouting:
        return "Introduction to Scouting";
      case TerrainAchievementsType.IntroSection:
        return `Introduction to ${section ?? "Section"}`;
      case TerrainAchievementsType.Milestone:
        return `Milestone ${achievement.achievement_meta?.stage} (${section})`;
      case TerrainAchievementsType.OutdoorAdventureSkill:
        return `${achievement.achievement_meta?.branch?.replace(/-/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Outdoor Adventure Skill"} ${achievement.achievement_meta?.stage}`;
      case TerrainAchievementsType.PeakAward:
        return `Peak Award (${section})`;
      case TerrainAchievementsType.PersonalReflection:
        return `${section ?? "Reflection"}`;
      case TerrainAchievementsType.SpecialInterestArea:
        return `${achievement.answers && achievement.answers.special_interest_area_selection ? siaTypes.find((s) => s.id === achievement.answers?.special_interest_area_selection)?.title : "Special Interest Area"} (${section})`;
      default:
        return "Unknown Achievement";
    }
  }
}
