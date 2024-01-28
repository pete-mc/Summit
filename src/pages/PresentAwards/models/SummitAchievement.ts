import moment from 'moment';
import type { TerrainAchievements, TerrainEvent } from '@/types/terrainTypes';
import type { UnitMember } from '@/types/terrainState';
import { TerrainAchievementsType, siaTypes } from '@/shared';
import { reconstructGuids } from '@/helpers';

export default class SummitAchievement {
  id: string;

  memberid: string;

  member: string;

  type: string;

  achievementName: string;

  dateAwarded: string;

  presented: boolean;

  constructor(achievement: TerrainAchievements, member: UnitMember, storeEvent: TerrainEvent | undefined) {
    const existingAwards = storeEvent && storeEvent.schedule_items ? storeEvent.schedule_items.flatMap((item) => item.description) : [];
    const existingGuids = reconstructGuids(existingAwards);
    this.id = achievement.id;
    this.memberid = achievement.member_id;
    this.member = `${member?.first_name} ${member?.last_name}`;
    this.type = achievement.type.replace(/_/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    this.achievementName = SummitAchievement.getName(achievement).toString();
    this.dateAwarded = moment(achievement.status_updated).format('DD/MM/YYYY');
    this.presented = existingGuids.includes(achievement.id);
  }

  private static getName(achievement: TerrainAchievements): string {
    let section = achievement.section?.replace(/-/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    section = section ? `${section}s` : '';
    switch (achievement.type) {
      case TerrainAchievementsType.AdditionalAward:
        return (
          achievement.achievement_meta?.additional_award_id?.replace(/_/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? 'Additional Award'
        );
      case TerrainAchievementsType.AdventurousJourney:
        return `Adventurous Journey (${section})`;
      case TerrainAchievementsType.CourseReflection:
        return `LS/PD Course (${section})`;
      case TerrainAchievementsType.IntroScouting:
        return 'Introduction to Scouting';
      case TerrainAchievementsType.IntroSection:
        return `Introduction to ${section ?? 'Section'}`;
      case TerrainAchievementsType.Milestone:
        return `Milestone ${achievement.achievement_meta?.stage} (${section})`;
      case TerrainAchievementsType.OutdoorAdventureSkill:
        return `${
          achievement.achievement_meta?.branch?.replace(/-/g, ' ').replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? 'Outdoor Adventure Skill'
        } ${achievement.achievement_meta?.stage}`;
      case TerrainAchievementsType.PeakAward:
        return `Peak Award (${section})`;
      case TerrainAchievementsType.PersonalReflection:
        return `${section ?? 'Reflection'}`;
      case TerrainAchievementsType.SpecialInterestArea:
        return `${
          achievement.answers && achievement.answers.special_interest_area_selection
            ? siaTypes.find((s) => s.id === achievement.answers?.special_interest_area_selection)?.title
            : 'Special Interest Area'
        } (${section})`;
      default:
        return 'Unknown Achievement';
    }
  }
}
