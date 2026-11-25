import { TerrainRootState } from "@/types/terrainState";
import Vue, { defineComponent } from "vue";
import FilterDefaultsVue from "./components/FilterDefaultsVue.vue";
import { createLogger } from "@/helpers";

const logger = createLogger("DisplayOptions");

interface MountedInstance {
  $mount(el: HTMLElement): void;
  $destroy(): void;
}

export default defineComponent({
  data() {
    return {
      // Local data property to store the message
      helpbutton: this.$store.state.Summit.helpButton,
      filterDefaultsInstance: undefined as MountedInstance | undefined,
    };
  },
  methods: {
    /** Gotcha: Vuetify components only resolve on Summit's own Vue (src/vuetifySetup.ts), so this section is a second Vue instance. */
    mountFilterDefaults() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const FilterDefaultsApp: any = Vue.extend(FilterDefaultsVue);
      this.filterDefaultsInstance = new FilterDefaultsApp({ vuetify: window.summitVuetify }) as MountedInstance;
      this.filterDefaultsInstance.$mount(this.$refs.filterDefaultsRoot as HTMLElement);
    },
    updateHelpButton() {
      this.$store.dispatch("Summit/toggleHelpButton", this.helpbutton);
      logger.debug("Help button updated to " + this.helpbutton);
    },
  },

  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters["Summit/getHelpButton"];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.Summit.helpButton": function (newVal) {
      this.helpbutton = newVal;
    },
  },
  beforeDestroy() {
    this.filterDefaultsInstance?.$destroy();
    this.filterDefaultsInstance = undefined;
  },
  mounted() {
    this.mountFilterDefaults();
    // Initialize local message from Vuex store
    this.helpbutton = this.$store.state.Summit.helpButton;
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: "Summit",
        disabled: false,
        to: "/summit/home",
        exact: true,
      },
      {
        text: "Tools",
        disabled: true,
        to: "/summit/tools",
        exact: true,
      },
      {
        text: "Display Options",
        disabled: true,
        to: "/summit/tools/DisplayOptions",
        exact: true,
      },
    ];
  },
  // Include other methods as needed...
});
