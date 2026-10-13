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
   * Which badge artwork identifies this award. Keys match src/shared/badgeManifest.ts.
   *
   * Each award type is keyed as narrowly as its artwork varies, because a key coarser than the
   * artwork makes different badges share one icon:
   *
   * - OAS → branch, falling back to stream ("bushwalking"); artwork is per skill, not per stage
   *   or sub-branch. See the OAS case below for why both are consulted.
   * - Additional awards → the award id ("walkabout_100"); the bare type would collapse all 32.
   * - Milestones → section AND stage ("milestone_scout_2"); Terrain ships distinct artwork for
   *   each of the 5 sections × 3 stages.
   * - Peak awards → section ("peak_award_venturer"); artwork differs per section.
   * - SIAs → the selected SIA id ("sia_environment"), which lives in the answers, not the meta.
   *
   * Every branch falls back to the bare achievement type when its metadata is missing, so an
   * unexpected payload degrades to a placeholder rather than throwing.
   */
  private static getBadgeKey(achievement: TerrainAchievements): string {
    const type = String(achievement.type ?? "").toLowerCase();
    const meta = achievement.achievement_meta;
    const normalise = (value: string) => value.replace(/-/g, "_").toLowerCase();
    const section = achievement.section ? normalise(achievement.section) : null;

    switch (achievement.type) {
      case TerrainAchievementsType.OutdoorAdventureSkill: {
        // The STREAM is the skill (paddling); the BRANCH is either the same value on trunk stages
        // or a sub-branch once the tree forks (canoeing, sea-kayaking, white-water-rafting…).
        // Scouts Australia awards no badge for a sub-branch — a branch wears its parent skill's
        // badge — and Terrain ships artwork for the nine skills only.
        //
        // So: prefer the branch (it equals the skill on trunk stages, and keeps working if
        // artwork for a sub-branch is ever added), but fall back to the stream when the branch has
        // no badge of its own. Deriving it this way rather than from a hardcoded sub-branch list
        // means a sub-branch Terrain adds later still resolves, with nothing to keep in sync.
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
        // `answers` is a loose union (string | string[] | boolean | date range), so narrow to a
        // string before using it as a key — a malformed answer falls back to the type.
        const sia = achievement.answers?.special_interest_area_selection;
        return typeof sia === "string" && sia ? normalise(sia) : type;
      }

      default:
        return type;
    }
  }

  /**
   * The stored presentation date, or "" when not presented. The Present Awards table's "Date
   * Presented" column sorts on this; `presented` itself (date or "No") drives its Yes/No column.
   */
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
