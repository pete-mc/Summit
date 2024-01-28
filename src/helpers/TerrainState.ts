import { TerrainRootState } from "@/types/terrainState";

export const TerrainState = {
  getUnitID (): string {
    return (window.$nuxt.$store.state as TerrainRootState).me.currentUnit.id
  },
  
  getToken (): string {
    return (window.$nuxt.$store.state as TerrainRootState).auth.idToken
  },
  
  getMemberID (): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex].member.id
  }
};

export default TerrainState;