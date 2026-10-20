import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";
import { skillTitle } from "./OASHeatMapVue";

type ShowOption = "worksheetBreakByPatrol" | "worksheetShowCompleted";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);
const LAYOUT_OPTIONS: Array<{ value: OASProgressionVueFilterState["worksheetLayout"]; text: string }> = [
  { value: "membersAsRows", text: "Members as rows" },
  { value: "membersAsColumns", text: "Members as columns" },
];

export default defineComponent({
  name: "OASWorksheetFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: skillTitle(skill) })),
      stageOptions: STAGE_OPTIONS,
      layoutOptions: LAYOUT_OPTIONS,
    };
  },
  computed: {
    showOptions(): ShowSelectItem[] {
      const items: ShowSelectItem[] = [{ header: "Members" }, { value: "worksheetShowCompleted", text: "Awarded" }];
      if (this.availablePatrols.length > 0) {
        items.push({ divider: true }, { header: "Grouping" }, { value: "worksheetBreakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /** Gotcha: derived from showOptions so the selection never holds a value missing from `items`. */
    showSelection(): ShowOption[] {
      const selectableValues = this.showOptions.filter((item): item is { value: ShowOption; text: string } => "value" in item).map((item) => item.value);
      return selectableValues.filter((key) => this.filters[key]);
    },
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onShowChange(selected: ShowOption[]) {
      const partial: Partial<OASProgressionVueFilterState> = {};
      this.showOptions.forEach((item) => {
        if ("value" in item) {
          partial[item.value] = selected.includes(item.value);
        }
      });
      this.patch(partial);
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
