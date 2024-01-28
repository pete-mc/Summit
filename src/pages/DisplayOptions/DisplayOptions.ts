import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      // Local data property to store the message
      helpbutton: this.$store.state.Summit.helpButton,
    };
  },
  methods: {
    updateHelpButton() {
      this.$store.dispatch('Summit/toggleHelpButton', this.helpbutton);
      console.log("Help button updated to " + this.helpbutton);
    }
  },
   
  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters['Summit/getHelpButton'];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.Summit.helpButton": function (newVal) {
      this.helpbutton = newVal;
    },
  },
  mounted() {
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
      }
      ,
      {
        text: "Display Options",
        disabled: true,
        to: "/summit/tools/DisplayOptions",
        exact: true,
      },
    ];
  }
  // Include other methods as needed...
});