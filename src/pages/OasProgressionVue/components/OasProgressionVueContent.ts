import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressionFiltersVue from "./OASProgressionFiltersVue.vue";
import OASProgressionTableVue from "./OASProgressionTableVue.vue";
import OASWorksheetFiltersVue from "./OASWorksheetFiltersVue.vue";
import OASWorksheetsVue from "./OASWorksheetsVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import { filterOASProgressionRows } from "./OASProgressionTableVue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { collectPatrolNames, hasUnassignedMembers, UNASSIGNED_PATROL, OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { loadOASProgressionVueFilters, saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import { exportElementToPdf, exportGridToExcel, exportGridToPdf, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { createLogger } from "@/helpers";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgressionVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface WorksheetsVueInstance {
  printCurrentPages(): boolean;
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
  nameFormat: "full",
  // null = "not yet resolved" — see OASProgressionVueFilterPersistence.ts's comment on this
  // field. Resolved to the full patrolFilterOptions list by the watcher below once real patrol
  // data has loaded; a reset also lands here via onResetFilters, so it re-resolves the same way.
  selectedPatrols: null,
  breakByPatrol: false,
  showEmptySkillRows: true,
  showEmptyTopStages: true,
  showAwarded: true,
  showNotStarted: true,
  showAnswered: true,
  visibleStreams: OAS_SKILLS,
  visibleStages: Array.from({ length: MAX_STAGE }, (_, i) => i + 1),
  sortBy: "firstName",

  // Worksheets view's own defaults — independent of the heat map's keys above (see
  // OASProgressionVueFilterPersistence.ts's comment on these fields). "Show completed" on by
  // default is what keeps PLAN.md decision 1 (every filtered member gets a column) true by default.
  // Skills/Stages narrowed to Camping/stage 1 by default (DEV_NOTES.md: "To limit processing
  // overhead") rather than the heat map's own "show everything" default — a worksheet is a
  // print target a leader deliberately narrows before printing, not a dashboard to scan broadly.
  worksheetVisibleSkills: ["camping"],
  worksheetVisibleStages: [1],
  worksheetNameFormat: "full",
  // Same null = "not yet resolved" sentinel as selectedPatrols above — see
  // worksheetSelectedPatrols's own comment on OASProgressionVueFilterState.
  worksheetSelectedPatrols: null,
  worksheetBreakByPatrol: false,
  worksheetShowCompleted: true,
  // "Like Terrain" / the large-unit layout, now the default — see worksheetLayout's own doc
  // comment on OASProgressionVueFilterState for the two layouts' tradeoffs.
  worksheetLayout: "membersAsRows",
};

// Exhaustive list of valid viewMode values, kept separately from the type so a present-but-invalid
// stored value (as opposed to a missing key, which the DEFAULT_FILTERS spread already covers) can
// be detected and corrected rather than selecting no tab at all — see PLAN_STAGE_2.md §5.
const VALID_VIEW_MODES: OASProgressionVueFilterState["viewMode"][] = ["heatmap", "table", "worksheets"];

export function sanitiseViewMode(viewMode: unknown): OASProgressionVueFilterState["viewMode"] {
  return VALID_VIEW_MODES.includes(viewMode as OASProgressionVueFilterState["viewMode"]) ? (viewMode as OASProgressionVueFilterState["viewMode"]) : "heatmap";
}

function loadInitialFilters(): OASProgressionVueFilterState {
  const stored = loadOASProgressionVueFilters();
  if (!stored) {
    return DEFAULT_FILTERS;
  }
  const merged = { ...DEFAULT_FILTERS, ...stored };
  return { ...merged, viewMode: sanitiseViewMode(merged.viewMode) };
}

export default defineComponent({
  name: "OasProgressionVueContent",
  components: { OASHeatMapVue, OASProgressionFiltersVue, OASProgressionTableVue, OASWorksheetFiltersVue, OASWorksheetsVue, SummitLoadingState },
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
    /**
     * The Patrol filter dropdown's own item list: named patrols plus, when at least one member
     * has none, the explicit "Unassigned" sentinel (UNASSIGNED_PATROL) — so a user can filter to
     * just the unassigned members, or exclude them, rather than them being silently included or
     * excluded by a rule they can't see or control. Deliberately a separate list from
     * availablePatrols, which stays patrol-names-only since it's also used elsewhere (gating
     * "Break by patrol") where adding a synthetic "Unassigned" item would be wrong — a unit with
     * zero named patrols and every member unassigned has nothing to group by, even though
     * patrolFilterOptions would show one "Unassigned" entry in that case.
     */
    patrolFilterOptions(): string[] {
      const sections = Object.values(this.grouped).flatMap((skill) => skill.sections);
      return hasUnassignedMembers(sections) ? [...this.availablePatrols, UNASSIGNED_PATROL] : this.availablePatrols;
    },
    /**
     * Whether the Patrol filter has any real choice to offer — false when patrolFilterOptions
     * has at most one entry, since a single-item multi-select has nothing to narrow between (see
     * .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md's note on the Patrol filter bug).
     */
    canFilterByPatrol(): boolean {
      return this.patrolFilterOptions.length > 1;
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
    /**
     * Resolves selectedPatrols/worksheetSelectedPatrols: null (a new user, or just after a
     * reset) to the full patrolFilterOptions list the first time real patrol data becomes
     * available — which patrol names exist (and whether "Unassigned" should be offered) isn't
     * known until the heat map's rows have loaded, so this can't simply be a static
     * DEFAULT_FILTERS value. Both Heat Map and Worksheets Patrol filters resolve from the same
     * patrolFilterOptions (one shared member roster, just presented two ways), but each keeps
     * its own independent selection once resolved. Guarded on `=== null` specifically: once
     * resolved (or once a user deliberately empties it), [] means "show nothing" and must never
     * be overwritten again. See .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
     */
    patrolFilterOptions(newOptions: string[]) {
      if (newOptions.length === 0) {
        return;
      }
      const resolved: Partial<OASProgressionVueFilterState> = {};
      if (this.filters.selectedPatrols === null) {
        resolved.selectedPatrols = newOptions;
      }
      if (this.filters.worksheetSelectedPatrols === null) {
        resolved.worksheetSelectedPatrols = newOptions;
      }
      if (Object.keys(resolved).length > 0) {
        this.filters = { ...this.filters, ...resolved };
      }
    },
  },
  methods: {
    onFiltersUpdate(next: OASProgressionVueFilterState) {
      this.filters = next;
    },
    /**
     * v-tabs emits its tab's own `tab-value` string on @change (see the template's explicit
     * `tab-value="heatmap"`/`tab-value="table"`/`tab-value="worksheets"`, rather than relying on
     * v-model's default numeric index — see PLAN_STAGE_2.md §3). viewMode is deliberately not
     * reset by "Reset filters" (see onResetFilters below), so this is the only place it changes.
     */
    onViewModeTabChange(viewMode: OASProgressionVueFilterState["viewMode"]) {
      this.filters = { ...this.filters, viewMode };
    },
    onResetFilters() {
      // Matches the React page's own resetFilters: viewMode is a page-level display choice, not
      // a "filter" to reset, so it survives a reset.
      //
      // selectedPatrols/worksheetSelectedPatrols are resolved here directly rather than left as
      // null for the patrolFilterOptions watcher to pick up: patrol data was already loaded
      // before this reset ran, so patrolFilterOptions's VALUE doesn't change when filters reset
      // — Vue's watcher only fires on an actual change, so it would never fire and both would
      // stay null (which reads as "show nothing" downstream) forever. Resolving synchronously
      // here, the same way the watcher would, fixes "Patrol filter does not default to all ON
      // when reset" — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
      const resolvedPatrols = this.patrolFilterOptions.length > 0 ? this.patrolFilterOptions : null;
      this.filters = { ...DEFAULT_FILTERS, viewMode: this.filters.viewMode, selectedPatrols: resolvedPatrols, worksheetSelectedPatrols: resolvedPatrols };
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
          title: "Terrain | Summit - OAS Progression Heat Map",
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
          title: "Terrain | Summit - OAS Progression",
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
          title: "OAS Progression",
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
    /**
     * Opens a brand-new window containing the Worksheets view's own already-rendered tables and
     * prints it — NOT exportElementToPdf, which rasterizes to a single bitmap and does not fit a
     * multi-page, repeating-header tabular document. See printWorksheets.ts's own comment and
     * .claude/OASWorksheets/PLAN_STAGE_4.md §3 for the full reasoning.
     */
    onWorksheetPrintClick() {
      const worksheets = this.$refs.worksheets as unknown as WorksheetsVueInstance | undefined;
      const opened = worksheets?.printCurrentPages();
      if (opened === false) {
        this.exportFeedback = "Could not open the print window — check your browser's popup blocker.";
      }
    },
  },
});
