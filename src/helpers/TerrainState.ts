import { Profile, TerrainRootState } from "@/types/terrainState";

export const TerrainState = {
  getCurrentProfile(): Profile {
    return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex];
  },

  getUnitID(): string {
    return this.getCurrentProfile().unit.id;
  },

  getSectionName(): string | undefined {
    return this.getCurrentProfile().unit.section;
  },

  getToken(): string {
    return (window.$nuxt.$store.state as TerrainRootState).auth.idToken;
  },

  getProfileMemberID(): string {
    // eslint-disable-next-line max-len
    return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex].member.id;
  },

  getMemberID(): string {
    // eslint-disable-next-line max-len
    return (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.id;
  },

  getMemberName(): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.first_name + " " + (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.last_name;
  },
};

export default TerrainState;
