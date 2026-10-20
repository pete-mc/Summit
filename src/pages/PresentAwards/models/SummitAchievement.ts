import moment from "moment";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import { TerrainAchievementsType, siaTypes } from "@/shared";
import { getBadgeEntry } from "@/shared/badgeManifest";

export default class SummitAchievement {
  id: string;
  memberid: string;
  member: string;
  type: string;
  achievementName: string;
  dateAwarded: string;
  presented: string;
  previouslyPresented: boolean;
  /** Key into src/shared/badgeManifest.ts, e.g. "bushwalking" or "milestone_scout_2". */
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
   * Gotcha: key each type exactly as finely as its artwork varies, or different badges share one icon.
   * Additional awards → award id; milestones → section + stage; peak awards → section; SIAs → the selected SIA (in answers).
   * Missing metadata falls back to the bare type (a placeholder), never a throw.
   */
  private static getBadgeKey(achievement: TerrainAchievements): string {
    const type = String(achievement.type ?? "").toLowerCase();
    const meta = achievement.achievement_meta;
    const normalise = (value: string) => value.replace(/-/g, "_").toLowerCase();
    const section = achievement.section ? normalise(achievement.section) : null;

    switch (achievement.type) {
      case TerrainAchievementsType.OutdoorAdventureSkill: {
        // Learning: sub-branches (e.g. sea-kayaking) wear their parent skill's badge. Prefer the branch if it has
        // artwork, else the stream, so new Terrain sub-branches resolve with no list to maintain.
        const branchKey = meta?.branch ? normalise(meta.branch) : null;
        if (branchKey && getBadgeEntry(branchKey)?.file) {
          return branchKey;
        }

        const streamKey = meta?.stream ? normalise(String(meta.stream)) : null;
        return streamKey ?? branchKey ?? type;
      }

      case TerrainAchievementsType.AdditionalAward:
        return meta?.additional_award_id ? normalise(meta.additional_award_id) : type;

      case TerrainAchievementsType.Milestone:
        return section && meta?.stage ? `milestone_${section}_${meta.stage}` : type;

      case TerrainAchievementsType.PeakAward:
        return section ? `peak_award_${section}` : type;

      case TerrainAchievementsType.SpecialInterestArea: {
        const sia = achievement.answers?.special_interest_area_selection;
        return typeof sia === "string" && sia ? normalise(sia) : type;
      }

      default:
        return type;
    }
  }

  /** "" when not presented. */
  get presentedDate(): string {
    return this.presented !== "No" ? this.presented : "";
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
