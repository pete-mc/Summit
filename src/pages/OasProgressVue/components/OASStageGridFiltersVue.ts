import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";
import type { SkillStream } from "@/pages/OasProgressVue/services/skillStreams";

type ShowOption = "stageGridBreakByPatrol" | "stageGridShowCompleted";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

const LAYOUT_OPTIONS: Array<{ value: OASProgressVueFilterState["stageGridLayout"]; text: string }> = [
  { value: "membersAsColumns", text: "Members as columns" },
  { value: "membersAsRows", text: "Members as rows" },
];

const SORT_OPTIONS: Array<{ value: OASProgressVueFilterState["stageGridSortBy"]; text: string }> = [
  { value: "firstName", text: "First name" },
  { value: "lastName", text: "Last name" },
];

export default defineComponent({
  name: "OASStageGridFiltersVue",
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressVueFilterState>, required: true },
    skillStreams: { type: Array as PropType<SkillStream[]>, required: true },
    skillStream: { type: String, required: true },
    stage: { type: Number as PropType<number | null>, default: null },
    stageOptions: { type: Array as PropType<number[]>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      layoutOptions: LAYOUT_OPTIONS,
      sortOptions: SORT_OPTIONS,
    };
  },
  computed: {
    skillStreamOptions(): Array<{ value: string; text: string }> {
      return this.skillStreams.map((s) => ({ value: s.key, text: s.label }));
    },
    showOptions(): ShowSelectItem[] {
      const items: ShowSelectItem[] = [{ header: "Members" }, { value: "stageGridShowCompleted", text: "Awarded" }];
      if (this.availablePatrols.length > 0) {
        items.push({ divider: true }, { header: "Grouping" }, { value: "stageGridBreakByPatrol", text: "Break by patrol" });
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
    /** Saves the stage on screen, so the new skill keeps it if it has that stage (otherwise its lowest shows). */
    onSkillStreamChange(stageGridSkillStream: string) {
      this.patch({ stageGridSkillStream, stageGridStage: this.stage });
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
