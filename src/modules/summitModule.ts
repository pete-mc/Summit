/* eslint-disable @typescript-eslint/no-explicit-any */
const Summit = {
  namespaced: true,
  state: {
    // Initial state
    message: "Bob",
  },
  mutations: {
    // Mutation to update the state
    updateMessage(state: { message: any }, newMessage: any) {
      console.log("updateMessage in Summit module", newMessage);
      state.message = newMessage;
    },
  },
  actions: {
    // Action to commit the mutation
    setMessage({ commit }: any, message: any) {
      console.log("setMessage in Summit module:", message);
      commit("updateMessage", message);
    },
  },
  getters: {
    // Getter to access the state
    getMessage(state: { message: any }) {
      console.log("getMessage in Summit module:", state.message);
      return state.message;
    },
  },
};

export default Summit;
