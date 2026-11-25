import { defineComponent } from "vue";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { showTerrainToast } from "@/helpers";
import { NAME_FORMAT_OPTIONS } from "@/shared/nameFormat";
import { loadFilterDefaults, markFilterDefaultsApplied, resetFilterDefaults, saveFilterDefaults, type CommonFilterDefaults } from "@/shared/filterDefaults";

type SwitchKey = "breakByPatrol" | "showApproved" | "showSkillsNotStarted" | "showStagesNotStarted";

export const SORT_OPTIONS: Array<{ value: CommonFilterDefaults["sortBy"]; text: string }> = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
];

export const SWITCHES: Array<{ key: SwitchKey; label: string; usedOn: string }> = [
  { key: "breakByPatrol", label: "Break by patrol", usedOn: "OAS Progress: Summary, Peak Award, Heat Map, Stage Grid" },
  { key: "showApproved", label: "Show approved", usedOn: "OAS Progress: Heat Map, Stage Grid" },
  { key: "showSkillsNotStarted", label: "Show skills not started", usedOn: "OAS Progress: Summary, Heat Map" },
  { key: "showStagesNotStarted", label: "Show stages not started", usedOn: "OAS Progress: Heat Map" },
];

export default defineComponent({
  name: "FilterDefaultsVue",
  components: { SummitPillButton },
  data() {
    return {
      defaults: loadFilterDefaults(),
      nameFormatOptions: NAME_FORMAT_OPTIONS,
      sortOptions: SORT_OPTIONS,
      switches: SWITCHES,
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
