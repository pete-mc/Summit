//example functions that migth be worth adding to the project

function watchState(statePath, callback) {
  const unwatch = this.$store.watch(
      state => get(state, statePath), // using lodash's get for deep watch
      (newValue, oldValue) => callback(newValue, oldValue)
  );
  return unwatch; // to unwatch later if needed
}

function watchRoute(callback) {
  this.$router.afterEach((to, from) => {
      callback(to, from);
  });
}

function watchEventBus(eventName, callback) {
  EventBus.$on(eventName, data => {
      callback(data);
  });
  return () => EventBus.$off(eventName, callback);
}

function watchMediaQuery(mediaQueryList, callback) {
  mediaQueryList.addListener(e => {
      if (e.matches) {
          callback();
      }
  });
  return () => mediaQueryList.removeListener(callback);  
}


function watchWindowEvent(eventName, callback) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}


function watchStoreMutation(mutationName, callback) {
  this.$store.subscribe((mutation, state) => {
      if (mutation.type === mutationName) {
          callback(mutation.payload);
      }
  });
}

function watchStoreAction(actionName, callback) {
  this.$store.subscribeAction((action, state) => {
      if (action.type === actionName) {
          callback(action.payload);
      }
  });
}

function watchStoreGetter(getterName, callback) {
  this.$store.watch(
      state => state[getterName],
      (newValue, oldValue) => callback(newValue, oldValue)
  );
}

function watchStoreState(statePath, callback) {
  this.$store.watch(
      state => get(state, statePath), // using lodash's get for deep watch
      (newValue, oldValue) => callback(newValue, oldValue)
  );
}

function watchStoreModuleState(moduleName, statePath, callback) {
  this.$store.watch(
      state => get(state[moduleName], statePath), // using lodash's get for deep watch
      (newValue, oldValue) => callback(newValue, oldValue)
  );
}

function watchStoreModuleGetter(moduleName, getterName, callback) {
  this.$store.watch(
      state => state[moduleName][getterName],
      (newValue, oldValue) => callback(newValue, oldValue)
  );
}

function watchStoreModuleMutation(moduleName, mutationName, callback) {
  this.$store.subscribe((mutation, state) => {
      if (mutation.type === `${moduleName}/${mutationName}`) {
          callback(mutation.payload);
      }
  });
}

function watchStoreModuleAction(moduleName, actionName, callback) {
  this.$store.subscribeAction((action, state) => {
      if (action.type === `${moduleName}/${actionName}`) {
          callback(action.payload);
      }
  });
}

function watchStoreModule(moduleName, callback) {
  this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith(`${moduleName}/`)) {
          callback(mutation.payload);
      }
  });
}

function watchDOMelement(element, callback, options = {}) {
  const observer = new MutationObserver(callback);
  observer.observe(element, options);
  return observer;  
}