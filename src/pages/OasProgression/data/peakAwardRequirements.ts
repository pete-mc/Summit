import { TerrainAchievementsSection } from "@/shared";

/**
 * The Scouts Australia Peak Award eligibility rule, per section — supplied directly by the user
 * (2026-10-08), since it exists in neither Summit, the Topo-Blazor reference, nor Terrain's own
 * shipped JS bundle. See .claude/OASProgression/PLAN_PEAK_AWARD_SUMMARY.md for the full
 * investigation. Kept as its own constant, separate from every other OAS Progression file, so it
 * can be corrected independently if these numbers are ever mis-specified or the program changes.
 */
export interface PeakAwardRequirement {
  /** Total OAS stage-progressions (summed across all 9 streams) needed for the Peak Award. */
  totalProgressions: number;
  /** The stage required in EACH of Bushcraft, Bushwalking and Camping — same number for all three. */
  coreSkillStage: number;
  /**
   * null = this section has no Special condition (Joey/Cub/Scout). Otherwise: at least
   * `minCount` progressions (stage-completions, same unit as totalProgressions) at stage
   * `minStage` or higher, in any stream.
   */
  special: { minCount: number; minStage: number } | null;
}

export const PEAK_AWARD_REQUIREMENTS: Record<TerrainAchievementsSection, PeakAwardRequirement> = {
  [TerrainAchievementsSection.Joey]: { totalProgressions: 3, coreSkillStage: 1, special: null },
  [TerrainAchievementsSection.Cub]: { totalProgressions: 8, coreSkillStage: 3, special: null },
  [TerrainAchievementsSection.Scout]: { totalProgressions: 10, coreSkillStage: 5, special: null },
  [TerrainAchievementsSection.Venturer]: { totalProgressions: 12, coreSkillStage: 5, special: { minCount: 4, minStage: 4 } },
  [TerrainAchievementsSection.Rover]: { totalProgressions: 14, coreSkillStage: 5, special: { minCount: 6, minStage: 4 } },
};
