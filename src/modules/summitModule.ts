import { TerrainEvent, type TerrainAchievements } from "@/types/terrainTypes";
import { fetchActivity, fetchMemberEvents, fetchUnitAchievements } from "@/services";
import { type ActionContext, type Module } from "vuex/types/index";
import { type TerrainRootState } from "@/types/terrainState";
import { TerrainState, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";
import SummitRouter from "@/router/SummitRouter";

interface State {
  message: string;
  helpButton: boolean;
  achievements: TerrainAchievements[];
  achievementsTimestamp: null | number;
  presentedAwards: { guid: string; date: Date }[] | { guid: string; date: null }[];
  presentedAwardsTimestamp: null | number;
}

const SummitModule: Module<State, TerrainRootState> = {
  namespaced: true,
  state: {
    ...{
      message: "Welcome To Summit!",
      helpButton: true,
      achievements: [],
      achievementsTimestamp: null,
      presentedAwards: [],
    },
    ...JSON.parse(localStorage.getItem("SummitState") ?? "{}"),
  },
  mutations: {
    updateMessage(state: { message: string }, newMessage: string) {
      state.message = newMessage;
    },
    toggleHelpButton(state: { helpButton: boolean }) {
      state.helpButton = !state.helpButton;
      const freshworksContainer = document.getElementById("freshworks-container");
      if (freshworksContainer != null) {
        freshworksContainer.style.display = state.helpButton ? "block" : "none";
      }
    },
    saveStateToLocalStorage(state: State) {
      const data = {
        helpButton: state.helpButton,
      };
      localStorage.setItem("SummitState", JSON.stringify(data));
      console.log("SummitState saved");
    },
    updateAchievements(state: { achievements: TerrainAchievements[]; achievementsTimestamp: number | null }, payload: { achievements: TerrainAchievements[]; timestamp: number }) {
      state.achievements = payload.achievements;
      state.achievementsTimestamp = payload.timestamp;
    },
    updatePresentedAwards(
      state: { presentedAwards: { guid: string; date: Date }[] | { guid: string; date: null }[]; presentedAwardsTimestamp: number | null },
      payload: { presentedAwards: { guid: string; date: Date }[] | { guid: string; date: null }[]; timestamp: number },
    ) {
      state.presentedAwards = payload.presentedAwards;
      state.presentedAwardsTimestamp = payload.timestamp;
    },
  },
  actions: {
    saveState({ commit }: ActionContext<State, TerrainRootState>): void {
      commit("saveStateToLocalStorage");
    },
    setMessage({ commit }: ActionContext<State, TerrainRootState>, message: string): void {
      commit("updateMessage", message);
    },
    toggleHelpButton({ commit }: ActionContext<State, TerrainRootState>): void {
      commit("toggleHelpButton");
      commit("saveStateToLocalStorage");
    },
    async getAchievements({ commit }: ActionContext<State, TerrainRootState>): Promise<void> {
      const achievements = await fetchUnitAchievements();
      commit("updateAchievements", { achievements, timestamp: Date.now() });
    },
    async getPresentedAwards({ commit }: ActionContext<State, TerrainRootState>): Promise<void> {
      let presentedAwards: { guid: string; date: Date }[] | { guid: string; date: null }[] = [];
      const memberEvents = await fetchMemberEvents("2100-01-01T00:00:00", "2100-01-30T00:00:00");
      let existingEvent = undefined as TerrainEvent | undefined;
      const existingEventId = memberEvents?.find((event) => event.title === "Summit Award Storage - Please Ignore" && event.invitee_id === TerrainState.getUnitID())?.id;
      if (existingEventId) {
        existingEvent = await fetchActivity(existingEventId);
      }
      const existingAwards = existingEvent && existingEvent.schedule_items ? existingEvent.schedule_items.flatMap((item) => item.description) : [];
      if (existingAwards.length > 0) {
        presentedAwards =
          existingEvent?.equipment_notes === "2" //check version of event data (version 1 only has guids and no dates, version 2 has guids and dates)
            ? reconstructGuidsAndDates(existingAwards)
            : reconstructGuids(existingAwards).map((guid) => ({ guid, date: null }));
      }
      commit("updatePresentedAwards", { presentedAwards, timestamp: Date.now() });
    },
    initialize(context: ActionContext<State, TerrainRootState>): void {
      context.dispatch("getPresentedAwards");
      const freshworksContainer = document.getElementById("freshworks-container");
      if (freshworksContainer != null) {
        freshworksContainer.style.display = context.getters.getHelpButton ? "block" : "none";
      }
      this.watch(
        () => context.rootState.user.profileIndex, //profile changed
        () => {
          console.log("profile changed");
          SummitRouter.getInstance().resetMenu();
          context.dispatch("getPresentedAwards");
          context.dispatch("getAchievements");
        },
      );
    },
  },
  getters: {
    getMessage(state: { message: string }) {
      return state.message;
    },
    getHelpButton(state: { helpButton: boolean }) {
      return state.helpButton;
    },
    getAchievements(state, _getters, _rootState, rootGetters) {
      const FIVE_MINS = 5 * 60 * 1000;
      if (state.achievementsTimestamp == null || Date.now() - state.achievementsTimestamp > FIVE_MINS) {
        rootGetters.dispatch("getAchievements");
      }
      return state.achievements;
    },
    getPresentedAwards(state, _getters, _rootState, rootGetters) {
      const FIVE_MINS = 5 * 60 * 1000;
      if (state.presentedAwardsTimestamp == null || Date.now() - state.presentedAwardsTimestamp > FIVE_MINS) {
        rootGetters.dispatch("getPresentedAwards");
      }
      return state.presentedAwards;
    },
  },
};

export default SummitModule;
