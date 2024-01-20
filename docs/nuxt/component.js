/**
 * Vue Component:
 * Vue components are reusable Vue instances with a name. They encapsulate data, methods, and layout of a part of a user interface.
 * Components can have their own state (data), computed properties, methods, watchers, and lifecycle hooks.
 * They can be reused throughout the application and can communicate with each other via props, events, and Vuex store.
 */

export default {
  name: "MyComponent", // The component's name

  // Component Data: Object that holds local state of the component
  data() {
    return {
      count: 0,
    };
  },

  // Computed Properties: Values derived from component data
  computed: {
    doubleCount() {
      return this.count * 2;
    },
  },

  // Component Methods: Functions that can be called from the component's template
  methods: {
    increment() {
      this.count++;
    },
  },

  // Watchers: React to changes in component data or props
  watch: {
    count(newVal, oldVal) {
      console.log(`Count changed from ${oldVal} to ${newVal}`);
    },
  },

  // Lifecycle Hooks: Functions that provide visibility into key stages of the component's lifecycle
  beforeCreate() {
    console.log("Component is about to be created");
  },
  created() {
    console.log("Component has been created");
    // Example of a vue event bus listener
    this.$eventBus.$on("userUpdated", (data) => {
      // React to the event
    });
  },
  beforeMount() {
    console.log("Component is about to be mounted to the DOM");
  },
  mounted() {
    console.log("Component has been mounted to the DOM");
  },
  beforeUpdate() {
    console.log("Component is about to update");
  },
  updated() {
    console.log("Component has been updated");
  },
  beforeDestroy() {
    console.log("Component is about to be destroyed");
    // example clean up
    this.$eventBus.$off("userUpdated");
  },
  destroyed() {
    console.log("Component has been destroyed");
  },

  // Example of using a Prop
  props: {
    message: String,
  },

  // Example of Emitting an Event
  emitEvent() {
    this.$emit("myEvent", "Hello from MyComponent");
  },
};

//register a component
if (window.$nuxt && window.$nuxt.$root) {
  window.$nuxt.$root.$options.components["my-new-component"] = MyComponent;
}
