/**
 * Runtime duplicate of terrainTypes.d.ts's TerrainAchievementsSection — that file is a pure
 * ambient .d.ts declaration, so its `enum` erases to nothing at runtime. Mirrors how
 * TerrainAchievementType.ts already duplicates TerrainAchievementsType for the same reason (see
 * src/shared/index.ts). Values must stay in sync with terrainTypes.d.ts by hand.
 */
export enum TerrainAchievementsSection {
  Cub = "cub",
  Joey = "joey",
  Rover = "rover",
  Scout = "scout",
  Venturer = "venturer",
}

export default TerrainAchievementsSection;
