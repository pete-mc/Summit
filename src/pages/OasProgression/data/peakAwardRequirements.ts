import { TerrainAchievementsSection } from "@/shared";

/** Learning: supplied by the user. It isn't in Summit, Topo-Blazor or Terrain's bundle. Kept separate so it's easy to correct. */
export interface PeakAwardRequirement {
  totalProgressions: number;
  coreSkillStage: number;
  /** null for Joey/Cub/Scout. Otherwise at least `minCount` progressions at `minStage`+ in any stream. */
  special: { minCount: number; minStage: number } | null;
}

export const PEAK_AWARD_REQUIREMENTS: Record<TerrainAchievementsSection, PeakAwardRequirement> = {
  [TerrainAchievementsSection.Joey]: { totalProgressions: 3, coreSkillStage: 1, special: null },
  [TerrainAchievementsSection.Cub]: { totalProgressions: 8, coreSkillStage: 3, special: null },
  [TerrainAchievementsSection.Scout]: { totalProgressions: 10, coreSkillStage: 5, special: null },
  [TerrainAchievementsSection.Venturer]: { totalProgressions: 12, coreSkillStage: 5, special: { minCount: 4, minStage: 4 } },
  [TerrainAchievementsSection.Rover]: { totalProgressions: 14, coreSkillStage: 5, special: { minCount: 6, minStage: 4 } },
};
