import { defineComponent } from "vue";
import FilterDefaultsVue from "./FilterDefaultsVue.vue";

export default defineComponent({
  name: "DisplayOptionsTabsVue",
  components: { FilterDefaultsVue },
  data() {
    return {
      tab: "filters",
    };
  },
});
