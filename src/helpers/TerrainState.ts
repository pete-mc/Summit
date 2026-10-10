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

  /** The active profile's unit name, e.g. for print headers. */
  getUnitName(): string {
    return this.getCurrentProfile().unit.name;
  },

  /** The active profile's group name, e.g. for print headers. */
  getGroupName(): string {
    return this.getCurrentProfile().group.name;
  },

  getToken(): string {
    return (window.$nuxt.$store.state as TerrainRootState).auth.idToken;
  },

  getProfileMemberID(): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex].member.id;
  },

  getMemberID(): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.id;
  },

  getMemberName(): string {
    return (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.first_name + " " + (window.$nuxt.$store.state as TerrainRootState).user.memberDetails.last_name;
  },
};

export default TerrainState;
