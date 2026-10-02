import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

const SKILL_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
  aquatics: "Aquatics",
  boating: "Boating",
  paddling: "Paddling",
  alpine: "Alpine",
  cycling: "Cycling",
  vertical: "Vertical",
};

const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);
const LAYOUT_OPTIONS: Array<{ value: OASProgressionVueFilterState["worksheetLayout"]; text: string }> = [
  { value: "membersAsColumns", text: "Members as columns" },
  { value: "membersAsRows", text: "Members as rows" },
];

/**
 * Filter bar for the Worksheets view — a smaller, separate component from
 * OASProgressionFiltersVue (the heat map's own filter bar), not a reuse of it. That component is
 * bound tightly to the heat map's own six display checkboxes and two selects (groupBy/sortBy)
 * which the worksheet has no use for; threading a mode flag through every one of its controls
 * would be worse than a second small component. See .claude/OASWorksheets/PLAN_STAGE_3.md §3.
 *
 * Owns no state of its own: receives `filters` as a prop and emits `update:filters` with the
 * patched object, matching OASProgressionFiltersVue's own contract so OasProgressionVueContent.vue
 * stays the single source of truth (and the one place that persists to localStorage).
 */
export default defineComponent({
  name: "OASWorksheetFiltersVue",
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: SKILL_TITLES[skill] ?? skill })),
      stageOptions: STAGE_OPTIONS,
      layoutOptions: LAYOUT_OPTIONS,
    };
  },
  methods: {
    patch(partial: Partial<OASProgressionVueFilterState>) {
      this.$emit("update:filters", { ...this.filters, ...partial });
    },
    onStageMinChange(value: number) {
      this.patch({ worksheetStageRange: [Math.min(value, this.filters.worksheetStageRange[1]), this.filters.worksheetStageRange[1]] });
    },
    onStageMaxChange(value: number) {
      this.patch({ worksheetStageRange: [this.filters.worksheetStageRange[0], Math.max(value, this.filters.worksheetStageRange[0])] });
    },
    onUseCodenamesChange(value: boolean) {
      this.patch({ worksheetUseCodenames: value });
    },
    resetFilters() {
      this.$emit("reset");
    },
  },
});
