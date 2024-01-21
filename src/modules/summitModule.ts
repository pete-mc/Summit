import { TerrainAchievements } from "../types/terrainTypes";
import { fetchUnitAchievements } from "../helpers/terrainCalls";
import { ActionContext, Module } from "vuex/types/index";

interface RootState {}
interface State {
  message: string;
  helpButton: boolean;
  achievements: TerrainAchievements[];
  achievementsTimestamp: null | number;
}

const SummitModule: Module<State, RootState> = {
  namespaced: true,
  state: {
    ...{
      message: "Welcome To Summit!",
      helpButton: true,
      achievements: [],
      achievementsTimestamp: null,
    },
    ...JSON.parse(localStorage.getItem("SummitState") || "{}"),
  },
  mutations: {
    updateMessage(state: { message: string }, newMessage: string) {
      state.message = newMessage;
    },
    toggleHelpButton(state: { helpButton: boolean }) {
      state.helpButton = !state.helpButton;
      const freshworksContainer = document.getElementById("freshworks-container");
      if (freshworksContainer) {
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
  },
  actions: {
    saveState({ commit }: ActionContext<State, RootState>): void {
      commit("saveStateToLocalStorage");
    },
    setMessage({ commit }: ActionContext<State, RootState>, message: string): void {
      commit("updateMessage", message);
    },
    toggleHelpButton({ commit }: ActionContext<State, RootState>): void {
      commit("toggleHelpButton");
      commit("saveStateToLocalStorage");
    },
    async getAchievements({ commit }: ActionContext<State, RootState>): Promise<void> {
      const achievements = (await fetchUnitAchievements()) as TerrainAchievements[];
      commit("updateAchievements", { achievements, timestamp: Date.now() });
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
      if (!state.achievementsTimestamp || Date.now() - state.achievementsTimestamp > FIVE_MINS) {
        rootGetters.dispatch("getAchievements");
      }
      return state.achievements;
    },
  },
};

export default SummitModule;
