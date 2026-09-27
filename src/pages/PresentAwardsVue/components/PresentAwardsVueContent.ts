import { defineComponent } from "vue";
import type { PropType } from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import PresentAwardsTableVue from "./PresentAwardsTableVue.vue";
import PresentAwardsFiltersVue from "./PresentAwardsFiltersVue.vue";
import type { PresentAwardsDisplayFilters } from "./PresentAwardsFiltersVue";
import { filterPresentAwardRows, NOT_PRESENTED } from "./PresentAwardsTableVue";
import { DEFAULT_FILTERS, loadPresentAwardsVueFilters, savePresentAwardsVueFilters, type PresentAwardsVueFilterState } from "../services/PresentAwardsVueFilterPersistence";
import { exportGridToExcel, exportGridToPdf, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { createLogger } from "@/helpers";

const logger = createLogger("PresentAwardsVueContent");

const FEEDBACK_TIMEOUT_MS = 4000;
/** Longer, because a merge notice reports something the user did not already know. */
const MERGE_FEEDBACK_TIMEOUT_MS = 10000;

export const NOTHING_SELECTED_MESSAGE = "No new awards were selected as presented.";
export const SAVED_MESSAGE = "Saved.";
export const DISCARD_EDITS_PROMPT = "Refreshing will discard your unsaved changes. Continue?";

/**
 * The five columns the React page exports — the Present checkbox is not data, so it stays out.
 * File names and titles match the React page's too, so the two pages produce interchangeable files.
 */
const TABLE_EXPORT_COLUMNS: GridExportColumn[] = [
  { key: "member", header: "Name" },
  { key: "type", header: "Type" },
  { key: "achievementName", header: "Award" },
  { key: "dateAwarded", header: "Date" },
  { key: "presented", header: "Presented" },
];

function loadInitialFilters(): PresentAwardsVueFilterState {
  // Merged OVER the defaults, so state saved by an older build that lacks a newer key still
  // produces a complete object.
  return { ...DEFAULT_FILTERS, ...(loadPresentAwardsVueFilters() ?? {}) };
}

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
  components: { PresentAwardsTableVue, PresentAwardsFiltersVue },
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, default: () => [] },
    loadState: { type: String, default: "loading" },
    onSave: { type: Function as PropType<(presentedItems: SummitAchievement[]) => Promise<{ error?: string; mergeNotice?: string }>>, default: undefined },
    onReload: { type: Function as PropType<() => Promise<void>>, default: undefined },
  },
  data() {
    const initialFilters = loadInitialFilters();
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
      /** Per-column filter values, lifted here so this component can reuse the filtered set. */
      columnFilters: initialFilters.columnFilters,
      /** Matches the React page's default: already-presented awards are hidden until asked for. */
      showPreviouslyPresented: initialFilters.showPreviouslyPresented,
      groupByMember: initialFilters.groupByMember,
      isReloading: false,
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
    /** Bundled for the filters component, which takes the whole display-filter object as a prop. */
    displayFilters(): PresentAwardsDisplayFilters {
      return { showPreviouslyPresented: this.showPreviouslyPresented, groupByMember: this.groupByMember };
    },
    visibleItems(): SummitAchievement[] {
      if (this.showPreviouslyPresented) return this.items;
      return this.items.filter((item) => !item.previouslyPresented);
    },
    /**
     * The rows actually on screen. Computed here as well as in the table because there is no way
     * to ask a live v-data-table which rows it is currently showing — and export must match what
     * the user can see.
     */
    filteredItems(): SummitAchievement[] {
      return filterPresentAwardRows(this.visibleItems, this.columnFilters, (item) => this.presentedValueFor(item));
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
    /**
     * What the row currently shows.
     *
     * The selection is the source of truth, not the stored value: unticking a row clears its
     * pending date, and falling back to `item.presented` at that point would report a date for a
     * row the user has just marked as not presented.
     */
    presentedValueFor(item: SummitAchievement): string {
      if (!this.selectedIds.has(item.id)) return "";
      return this.presentedDates[item.id] ?? (item.presented !== NOT_PRESENTED ? item.presented : "");
    },
    /**
     * Called directly from each handler rather than from a watcher: Vue 2 watchers fire on the
     * next tick, so a filter change followed immediately by navigating away could lose the write.
     */
    persistFilters() {
      savePresentAwardsVueFilters({
        columnFilters: this.columnFilters,
        showPreviouslyPresented: this.showPreviouslyPresented,
        groupByMember: this.groupByMember,
      });
    },
    onColumnFiltersUpdate(columnFilters: Record<string, string>) {
      this.columnFilters = columnFilters;
      this.persistFilters();
    },
    onDisplayFiltersUpdate(filters: PresentAwardsDisplayFilters) {
      this.showPreviouslyPresented = filters.showPreviouslyPresented;
      this.groupByMember = filters.groupByMember;
      this.persistFilters();
    },
    showFeedback(message: string, timeoutMs: number = FEEDBACK_TIMEOUT_MS) {
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedback = message;
      this.feedbackTimer = setTimeout(() => {
        this.feedback = "";
      }, timeoutMs);
    },
    /**
     * Export rows carry the value currently ON SCREEN for the Presented column, not the value
     * loaded from the storage event — otherwise exporting before saving produces a file that
     * disagrees with what the user is looking at.
     */
    exportRows(): GridExportRow[] {
      return this.filteredItems.map((item) => ({
        member: item.member,
        type: item.type,
        achievementName: item.achievementName,
        dateAwarded: item.dateAwarded,
        presented: this.presentedValueFor(item) || NOT_PRESENTED,
      }));
    },
    onExcelExportClick() {
      try {
        exportGridToExcel({
          fileName: "Awards.xlsx",
          title: "Awards Completed",
          rows: this.exportRows(),
          columns: TABLE_EXPORT_COLUMNS,
        });
        this.showFeedback("Excel export complete");
      } catch (e) {
        logger.error("Excel export failed:", e);
        this.showFeedback(`Excel export failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    },
    onPdfExportClick() {
      try {
        exportGridToPdf({
          fileName: "Awards.pdf",
          title: "Terrain | Summit - Awards Completed",
          rows: this.exportRows(),
          columns: TABLE_EXPORT_COLUMNS,
          orientation: "landscape",
        });
        this.showFeedback("PDF export complete");
      } catch (e) {
        logger.error("PDF export failed:", e);
        this.showFeedback(`PDF export failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    },
    async onReloadClick() {
      // Reloading re-seeds the selection and dates from fresh data, so any unsaved ticks would
      // vanish. Silent data loss behind a button labelled "Refresh" is worth one confirmation.
      if (this.hasUnsavedEdits && !window.confirm(DISCARD_EDITS_PROMPT)) {
        return;
      }

      this.isReloading = true;
      try {
        if (this.onReload) await this.onReload();
      } finally {
        this.isReloading = false;
      }
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
        const outcome = this.onSave ? await this.onSave(presentedItems) : {};
        // A merge notice is already a full sentence about what happened, so it replaces the plain
        // "Saved." rather than being appended — and it stays up longer, since it is telling the
        // user something they did not know rather than confirming something they just did.
        if (outcome.error) {
          this.showFeedback(`Save failed: ${outcome.error}`);
        } else if (outcome.mergeNotice) {
          this.showFeedback(outcome.mergeNotice, MERGE_FEEDBACK_TIMEOUT_MS);
        } else {
          this.showFeedback(SAVED_MESSAGE);
        }
      } finally {
        this.isSaving = false;
      }
    },
  },
});
