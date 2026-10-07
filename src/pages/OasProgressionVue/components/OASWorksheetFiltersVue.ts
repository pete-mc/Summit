import { defineComponent } from "vue";
import type { PropType } from "vue";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import NameFormatSelect from "@/components/NameFormatSelect.vue";

/**
 * "Show" dropdown — positive-selection framing replacing the old Display fieldset's two
 * checkboxes; see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md. "Break by patrol" is
 * a plain pass-through flag (no inversion needed); "Awarded" (labelled "Completed" in an
 * earlier pass) replaces the old worksheetHideCompleted, inverted to default-shown. Grouped
 * under "Members"/"Grouping" subheaders, mirroring the Heat Map's own Show dropdown
 * (OASProgressionFiltersVue.ts's showOptions) — same Vuetify { header }/{ divider: true } item
 * entries, no custom slot needed.
 */
type ShowOption = "worksheetBreakByPatrol" | "worksheetShowCompleted";

type ShowSelectItem = { value: ShowOption; text: string } | { header: string } | { divider: true };

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
// "Members as rows" listed first — it's now the default layout (DEV_NOTES.md), shown at the top.
const LAYOUT_OPTIONS: Array<{ value: OASProgressionVueFilterState["worksheetLayout"]; text: string }> = [
  { value: "membersAsRows", text: "Members as rows" },
  { value: "membersAsColumns", text: "Members as columns" },
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
  components: { NameFormatSelect },
  props: {
    filters: { type: Object as PropType<OASProgressionVueFilterState>, required: true },
    availablePatrols: { type: Array as PropType<string[]>, required: true },
    /** Same Patrol filter item list as the Heat Map's (one shared member roster) — see OasProgressionVueContent.ts's patrolFilterOptions. */
    patrolFilterOptions: { type: Array as PropType<string[]>, required: true },
    /** Same gating as the Heat Map's Patrol filter — see OasProgressionVueContent.ts's canFilterByPatrol. */
    canFilterByPatrol: { type: Boolean, default: true },
  },
  data() {
    return {
      skillOptions: OAS_SKILLS.map((skill) => ({ value: skill, text: SKILL_TITLES[skill] ?? skill })),
      stageOptions: STAGE_OPTIONS,
      layoutOptions: LAYOUT_OPTIONS,
    };
  },
  computed: {
    /**
     * "Members" subheader (Awarded) and "Grouping" subheader (Break by patrol, only offered
     * when there's something to group by, matching the old Display fieldset's v-if) — same
     * grouping pattern as the Heat Map's own Show dropdown.
     */
    showOptions(): ShowSelectItem[] {
      const items: ShowSelectItem[] = [{ header: "Members" }, { value: "worksheetShowCompleted", text: "Awarded" }];
      if (this.availablePatrols.length > 0) {
        items.push({ divider: true }, { header: "Grouping" }, { value: "worksheetBreakByPatrol", text: "Break by patrol" });
      }
      return items;
    },
    /** Derived from showOptions (not a static list) so a selection never includes an item that isn't actually present — see OASProgressionFiltersVue.ts's identical showSelection for the full rationale. */
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
