import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressionFiltersVue from "./OASProgressionFiltersVue.vue";
import OASProgressionTableVue from "./OASProgressionTableVue.vue";
import OASWorksheetFiltersVue from "./OASWorksheetFiltersVue.vue";
import OASWorksheetsVue from "./OASWorksheetsVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import SummitPrintButton from "@/components/SummitPrintButton.vue";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { buildHeatmapPrintMeta, buildOasTablePrintMeta, buildSummaryPrintMeta } from "@/pages/OasProgressionVue/services/oasPrintMeta";
import type { MetaEntry } from "@/print/summitPrint";
import { filterOASProgressionRows } from "./OASProgressionTableVue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { buildPeakAwardSummaryRows, sortPeakAwardSummaryRows, type PeakAwardMemberRow } from "@/pages/OasProgression/services/buildPeakAwardSummaryRows";
import { PEAK_AWARD_REQUIREMENTS, type PeakAwardRequirement } from "@/pages/OasProgression/data/peakAwardRequirements";
import { collectPatrolNames, hasUnassignedMembers, filterMembersByPatrol, UNASSIGNED_PATROL, OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { loadOASProgressionVueFilters, saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import { exportGridToExcel, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { exportExcelSheet, type ExcelExportRequest } from "@/excel/summitExcel";
import { buildPeakAwardSummarySheet } from "@/excel/sheets/peakAwardSummary";
import { buildSkillHeatmapSheet } from "@/excel/sheets/skillHeatmap";
import type { HeatMapExportView } from "./OASHeatMapVue";
import { createLogger } from "@/helpers";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";
import OASPeakAwardSummaryFiltersVue from "./OASPeakAwardSummaryFiltersVue.vue";
import OASPeakAwardSummaryVue from "./OASPeakAwardSummaryVue.vue";

const logger = createLogger("OasProgressionVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
  getExportView(): HeatMapExportView;
}

interface SummaryVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface WorksheetsVueInstance {
  printCurrentPages(): boolean;
}

interface TableVueInstance {
  prepareForPrint(): Promise<() => void>;
  getPrintTable(): HTMLTableElement | undefined;
}

// Must match OASProgressionTableVue's columns so the export matches the screen.
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
  viewMode: "summary",
  summaryMemberFilter: "",
  summaryNameFormat: "full",
  summarySelectedPatrols: null,
  summarySortBy: "firstName",
  groupBy: "skill",
  memberFilter: "",
  nameFormat: "full",
  // Gotcha: null means "not resolved yet" and [] means "show nothing". The patrolFilterOptions watcher fills in null once patrols load.
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

  // Worksheets default narrow (Camping, stage 1) to limit processing; it's a print target.
  worksheetVisibleSkills: ["camping"],
  worksheetVisibleStages: [1],
  worksheetNameFormat: "full",
  worksheetSelectedPatrols: null,
  worksheetBreakByPatrol: false,
  worksheetShowCompleted: true,
  worksheetLayout: "membersAsRows",
};

// Catches a stored viewMode that is present but invalid; a missing one is covered by the defaults spread.
const VALID_VIEW_MODES: OASProgressionVueFilterState["viewMode"][] = ["summary", "heatmap", "table", "worksheets"];

/** Each tab's "Reset filters" resets only its own keys. Table has none: its filters live in tableColumnFilters. viewMode is never reset. */
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

const RESETTABLE_FILTER_KEYS_BY_VIEW: Record<OASProgressionVueFilterState["viewMode"], readonly (keyof OASProgressionVueFilterState)[]> = {
  summary: SUMMARY_FILTER_KEYS,
  heatmap: HEATMAP_FILTER_KEYS,
  worksheets: WORKSHEETS_FILTER_KEYS,
  table: [],
};

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
  components: { OASHeatMapVue, OASPeakAwardSummaryFiltersVue, OASPeakAwardSummaryVue, OASProgressionFiltersVue, OASProgressionTableVue, OASWorksheetFiltersVue, OASWorksheetsVue, SummitLoadingState, SummitPillButton, SummitPrintButton },
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    section: { type: String as PropType<TerrainAchievementsSection | undefined>, default: undefined },
    // Gotcha: Vue 2 can't type-check a Set prop. Declaring `Object` logs a spurious "Invalid prop" warning.
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
      isExcelExporting: false,
      exportFeedback: "",
      tableColumnFilters: {} as Record<string, string>,
    };
  },
  computed: {
    sharedLoadState(): "loading" | "ready" | "error" {
      if (this.loadError) return "error";
      return this.loadingStreams.size > 0 ? "loading" : "ready";
    },
    /** Learning: unlike other pages, show partial results while streams load. Nine streams arrive one at a time, and a single-stream reload shouldn't blank the page. */
    hasContent(): boolean {
      return this.items.length > 0;
    },
    streamsDone(): number {
      return Math.max(0, this.totalStreams - this.loadingStreams.size);
    },
    grouped(): Record<string, ReturnType<typeof groupRowsForHeatMap>[string]> {
      return groupRowsForHeatMap(this.items, this.trunkStageCounts, this.members);
    },
    availablePatrols(): string[] {
      return collectPatrolNames(Object.values(this.grouped).flatMap((skill) => skill.sections));
    },
    /** Adds "Unassigned" when needed. Kept separate from availablePatrols, which gates "Break by patrol" and must not include it. */
    patrolFilterOptions(): string[] {
      const sections = Object.values(this.grouped).flatMap((skill) => skill.sections);
      return hasUnassignedMembers(sections) ? [...this.availablePatrols, UNASSIGNED_PATROL] : this.availablePatrols;
    },
    canFilterByPatrol(): boolean {
      return this.patrolFilterOptions.length > 1;
    },
    tableFilteredItems(): OASProgressionRow[] {
      return filterOASProgressionRows(this.items, this.tableColumnFilters);
    },
    /** Undefined until Terrain resolves the section. Show "could not determine section" rather than guess. */
    peakAwardRequirement(): PeakAwardRequirement | undefined {
      return this.section ? PEAK_AWARD_REQUIREMENTS[this.section] : undefined;
    },
    specialConditionText(): string {
      const special = this.peakAwardRequirement?.special;
      return special ? `${special.minCount} above Stage ${special.minStage - 1}` : "";
    },
    peakAwardSummaryRows(): PeakAwardMemberRow[] {
      if (!this.peakAwardRequirement || !this.section) {
        return [];
      }
      return buildPeakAwardSummaryRows(this.items, this.members, this.peakAwardRequirement, this.section);
    },
    filteredPeakAwardSummaryRows(): PeakAwardMemberRow[] {
      const needle = this.filters.summaryMemberFilter.trim().toLowerCase();
      const nameFiltered = needle ? this.peakAwardSummaryRows.filter((row) => row.memberName.toLowerCase().includes(needle)) : this.peakAwardSummaryRows;
      const selectedPatrols = this.filters.summarySelectedPatrols ?? [];
      const patrolFiltered = selectedPatrols.length === 0 ? [] : filterMembersByPatrol(nameFiltered, selectedPatrols);
      return sortPeakAwardSummaryRows(patrolFiltered, this.filters.summarySortBy);
    },
    summaryPrintMeta(): MetaEntry[] {
      return buildSummaryPrintMeta(this.filters, this.patrolFilterOptions, this.canFilterByPatrol);
    },
    tablePrintMeta(): MetaEntry[] {
      return buildOasTablePrintMeta(this.tableColumnFilters);
    },
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
    /** Resolves each tab's null patrol selection to "all" once patrols are known. Only touches null; [] is a deliberate "show nothing". */
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
    onViewModeTabChange(viewMode: OASProgressionVueFilterState["viewMode"]) {
      this.filters = { ...this.filters, viewMode };
    },
    onResetFilters() {
      const keysToReset = RESETTABLE_FILTER_KEYS_BY_VIEW[this.filters.viewMode] ?? [];

      const resetValues: Partial<OASProgressionVueFilterState> = {};
      keysToReset.forEach((key) => {
        (resetValues as Record<string, unknown>)[key] = DEFAULT_FILTERS[key];
      });

      // Gotcha: resolve the patrol selection here. patrolFilterOptions won't change on reset, so its watcher won't fire and null would mean "show nothing".
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
    heatMapPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.heatMap as unknown as HeatMapVueInstance | undefined)?.getExportTable();
    },
    summaryPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.summary as unknown as SummaryVueInstance | undefined)?.getExportTable();
    },
    tablePrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.table as unknown as TableVueInstance | undefined)?.getPrintTable();
    },
    /** Only rendered rows print, so this shows them all and returns a restore function. */
    async prepareTablePrint(): Promise<(() => void) | void> {
      const table = this.$refs.table as unknown as TableVueInstance | undefined;
      return table ? table.prepareForPrint() : undefined;
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
    async onSummaryExcelExportClick() {
      const requirement = this.peakAwardRequirement;
      if (!requirement) return;
      await this.runExcelExport("Summary", "peak-award-summary", this.summaryPrintMeta, (header, logo) =>
        buildPeakAwardSummarySheet({
          rows: this.filteredPeakAwardSummaryRows,
          requirement,
          nameFormat: this.filters.summaryNameFormat,
          specialConditionText: this.specialConditionText,
          header,
          logo,
        }),
      );
    },
    async onHeatmapExcelExportClick() {
      const heatMap = this.$refs.heatMap as unknown as HeatMapVueInstance | undefined;
      if (!heatMap) return;
      await this.runExcelExport("Heatmap", "skill-heatmap", this.heatmapPrintMeta, (header, logo) => buildSkillHeatmapSheet({ view: heatMap.getExportView(), header, logo }));
    },
    async runExcelExport(viewName: string, printProfile: string, meta: MetaEntry[], build: ExcelExportRequest["build"]) {
      this.isExcelExporting = true;
      try {
        await exportExcelSheet({ printProfile, meta, fileNameParts: ["OAS Progression", viewName], build });
        this.exportFeedback = "Excel export complete";
      } catch (e) {
        logger.error(`${viewName} Excel export failed:`, e);
        this.exportFeedback = `Excel export failed: ${e instanceof Error ? e.message : "Unknown error"}`;
      } finally {
        this.isExcelExporting = false;
      }
    },
    onWorksheetPrintClick() {
      const worksheets = this.$refs.worksheets as unknown as WorksheetsVueInstance | undefined;
      const opened = worksheets?.printCurrentPages();
      if (opened === false) {
        this.exportFeedback = "Could not open the print window — check your browser's popup blocker.";
      }
    },
  },
});
