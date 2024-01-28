import { TerrainRootState } from '@/types/terrainState';
import { defineComponent } from 'vue';
export default defineComponent({
  data() {
    return {
      // Local data property to store the message
      first_name: "there",
    };
  },
  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters['user/getMemberFirstName'];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.user.memberDetails.first_name": function (newVal) {
      this.first_name = newVal;
    },
  },
  mounted() {
    // Initialize local message from Vuex store
    this.first_name = this.$store.state.user.memberDetails.first_name;
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: "Summit",
        disabled: true,
        to: "/summit",
        exact: true,
      },
    ];
  },
  // Include other methods as needed...
});