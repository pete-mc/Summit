import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressionFiltersVue from "./OASProgressionFiltersVue.vue";
import OASProgressionTableVue from "./OASProgressionTableVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import { filterOASProgressionRows } from "./OASProgressionTableVue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { collectPatrolNames, OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { loadOASProgressionVueFilters, saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import { exportElementToPdf, exportGridToExcel, exportGridToPdf, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { createLogger } from "@/helpers";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgressionVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

// Matches OASProgressionTableVue.ts's own column set (same flat row shape), so the Table view's
// PDF/Excel export lines up with what's actually shown on screen.
const TABLE_EXPORT_COLUMNS: GridExportColumn[] = [
  { key: "memberName", header: "Member" },
  { key: "stream", header: "Skill" },
  { key: "branch", header: "Stream" },
  { key: "stage", header: "Stage" },
  { key: "inputGroup", header: "Group" },
  { key: "iStatement", header: "I-Statement" },
  { key: "answered", header: "Answered", exportValue: (row) => ((row as unknown as OASProgressionRow).answered ? "Yes" : "No") },
  { key: "awarded", header: "Awarded", exportValue: (row) => ((row as unknown as OASProgressionRow).awarded ? "Yes" : "No") },
  { key: "date", header: "Date", exportValue: (row) => (row as unknown as OASProgressionRow).date?.slice(0, 10) ?? "" },
];

const MAX_STAGE = 9;

const DEFAULT_FILTERS: OASProgressionVueFilterState = {
  viewMode: "heatmap",
  // Skill-first is the original layout, so an existing user sees no change on upgrade.
  groupBy: "skill",
  memberFilter: "",
  hideLastName: false,
  useCodenames: false,
  selectedPatrols: [],
  breakByPatrol: false,
  hideEmptyStreams: false,
  hideEmptyTopColumns: false,
  onlyInProgress: false,
  hideAnswered: false,
  visibleStreams: OAS_SKILLS,
  stageRange: [1, MAX_STAGE],
  sortBy: "firstName",
};

function loadInitialFilters(): OASProgressionVueFilterState {
  const stored = loadOASProgressionVueFilters();
  if (!stored) {
    return DEFAULT_FILTERS;
  }
  return { ...DEFAULT_FILTERS, ...stored };
}

export default defineComponent({
  name: "OasProgressionVueContent",
  components: { OASHeatMapVue, OASProgressionFiltersVue, OASProgressionTableVue, SummitLoadingState },
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    // Vue 2 has no built-in constructor check for Set (only Object/Array/etc.), so `type` is
    // omitted here rather than declared as Object — a Set fails that check at runtime and logs
    // a spurious "[Vue warn]: Invalid prop" despite being exactly the value passed in.
    loadingStreams: { type: null as unknown as PropType<Set<string>>, required: true },
    loadError: { type: Boolean, default: false },
    totalStreams: { type: Number, default: 0 },
    onReloadAll: { type: Function as PropType<() => void>, required: true },
    onReloadStream: { type: Function as PropType<(stream: string) => void>, required: true },
  },
  data() {
    return {
      filters: loadInitialFilters() as OASProgressionVueFilterState,
      isReloading: false,
      exportFeedback: "",
      tableColumnFilters: {} as Record<string, string>,
    };
  },
  computed: {
    /**
     * Drives the shared indicator. Note this page shows the bar WHILE streams are still arriving,
     * rather than instead of the content — see `hasContent` for why.
     */
    sharedLoadState(): "loading" | "ready" | "error" {
      if (this.loadError) return "error";
      return this.loadingStreams.size > 0 ? "loading" : "ready";
    },
    /**
     * Whether to render the heat map alongside the bar.
     *
     * This page deliberately differs from Present Awards and I Statements, which hide their body
     * until loaded. OAS streams arrive one at a time and the heat map renders each as it lands,
     * so hiding everything until all nine finish would make the page feel slower, not faster —
     * and a per-stream reload would blank a full screen of data to reload one skill. Showing
     * partial results with the bar still running is the honest display here: the bar says more
     * is coming.
     */
    hasContent(): boolean {
      return this.items.length > 0;
    },
    /** Streams landed so far, for the running count. */
    streamsDone(): number {
      return Math.max(0, this.totalStreams - this.loadingStreams.size);
    },
    grouped(): Record<string, ReturnType<typeof groupRowsForHeatMap>[string]> {
      return groupRowsForHeatMap(this.items, this.trunkStageCounts, this.members);
    },
    availablePatrols(): string[] {
      return collectPatrolNames(Object.values(this.grouped).flatMap((skill) => skill.sections));
    },
    // Reuses the same filterOASProgressionRows the table itself filters with, so the Table
    // view's export always matches what's currently on screen rather than every row.
    tableFilteredItems(): OASProgressionRow[] {
      return filterOASProgressionRows(this.items, this.tableColumnFilters);
    },
  },
  watch: {
    filters: {
      deep: true,
      handler(newFilters: OASProgressionVueFilterState) {
        saveOASProgressionVueFilters(newFilters);
      },
    },
  },
  methods: {
    onFiltersUpdate(next: OASProgressionVueFilterState) {
      this.filters = next;
    },
    onToggleViewModeClick() {
      this.filters = { ...this.filters, viewMode: this.filters.viewMode === "heatmap" ? "table" : "heatmap" };
    },
    onResetFilters() {
      // Matches the React page's own resetFilters: viewMode is a page-level display choice, not
      // a "filter" to reset, so it survives a reset.
      this.filters = { ...DEFAULT_FILTERS, viewMode: this.filters.viewMode };
    },
    async onReloadAllClick() {
      this.isReloading = true;
      try {
        await this.onReloadAll();
      } finally {
        this.isReloading = false;
      }
    },
    async onPdfExportClick() {
      const heatMap = this.$refs.heatMap as unknown as HeatMapVueInstance | undefined;
      // Asked for rather than reached into: how the heat map renders its table is its own
      // business, and a ref would resolve to a component instance rather than an element if it
      // ever renders through v-data-table.
      const table = heatMap?.getExportTable();
      if (!table) {
        return;
      }

      try {
        await exportElementToPdf({
          element: table,
          fileName: "OASProgressionHeatMapVue.pdf",
          title: "Terrain | Summit - OAS Progression Heat Map (Vue)",
          orientation: "landscape",
        });
        this.exportFeedback = "PDF export complete";
      } catch (e) {
        logger.error("PDF export failed:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        this.exportFeedback = `PDF export failed: ${message}`;
      }
    },
    onTablePdfExportClick() {
      try {
        exportGridToPdf({
          fileName: "OASProgressionVue.pdf",
          title: "Terrain | Summit - OAS Progression (Vue)",
          rows: this.tableFilteredItems as unknown as GridExportRow[],
          columns: TABLE_EXPORT_COLUMNS,
          orientation: "landscape",
        });
        this.exportFeedback = "PDF export complete";
      } catch (e) {
        logger.error("Table PDF export failed:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        this.exportFeedback = `PDF export failed: ${message}`;
      }
    },
    onTableExcelExportClick() {
      try {
        exportGridToExcel({
          fileName: "OASProgressionVue.xlsx",
          title: "OAS Progression (Vue)",
          rows: this.tableFilteredItems as unknown as GridExportRow[],
          columns: TABLE_EXPORT_COLUMNS,
        });
        this.exportFeedback = "Excel export complete";
      } catch (e) {
        logger.error("Table Excel export failed:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        this.exportFeedback = `Excel export failed: ${message}`;
      }
    },
  },
});
