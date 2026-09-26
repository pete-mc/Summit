import { defineComponent } from "vue";
import type { PropType } from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import PresentAwardsTableVue from "./PresentAwardsTableVue.vue";

const FEEDBACK_TIMEOUT_MS = 4000;

export const NOTHING_SELECTED_MESSAGE = "No new awards were selected as presented.";
export const SAVED_MESSAGE = "Saved.";

/**
 * Root of the second (Vuetify-registered) Vue instance for the Present Awards page — see
 * PresentAwardsVue.ts for why this is mounted separately from Terrain's own Vue.
 *
 * This component owns ALL edit state. The table is presentational: it receives the current
 * selection/dates as props and emits intent, never mutating anything itself.
 *
 * Edit state is keyed by achievement id rather than row index, so it survives a sort, a filter,
 * or a reload of the underlying items.
 */
export default defineComponent({
  name: "PresentAwardsVueContent",
  components: { PresentAwardsTableVue },
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, default: () => [] },
    loadState: { type: String, default: "loading" },
    onSave: { type: Function as PropType<(presentedItems: SummitAchievement[]) => Promise<string | null>>, default: undefined },
  },
  data() {
    return {
      /**
       * Ticked achievement ids. Vue 2 cannot observe Set mutations (no .add()/.delete()
       * interception), so every change REPLACES this with a new Set — mutating in place would
       * update the data without ever re-rendering the checkbox.
       */
      selectedIds: new Set<string>(),
      /**
       * Achievement id -> "DD/MM/YYYY". Vue 2 also cannot detect keys added to a plain object
       * after it was made reactive, so this is likewise replaced rather than index-assigned.
       */
      presentedDates: {} as Record<string, string>,
      isSaving: false,
      feedback: "",
      feedbackTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      /** Per-column filter values, lifted here so the parent can reuse the filtered set. */
      columnFilters: {} as Record<string, string>,
      /** Matches the React page's default: already-presented awards are hidden until asked for. */
      showPreviouslyPresented: false,
    };
  },
  watch: {
    // Reseed edit state whenever a fresh set of items arrives (initial load, or a reload after
    // saving), so the checkboxes reflect what is actually stored rather than a stale selection.
    items: {
      immediate: true,
      handler() {
        this.resetEditState();
      },
    },
  },
  beforeDestroy() {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  },
  computed: {
    /**
     * The hide-previously-presented toggle runs UPSTREAM of the column filters, so the Type
     * dropdown's options (derived from what the table is given) only ever offer values that could
     * actually match something currently in scope.
     */
    visibleItems(): SummitAchievement[] {
      if (this.showPreviouslyPresented) return this.items;
      return this.items.filter((item) => !item.previouslyPresented);
    },
    hasUnsavedEdits(): boolean {
      const stored = this.items.filter((item) => item.presented !== "No");
      if (stored.length !== this.selectedIds.size) return true;
      if (stored.some((item) => !this.selectedIds.has(item.id))) return true;
      return Object.entries(this.presentedDates).some(([id, date]) => {
        const item = this.items.find((candidate) => candidate.id === id);
        return item ? item.presented !== date : false;
      });
    },
  },
  methods: {
    resetEditState() {
      this.selectedIds = new Set(this.items.filter((item) => item.presented !== "No").map((item) => item.id));
      this.presentedDates = this.items.reduce(
        (dates, item) => {
          if (item.presented !== "No") dates[item.id] = item.presented;
          return dates;
        },
        {} as Record<string, string>,
      );
    },
    onTogglePresent(item: SummitAchievement, isSelected: boolean) {
      const nextSelected = new Set(this.selectedIds);
      const nextDates = { ...this.presentedDates };

      if (isSelected) {
        nextSelected.add(item.id);
        // Matches the React page: ticking an unpresented award defaults its presentation date to
        // the date it was awarded.
        if (!nextDates[item.id]) nextDates[item.id] = item.dateAwarded;
      } else {
        nextSelected.delete(item.id);
        delete nextDates[item.id];
      }

      this.selectedIds = nextSelected;
      this.presentedDates = nextDates;
    },
    onUpdateDate(item: SummitAchievement, displayDate: string) {
      this.presentedDates = { ...this.presentedDates, [item.id]: displayDate };
    },
    onColumnFiltersUpdate(columnFilters: Record<string, string>) {
      this.columnFilters = columnFilters;
    },
    onToggleShowPreviouslyPresented() {
      this.showPreviouslyPresented = !this.showPreviouslyPresented;
    },
    showFeedback(message: string) {
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedback = message;
      this.feedbackTimer = setTimeout(() => {
        this.feedback = "";
      }, FEEDBACK_TIMEOUT_MS);
    },
    async onSaveClick() {
      if (this.selectedIds.size === 0) {
        this.showFeedback(NOTHING_SELECTED_MESSAGE);
        return;
      }

      // Apply the pending edits onto the model instances only now, at save time — this is the
      // one place SummitAchievement is mutated, keeping the model (and its existing tests)
      // untouched by the editing flow.
      const presentedItems = this.items.filter((item) => this.selectedIds.has(item.id));
      presentedItems.forEach((item) => item.updatePresented(this.presentedDates[item.id] ?? item.dateAwarded));

      this.isSaving = true;
      try {
        const error = this.onSave ? await this.onSave(presentedItems) : null;
        this.showFeedback(error ? `Save failed: ${error}` : SAVED_MESSAGE);
      } finally {
        this.isSaving = false;
      }
    },
  },
});
