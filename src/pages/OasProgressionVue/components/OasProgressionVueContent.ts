import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressionFiltersVue from "./OASProgressionFiltersVue.vue";
import OASProgressionTableVue from "./OASProgressionTableVue.vue";
import OASWorksheetFiltersVue from "./OASWorksheetFiltersVue.vue";
import OASWorksheetsVue from "./OASWorksheetsVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import SummitPrintButton from "@/components/SummitPrintButton.vue";
import { buildHeatmapPrintMeta, buildSummaryPrintMeta } from "@/pages/OasProgressionVue/services/oasPrintMeta";
import type { MetaEntry } from "@/print/summitPrint";
import { filterOASProgressionRows } from "./OASProgressionTableVue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { buildPeakAwardSummaryRows, sortPeakAwardSummaryRows, type PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import { PEAK_AWARD_REQUIREMENTS, type PeakAwardRequirement } from "@/pages/OasProgression/data/peakAwardRequirements";
import { collectPatrolNames, hasUnassignedMembers, filterMembersByPatrol, UNASSIGNED_PATROL, OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { loadOASProgressionVueFilters, saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import { exportElementToPdf, exportGridToExcel, exportGridToPdf, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { createLogger } from "@/helpers";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";
import OASPeakAwardSummaryFiltersVue from "./OASPeakAwardSummaryFiltersVue.vue";
import OASPeakAwardSummaryVue from "./OASPeakAwardSummaryVue.vue";

const logger = createLogger("OasProgressionVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface SummaryVueInstance {
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
  // Summary is the first tab (DEV_NOTES.md: "Make it the first tab") and now the default landing
  // tab for anyone who has never customized their filters — a returning user's own saved viewMode
  // is unaffected, since loadInitialFilters spreads stored values over these defaults.
  viewMode: "summary",
  summaryMemberFilter: "",
  summaryNameFormat: "full",
  // Same null = "not yet resolved" sentinel as selectedPatrols below.
  summarySelectedPatrols: null,
  summarySortBy: "firstName",
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
const VALID_VIEW_MODES: OASProgressionVueFilterState["viewMode"][] = ["summary", "heatmap", "table", "worksheets"];

/**
 * Which filter keys belong to each tab — used by onResetFilters so "Reset filters" on one tab's
 * own filter bar only resets THAT tab's filters, not every tab's at once. Table has no entry: its
 * column filters live in tableColumnFilters (a separate piece of state), not this filters object,
 * and it has no "Reset filters" button of its own. Each list is exhaustive for its view: every key
 * in OASProgressionVueFilterState other than `viewMode` itself (which this mechanism never
 * touches — see onViewModeTabChange's own comment on why) belongs to exactly one of these three.
 */
const SUMMARY_FILTER_KEYS = ["summaryMemberFilter", "summaryNameFormat", "summarySelectedPatrols", "summarySortBy"] as const;
const HEATMAP_FILTER_KEYS = [
  "groupBy",
  "memberFilter",
  "nameFormat",
  "selectedPatrols",
  "breakByPatrol",
  "showEmptySkillRows",
  "showEmptyTopStages",
  "showAwarded",
  "showNotStarted",
  "showAnswered",
  "visibleStreams",
  "visibleStages",
  "sortBy",
] as const;
const WORKSHEETS_FILTER_KEYS = ["worksheetVisibleSkills", "worksheetVisibleStages", "worksheetNameFormat", "worksheetSelectedPatrols", "worksheetBreakByPatrol", "worksheetShowCompleted", "worksheetLayout"] as const;

export function sanitiseViewMode(viewMode: unknown): OASProgressionVueFilterState["viewMode"] {
  return VALID_VIEW_MODES.includes(viewMode as OASProgressionVueFilterState["viewMode"]) ? (viewMode as OASProgressionVueFilterState["viewMode"]) : "summary";
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
  components: { OASHeatMapVue, OASPeakAwardSummaryFiltersVue, OASPeakAwardSummaryVue, OASProgressionFiltersVue, OASProgressionTableVue, OASWorksheetFiltersVue, OASWorksheetsVue, SummitLoadingState, SummitPrintButton },
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    /** The unit's current section — undefined when Terrain hasn't resolved one yet. Picks which
     *  PeakAwardRequirement the Summary tab applies; see OasProgressionVue.ts's own comment. */
    section: { type: String as PropType<TerrainAchievementsSection | undefined>, default: undefined },
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
    /**
     * The active section's Peak Award rule, or undefined when the section hasn't resolved yet
     * (TerrainState.getSectionName() returned nothing) — gates the Summary tab's table in favour
     * of an explicit "could not determine section" message, rather than guessing a section and
     * showing a confidently wrong gap to a leader.
     */
    peakAwardRequirement(): PeakAwardRequirement | undefined {
      return this.section ? PEAK_AWARD_REQUIREMENTS[this.section] : undefined;
    },
    /**
     * "4 above Stage 3"-style text shown below the Special header, the same way Core Skills shows
     * its skill names below its own header — describes the condition itself (not any one member's
     * progress toward it, which is the "X of Y" text inside each member's own cell instead).
     */
    specialConditionText(): string {
      const special = this.peakAwardRequirement?.special;
      return special ? `${special.minCount} above Stage ${special.minStage - 1}` : "";
    },
    /** Pure per-member aggregation — same OASProgressionRow[] the heat map renders from, no new fetching. */
    peakAwardSummaryRows(): PeakAwardMemberRow[] {
      if (!this.peakAwardRequirement || !this.section) {
        return [];
      }
      return buildPeakAwardSummaryRows(this.items, this.members, this.peakAwardRequirement, this.section);
    },
    /** Member/Patrol/Sort filters applied, matching the heat map's own filter semantics (empty patrol selection = show nothing). */
    filteredPeakAwardSummaryRows(): PeakAwardMemberRow[] {
      const needle = this.filters.summaryMemberFilter.trim().toLowerCase();
      const nameFiltered = needle ? this.peakAwardSummaryRows.filter((row) => row.memberName.toLowerCase().includes(needle)) : this.peakAwardSummaryRows;
      const selectedPatrols = this.filters.summarySelectedPatrols ?? [];
      const patrolFiltered = selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, selectedPatrols);
      return sortPeakAwardSummaryRows(patrolFiltered, this.filters.summarySortBy);
    },
    /** The Summary filters in effect, for the printout's header line. */
    summaryPrintMeta(): MetaEntry[] {
      return buildSummaryPrintMeta(this.filters, this.patrolFilterOptions, this.canFilterByPatrol);
    },
    /** The Heatmap filters in effect, for the printout's header line. */
    heatmapPrintMeta(): MetaEntry[] {
      return buildHeatmapPrintMeta(this.filters, this.patrolFilterOptions, this.canFilterByPatrol);
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
      if (this.filters.summarySelectedPatrols === null) {
        resolved.summarySelectedPatrols = newOptions;
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
      // Resets only the CURRENTLY ACTIVE tab's own filters, not the whole shared filters object —
      // each tab's "Reset filters" button is scoped to that tab alone (per the user's own
      // instruction: "Pressing 'reset filters' on tab resets filters on all tabs. They should all
      // be separate"). viewMode itself is never touched, matching the React page's own
      // resetFilters: it's a page-level display choice, not a "filter" to reset.
      //
      // Table has no key list (its own filters live in tableColumnFilters, not this object) and
      // no "Reset filters" button in the template to ever call this while viewMode === "table" —
      // falls through to resetting nothing, rather than guessing another tab's keys, if it
      // somehow is.
      const keysToReset: readonly (keyof OASProgressionVueFilterState)[] =
        this.filters.viewMode === "summary" ? SUMMARY_FILTER_KEYS : this.filters.viewMode === "worksheets" ? WORKSHEETS_FILTER_KEYS : this.filters.viewMode === "heatmap" ? HEATMAP_FILTER_KEYS : [];

      const resetValues: Partial<OASProgressionVueFilterState> = {};
      keysToReset.forEach((key) => {
        (resetValues as Record<string, unknown>)[key] = DEFAULT_FILTERS[key];
      });

      // The relevant Patrol filter (selectedPatrols / worksheetSelectedPatrols /
      // summarySelectedPatrols — whichever this tab owns) is resolved here directly rather than
      // left as DEFAULT_FILTERS' own `null`: patrol data was already loaded before this reset
      // ran, so patrolFilterOptions's VALUE doesn't change when filters reset — Vue's watcher
      // only fires on an actual change, so it would never fire and the field would stay null
      // (which reads as "show nothing" downstream) forever. Resolving synchronously here, the
      // same way the watcher would, fixes "Patrol filter does not default to all ON when reset"
      // — see .claude/OASProgression/PLAN_NAMES_AND_HIDE_CONTROLS.md.
      const resolvedPatrols = this.patrolFilterOptions.length > 0 ? this.patrolFilterOptions : null;
      if (this.filters.viewMode === "summary") {
        resetValues.summarySelectedPatrols = resolvedPatrols;
      } else if (this.filters.viewMode === "worksheets") {
        resetValues.worksheetSelectedPatrols = resolvedPatrols;
      } else if (this.filters.viewMode === "heatmap") {
        resetValues.selectedPatrols = resolvedPatrols;
      }

      this.filters = { ...this.filters, ...resetValues };
    },
    async onReloadAllClick() {
      this.isReloading = true;
      try {
        await this.onReloadAll();
      } finally {
        this.isReloading = false;
      }
    },
    /** The Heatmap table for SummitPrintButton — read at click time, after Vuetify has rendered it. */
    heatMapPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.heatMap as unknown as HeatMapVueInstance | undefined)?.getExportTable();
    },
    // No longer wired to a button — replaced by SummitPrintButton (.claude/Print/PLAN.md). Kept
    // until the new print path is proven, then removed in the cleanup stage.
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
    /** The Summary table for SummitPrintButton — read at click time, after Vuetify has rendered it. */
    summaryPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.summary as unknown as SummaryVueInstance | undefined)?.getExportTable();
    },
    // No longer wired to a button — replaced by SummitPrintButton (.claude/Print/PLAN.md). Kept
    // until the new print path is proven, then removed in the cleanup stage.
    async onSummaryPdfExportClick() {
      const summary = this.$refs.summary as unknown as SummaryVueInstance | undefined;
      const table = summary?.getExportTable();
      if (!table) {
        return;
      }

      try {
        // Portrait, unlike the Heat Map's landscape — Summary is a flat, narrower table (no
        // per-stage column fan-out), so it reads better tall than wide. See the user's own
        // request (2026-10-09).
        await exportElementToPdf({
          element: table,
          fileName: "OASPeakAwardSummaryVue.pdf",
          title: "Terrain | Summit - OAS Progression Summary",
          orientation: "portrait",
        });
        this.exportFeedback = "PDF export complete";
      } catch (e) {
        logger.error("Summary PDF export failed:", e);
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
