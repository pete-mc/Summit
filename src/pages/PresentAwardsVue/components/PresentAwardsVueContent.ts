import { defineComponent } from "vue";
import type { PropType } from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import PresentAwardsTableVue from "./PresentAwardsTableVue.vue";
import PresentAwardsFiltersVue from "./PresentAwardsFiltersVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import SummitPrintButton from "@/components/SummitPrintButton.vue";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { buildPresentAwardsPrintMeta } from "../services/presentAwardsPrintMeta";
import type { MetaEntry } from "@/print/summitPrint";
import type { PresentAwardsDisplayFilters } from "./PresentAwardsFiltersVue";
import type { PresentAwardsExportView } from "./PresentAwardsTableVue";
import { DEFAULT_FILTERS, loadPresentAwardsVueFilters, savePresentAwardsVueFilters, type PresentAwardsVueFilterState } from "../services/PresentAwardsVueFilterPersistence";
import { exportExcelSheet } from "@/excel/summitExcel";
import { buildPresentAwardsSheet } from "@/excel/sheets/presentAwards";
import { createLogger } from "@/helpers";

const logger = createLogger("PresentAwardsVueContent");

interface PresentAwardsTablePrintApi {
  prepareForPrint(): Promise<() => void>;
  getPrintTable(): HTMLTableElement | undefined;
  getExportView(): PresentAwardsExportView;
}

const FEEDBACK_TIMEOUT_MS = 4000;
/** Longer: a merge notice tells the user something new. */
const MERGE_FEEDBACK_TIMEOUT_MS = 10000;

export const NOTHING_SELECTED_MESSAGE = "No new awards were selected as presented.";
export const SAVED_MESSAGE = "Saved.";
export const DISCARD_EDITS_PROMPT = "Refreshing will discard your unsaved changes. Continue?";

function loadInitialFilters(): PresentAwardsVueFilterState {
  // Spread over defaults so older saved state missing new keys is still complete.
  return { ...DEFAULT_FILTERS, ...(loadPresentAwardsVueFilters() ?? {}) };
}

/** Owns ALL edit state, keyed by achievement id so it survives sort, filter and reload. The table only emits intent. */
export default defineComponent({
  name: "PresentAwardsVueContent",
  components: { PresentAwardsTableVue, PresentAwardsFiltersVue, SummitLoadingState, SummitPillButton, SummitPrintButton },
  props: {
    items: { type: Array as PropType<SummitAchievement[]>, default: () => [] },
    loadState: { type: String, default: "loading" },
    onSave: { type: Function as PropType<(presentedItems: SummitAchievement[]) => Promise<{ error?: string; mergeNotice?: string }>>, default: undefined },
    onReload: { type: Function as PropType<() => Promise<void>>, default: undefined },
  },
  data() {
    const initialFilters = loadInitialFilters();
    return {
      /** Gotcha: Vue 2 can't observe Set mutations. Always replace the Set, or the checkbox won't re-render. */
      selectedIds: new Set<string>(),
      /** Gotcha: Vue 2 can't see added keys either, so replace rather than index-assign. */
      presentedDates: {} as Record<string, string>,
      isSaving: false,
      feedback: "",
      feedbackTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      columnFilters: initialFilters.columnFilters,
      showPreviouslyPresented: initialFilters.showPreviouslyPresented,
      groupByMember: initialFilters.groupByMember,
      isReloading: false,
      isExcelExporting: false,
    };
  },
  watch: {
    // Reseed edit state from each fresh load so checkboxes match what's stored.
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
    /** Gotcha: Save and Refresh re-run the load. Gating on loadState alone would blank the table on every save. */
    hasContent(): boolean {
      return this.items.length > 0;
    },
    sharedLoadState(): "loading" | "ready" | "error" {
      if (this.loadState === "error") return "error";
      return this.loadState === "loading" && !this.hasContent ? "loading" : "ready";
    },
    /** Runs before the column filters, so the Type dropdown only offers values that can match. */
    displayFilters(): PresentAwardsDisplayFilters {
      return { showPreviouslyPresented: this.showPreviouslyPresented, groupByMember: this.groupByMember };
    },
    visibleItems(): SummitAchievement[] {
      if (this.showPreviouslyPresented) return this.items;
      return this.items.filter((item) => !item.previouslyPresented);
    },
    presentAwardsPrintMeta(): MetaEntry[] {
      return buildPresentAwardsPrintMeta(this.columnFilters);
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
        // Ticking defaults the presented date to the awarded date (as the React page does).
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
    /** Gotcha: called from each handler, not a watcher. Watchers fire next tick and the write could be lost on navigation. */
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
    /** Edit state (ticks, dates) is not a filter and is kept. */
    onResetFilters() {
      this.columnFilters = { ...DEFAULT_FILTERS.columnFilters };
      this.showPreviouslyPresented = DEFAULT_FILTERS.showPreviouslyPresented;
      this.groupByMember = DEFAULT_FILTERS.groupByMember;
      this.persistFilters();
    },
    showFeedback(message: string, timeoutMs: number = FEEDBACK_TIMEOUT_MS) {
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedback = message;
      this.feedbackTimer = setTimeout(() => {
        this.feedback = "";
      }, timeoutMs);
    },
    async onExcelExportClick() {
      const table = this.$refs.table as unknown as PresentAwardsTablePrintApi | undefined;
      if (!table) return;
      this.isExcelExporting = true;
      try {
        await exportExcelSheet({
          printProfile: "present-awards",
          meta: this.presentAwardsPrintMeta,
          fileNameParts: ["Present Awards"],
          build: (header, logo) => buildPresentAwardsSheet({ view: table.getExportView(), header, logo }),
        });
        this.showFeedback("Excel export complete");
      } catch (e) {
        logger.error("Excel export failed:", e);
        this.showFeedback(`Excel export failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      } finally {
        this.isExcelExporting = false;
      }
    },
    presentAwardsPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.table as unknown as PresentAwardsTablePrintApi | undefined)?.getPrintTable();
    },
    async preparePresentAwardsPrint(): Promise<(() => void) | void> {
      const table = this.$refs.table as unknown as PresentAwardsTablePrintApi | undefined;
      return table ? table.prepareForPrint() : undefined;
    },
    async onReloadClick() {
      // A reload discards unsaved ticks, so confirm first.
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

      // The only place SummitAchievement is mutated.
      const presentedItems = this.items.filter((item) => this.selectedIds.has(item.id));
      presentedItems.forEach((item) => item.updatePresented(this.presentedDates[item.id] ?? item.dateAwarded));

      this.isSaving = true;
      try {
        const outcome = this.onSave ? await this.onSave(presentedItems) : {};
        // A merge notice replaces "Saved." and stays up longer.
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
