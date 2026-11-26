import { defineComponent } from "vue";
import NameFormatSelect from "@/components/NameFormatSelect.vue";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { showTerrainToast } from "@/helpers";
import { loadFilterDefaults, markFilterDefaultsApplied, resetFilterDefaults, saveFilterDefaults, type CommonFilterDefaults } from "@/shared/filterDefaults";

type ShowKey = "breakByPatrol" | "showApproved" | "showSkillsNotStarted" | "showStagesNotStarted";

export const SORT_OPTIONS: Array<{ value: CommonFilterDefaults["sortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
];

export const SHOW_OPTIONS: Array<{ key: ShowKey; label: string }> = [
  { key: "breakByPatrol", label: "Break by patrol" },
  { key: "showApproved", label: "Approved" },
  { key: "showSkillsNotStarted", label: "Skills not started" },
  { key: "showStagesNotStarted", label: "Stages not started" },
];

export default defineComponent({
  name: "FilterDefaultsVue",
  components: { NameFormatSelect, SummitPillButton },
  data() {
    return {
      defaults: loadFilterDefaults(),
      sortOptions: SORT_OPTIONS,
      showOptions: SHOW_OPTIONS,
      confirmApplyOpen: false,
    };
  },
  methods: {
    update(partial: Partial<CommonFilterDefaults>) {
      this.defaults = { ...this.defaults, ...partial };
      saveFilterDefaults(this.defaults);
    },
    resetToSystemDefaults() {
      resetFilterDefaults();
      this.defaults = loadFilterDefaults();
      showTerrainToast("Filter defaults reset to Summit's defaults.");
    },
    applyToAllPages() {
      markFilterDefaultsApplied();
      this.confirmApplyOpen = false;
      showTerrainToast("Defaults applied. Each report picks them up the next time it opens.");
    },
  },
});
