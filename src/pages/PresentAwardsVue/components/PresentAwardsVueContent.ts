import { defineComponent } from "vue";
import type { PropType } from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import PresentAwardsTableVue from "./PresentAwardsTableVue.vue";

/**
 * Root of the second (Vuetify-registered) Vue instance for the Present Awards page — see
 * PresentAwardsVue.ts for why this is mounted separately from Terrain's own Vue.
 *
 * This component owns all page-level state. Child components are presentational and emit.
 */
export default defineComponent({
  name: "PresentAwardsVueContent",
  components: { PresentAwardsTableVue },
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, default: () => [] },
    loadState: { type: String, default: "loading" },
  },
});
