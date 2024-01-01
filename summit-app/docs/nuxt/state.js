/**
 * Vuex Actions:
 * Actions are similar to mutations, but they are responsible for performing asynchronous operations.
 * An action commits a mutation after an async operation is completed and can call other actions.
 * Actions are dispatched rather than committed and can handle more complex, asynchronous logic.
 * Example: Fetching data from an API and then committing a mutation to update the store with the data.
 */

/**
 * Vuex Mutations:
 * Mutations are functions that directly modify the state of the Vuex store.
 * They are the only way to actually change state in a Vuex store and are synchronous.
 * A mutation receives the current state as the first argument and a payload as the second argument.
 * Mutations are committed, not called directly, to track state changes for debugging purposes.
 * Example: Updating the user information in the store state.
 */

/**
 * Vuex Modules:
 * Vuex allows the store to be divided into modules, each with its own state, mutations, actions, getters, and even nested modules.
 * Modules can help organize and manage the Vuex store by breaking the store into smaller, more manageable pieces.
 * Each module can be namespaced, allowing for the same mutation/action names in different modules without naming conflicts.
 * Modules can be dynamically registered and unregistered with the store, providing flexibility in large applications.
 * Example: A 'user' module handling user state and authentication logic, separate from other store concerns.
 */


// Assuming you have access to the $nuxt object
const nuxtStore = window.$nuxt.$store;

const nuxtStoreBoilerplate = {
    // Get state
    getState() {
        return nuxtStore.state;
    },

    // Get a specific module's state
    getModuleState(moduleName) {
        return nuxtStore.state[moduleName];
    },

    // Commit a mutation
    commitMutation(mutationName, payload) {
        nuxtStore.commit(mutationName, payload);
    },

    // Dispatch an action
    dispatchAction(actionName, payload) {
        return nuxtStore.dispatch(actionName, payload);
    },

    // Getters
    getGetter(getterName) {
        return nuxtStore.getters[getterName];
    },

    // Watch state changes
    watchState(getterFunction, callbackFunction) {
        return nuxtStore.watch(getterFunction, callbackFunction);
    },

    // Subscribe to the store mutations
    subscribeToMutations(callbackFunction) {
        return nuxtStore.subscribe(callbackFunction);
    },

    // Subscribe to the store actions
    subscribeToActions(callbackFunction) {
        return nuxtStore.subscribeAction(callbackFunction);
    },

    // Replace store's state
    replaceState(newState) {
        nuxtStore.replaceState(newState);
    },

    // Register a new module dynamically
    registerModule(moduleName, moduleDefinition) {
        nuxtStore.registerModule(moduleName, moduleDefinition);
    },

    // Unregister a module dynamically
    unregisterModule(moduleName) {
        nuxtStore.unregisterModule(moduleName);
    },

    // Hot-reloading for mutations, actions, and getters
    hotUpdate(newOptions) {
        nuxtStore.hotUpdate(newOptions);
    }
};

// Example Usage
console.log('Current State:', nuxtStoreBoilerplate.getState());
commitMutation('updateUser', { id: 1, name: 'John Doe' });
await dispatchAction('fetchUserData', { userId: 1 });
const unwatch = watchState(
  state => state.user.data, // Watching `user.data` state
  newValue => console.log('User data changed:', newValue)
);
const unsubscribe = subscribeToMutations((mutation, state) => {
  console.log(`Mutation ${mutation.type} was committed with payload`, mutation.payload);
});
const unsubscribeActions = subscribeToActions(action => {
  console.log(`Action ${action.type} was dispatched with payload`, action.payload);
});
registerModule('newModule', {
  state: { count: 0 },
  mutations: {
      increment(state) { state.count++ }
  }
});
hotUpdate({
  mutations: { newMutation(state, payload) { /* ... */ } },
  actions: { newAction({ commit }, payload) { /* ... */ } }
});