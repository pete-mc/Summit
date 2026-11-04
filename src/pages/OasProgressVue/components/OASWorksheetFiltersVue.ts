import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";
import type { SkillStream } from "@/pages/OasProgressVue/services/skillStreams";

type ShowOption = "worksheetBreakByPatrol" | "worksheetShowCompleted";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);
const LAYOUT_OPTIONS: Array<{ value: OASProgressVueFilterState["worksheetLayout"]; text: string }> = [
  { value: "membersAsRows", text: "Members as rows" },
  { value: "membersAsColumns", text: "Members as columns" },
];

export default defineComponent({
  name: "OASWorksheetFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressVueFilterState>, required: true },
    skillStreams: { type: Array as PropType<SkillStream[]>, required: true },
    skillStream: { type: String, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      stageOptions: STAGE_OPTIONS,
      layoutOptions: LAYOUT_OPTIONS,
    };
  },
  computed: {
    skillStreamOptions(): Array<{ value: string; text: string }> {
      return this.skillStreams.map((s) => ({ value: s.key, text: s.label }));
    },
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
    patch(partial: Partial<OASProgressVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onShowChange(selected: ShowOption[]) {
      const partial: Partial<OASProgressVueFilterState> = {};
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
