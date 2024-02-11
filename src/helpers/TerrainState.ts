import { TerrainRootState, UnitMember } from "@/types/terrainState";

export const TerrainState = {
  getUnitID(): string {
    return (window.$nuxt.$store.state as TerrainRootState).me.currentUnit.id;
  },

  getToken(): string {
    return (window.$nuxt.$store.state as TerrainRootState).auth.idToken;
  },

  getMemberID(): string {
    // eslint-disable-next-line max-len
    return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex].member.id;
  },
  getUnitMembers(): UnitMember[] {
    return (window.$nuxt.$store.state as TerrainRootState).me.unitMembersData;
  },
  getMemberName(): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.first_name + " " + (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.last_name;
  },
};

export default TerrainState;
