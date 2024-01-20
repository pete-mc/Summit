import { ActionContext, Module } from "vuex/types/index";

interface RootState {}
interface State {
  message: string;
  helpButton: boolean;
}

const savedState = localStorage.getItem("SummitState");
const initialState: State = savedState
  ? JSON.parse(savedState)
  : {
      message: "Welcome To Summit!",
      helpButton: true,
    };

const SummitModule: Module<State, RootState> = {
  namespaced: true,
  state: initialState,
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
    saveState() {
      localStorage.setItem("SummitState", JSON.stringify(window.$nuxt.$store.state.Summit));
      console.log("SummitState saved");
    },
  },
  actions: {
    setMessage({ commit }: ActionContext<State, RootState>, message: string): void {
      commit("updateMessage", message);
      commit("saveState");
    },
    toggleHelpButton({ commit }: ActionContext<State, RootState>): void {
      console.log("toggle help");
      commit("toggleHelpButton");
      commit("saveState");
    },
  },
  getters: {
    getMessage(state: { message: string }) {
      return state.message;
    },
    getHelpButton(state: { helpButton: boolean }) {
      return state.helpButton;
    },
  },
};

export default SummitModule;
