/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Module, VuexModule, Mutation, Action, getModule } from "vuex-module-decorators";

// @Module({ name: "Summit", namespaced: true, dynamic: true, store: window.$nuxt.$store })
// class Summit extends VuexModule {
//   public message = "Bob";

//   @Mutation
//   public updateMessage(newMessage: string): void {
//     console.log("updateMessage in Summit module" + newMessage);
//     this.message = newMessage;
//   }

//   @Action
//   public setMessage(message: string): void {
//     console.log("setMessage in Summit module: " + message);
//     this.updateMessage(message);
//   }

//   get getMessage(): string {
//     console.log("getMessage in Summit module: " + this.message);
//     return this.message;
//   }
// }

// export const summitModule = getModule(Summit, window.$nuxt.$store);

// export default Summit;

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
