import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressFiltersVue from "./OASProgressFiltersVue.vue";
import OASProgressTableVue from "./OASProgressTableVue.vue";
import OASWorksheetFiltersVue from "./OASWorksheetFiltersVue.vue";
import OASWorksheetsVue from "./OASWorksheetsVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import SummitPrintButton from "@/components/SummitPrintButton.vue";
import type { PrintButtonPart } from "@/components/SummitPrintButton";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { buildHeatmapPrintMeta, buildOasTablePrintMeta, buildSummaryPrintMeta } from "@/pages/OasProgressVue/services/oasPrintMeta";
import type { MetaEntry } from "@/print/summitPrint";
import { filterOASProgressRows } from "./OASProgressTableVue";
import { groupRowsForHeatMap } from "@/pages/OasProgress/services/groupRowsForHeatMap";
import { buildPeakAwardSummaryRows, sortPeakAwardSummaryRows, type PeakAwardMemberRow } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import { PEAK_AWARD_REQUIREMENTS, type PeakAwardRequirement } from "@/pages/OasProgress/data/peakAwardRequirements";
import { collectPatrolNames, hasUnassignedMembers, filterMembersByPatrol, UNASSIGNED_PATROL, OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import { loadOASProgressVueFilters, saveOASProgressVueFilters, type OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import { exportGridToExcel, type GridExportColumn, type GridExportRow } from "@/components/gridExport";
import { exportExcelWorkbook, type ExcelWorkbookRequest } from "@/excel/summitExcel";
import { buildPeakAwardSummarySheet } from "@/excel/sheets/peakAwardSummary";
import { buildOverallProgressSheet } from "@/excel/sheets/overallProgress";
import { buildSkillHeatmapSheet } from "@/excel/sheets/skillHeatmap";
import type { HeatMapExportView } from "./OASHeatMapVue";
import { createLogger } from "@/helpers";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";
import OASPeakAwardSummaryFiltersVue from "./OASPeakAwardSummaryFiltersVue.vue";
import OASPeakAwardSummaryVue from "./OASPeakAwardSummaryVue.vue";
import OASOverallProgressVue from "./OASOverallProgressVue.vue";
import { buildHeaderView } from "./OASOverallProgressVue";
import {
  buildOverallProgressColumns,
  buildOverallProgressRows,
  hideNotStartedColumns,
  nextColumnSort,
  sortOverallProgressRows,
  type OverallProgressColumn,
  type OverallProgressRow,
} from "@/pages/OasProgress/services/buildOverallProgressRows";
import { getMemberDisplayName } from "@/pages/OasProgress/services/getMemberDisplayName";

const logger = createLogger("OasProgressVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
  getExportView(): HeatMapExportView;
}

interface SummaryVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface OverallProgressVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface WorksheetsVueInstance {
  printCurrentPages(): boolean;
}

interface TableVueInstance {
  prepareForPrint(): Promise<() => void>;
  getPrintTable(): HTMLTableElement | undefined;
}

// Must match OASProgressTableVue's columns so the export matches the screen.
const TABLE_EXPORT_COLUMNS: GridExportColumn[] = [
  { key: "memberName", header: "Member" },
  { key: "stream", header: "Skill" },
  { key: "branch", header: "Stream" },
  { key: "stage", header: "Stage" },
  { key: "inputGroup", header: "Group" },
  { key: "iStatement", header: "I-Statement" },
  { key: "answered", header: "Answered", exportValue: (row) => ((row as unknown as OASProgressRow).answered ? "Yes" : "No") },
  { key: "awarded", header: "Awarded", exportValue: (row) => ((row as unknown as OASProgressRow).awarded ? "Yes" : "No") },
  { key: "date", header: "Date", exportValue: (row) => (row as unknown as OASProgressRow).date?.slice(0, 10) ?? "" },
];

const MAX_STAGE = 9;

const DEFAULT_FILTERS: OASProgressVueFilterState = {
  viewMode: "summary",
  summaryMemberFilter: "",
  summaryNameFormat: "full",
  summarySelectedPatrols: null,
  summarySortBy: "firstName",
  summaryColumnSort: null,
  summaryShowNotStartedSkills: true,
  summaryBreakByPatrol: false,
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
const VALID_VIEW_MODES: OASProgressVueFilterState["viewMode"][] = ["summary", "heatmap", "table", "worksheets"];

/** Each tab's "Reset filters" resets only its own keys. Table has none: its filters live in tableColumnFilters. viewMode is never reset. */
const SUMMARY_FILTER_KEYS = ["summaryMemberFilter", "summaryNameFormat", "summarySelectedPatrols", "summarySortBy", "summaryColumnSort", "summaryShowNotStartedSkills", "summaryBreakByPatrol"] as const;
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

const RESETTABLE_FILTER_KEYS_BY_VIEW: Record<OASProgressVueFilterState["viewMode"], readonly (keyof OASProgressVueFilterState)[]> = {
  summary: SUMMARY_FILTER_KEYS,
  heatmap: HEATMAP_FILTER_KEYS,
  worksheets: WORKSHEETS_FILTER_KEYS,
  table: [],
};

export function sanitiseViewMode(viewMode: unknown): OASProgressVueFilterState["viewMode"] {
  return VALID_VIEW_MODES.includes(viewMode as OASProgressVueFilterState["viewMode"]) ? (viewMode as OASProgressVueFilterState["viewMode"]) : "summary";
}

function loadInitialFilters(): OASProgressVueFilterState {
  const stored = loadOASProgressVueFilters();
  if (!stored) {
    return DEFAULT_FILTERS;
  }
  const merged = { ...DEFAULT_FILTERS, ...stored };
  return { ...merged, viewMode: sanitiseViewMode(merged.viewMode) };
}

export default defineComponent({
  name: "OasProgressVueContent",
  components: {
    OASHeatMapVue,
    OASOverallProgressVue,
    OASPeakAwardSummaryFiltersVue,
    OASPeakAwardSummaryVue,
    OASProgressFiltersVue,
    OASProgressTableVue,
    OASWorksheetFiltersVue,
    OASWorksheetsVue,
    SummitLoadingState,
    SummitPillButton,
    SummitPrintButton,
  },
  props: {
    items: { type: Array as PropType<OASProgressRow[]>, required: true },
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
      filters: loadInitialFilters() as OASProgressVueFilterState,
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
    tableFilteredItems(): OASProgressRow[] {
      return filterOASProgressRows(this.items, this.tableColumnFilters);
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
    overallProgressColumns(): OverallProgressColumn[] {
      return buildOverallProgressColumns(this.grouped);
    },
    /** Starts from the Peak Award rows so both tables share the Summary filters; a column sort then reorders this table only. */
    overallProgressRows(): OverallProgressRow[] {
      const members = this.filteredPeakAwardSummaryRows.map((row) => ({
        memberId: row.memberId,
        displayName: getMemberDisplayName(row.firstName, row.lastName, row.memberId, this.filters.summaryNameFormat),
        patrolName: row.patrolName,
      }));
      return sortOverallProgressRows(buildOverallProgressRows(this.grouped, members), this.overallProgressColumns, this.filters.summaryColumnSort);
    },
    overallProgressView(): { columns: OverallProgressColumn[]; rows: OverallProgressRow[] } {
      const all = { columns: this.overallProgressColumns, rows: this.overallProgressRows };
      return this.filters.summaryShowNotStartedSkills ? all : hideNotStartedColumns(all.columns, all.rows);
    },
    /** Always both: Edge's own Pages box can pick pages. */
    summaryPrintParts(): PrintButtonPart[] {
      return [
        { label: "Towards Peak Award", profile: "peak-award-summary", target: () => this.summaryPrintTarget() },
        { label: "Overall", profile: "overall-progress", target: () => this.overallProgressPrintTarget() },
      ];
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
      handler(newFilters: OASProgressVueFilterState) {
        saveOASProgressVueFilters(newFilters);
      },
    },
    /** Resolves each tab's null patrol selection to "all" once patrols are known. Only touches null; [] is a deliberate "show nothing". */
    patrolFilterOptions(newOptions: string[]) {
      if (newOptions.length === 0) {
        return;
      }
      const resolved: Partial<OASProgressVueFilterState> = {};
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
    onFiltersUpdate(next: OASProgressVueFilterState) {
      this.filters = next;
    },
    onOverallProgressSortColumn(key: string) {
      this.filters = { ...this.filters, summaryColumnSort: nextColumnSort(this.filters.summaryColumnSort, key) };
    },
    onViewModeTabChange(viewMode: OASProgressVueFilterState["viewMode"]) {
      this.filters = { ...this.filters, viewMode };
    },
    onResetFilters() {
      const keysToReset = RESETTABLE_FILTER_KEYS_BY_VIEW[this.filters.viewMode] ?? [];

      const resetValues: Partial<OASProgressVueFilterState> = {};
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
    overallProgressPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.overallProgress as unknown as OverallProgressVueInstance | undefined)?.getExportTable();
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
          fileName: "OASProgressVue.xlsx",
          title: "OAS Progress",
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
      const sheets: ExcelWorkbookRequest["sheets"] = [
        {
          printProfile: "peak-award-summary",
          build: (header, logo) =>
            buildPeakAwardSummarySheet({
              rows: this.filteredPeakAwardSummaryRows,
              requirement,
              nameFormat: this.filters.summaryNameFormat,
              specialConditionText: this.specialConditionText,
              breakByPatrol: this.filters.summaryBreakByPatrol,
              header,
              logo,
            }),
        },
        {
          printProfile: "overall-progress",
          build: (header, logo) =>
            buildOverallProgressSheet({
              headers: this.overallProgressView.columns.map((c) => buildHeaderView(c)),
              rows: this.overallProgressView.rows,
              breakByPatrol: this.filters.summaryBreakByPatrol,
              header,
              logo,
            }),
        },
      ];
      await this.runExcelExport("Summary", this.summaryPrintMeta, sheets);
    },
    async onHeatmapExcelExportClick() {
      const heatMap = this.$refs.heatMap as unknown as HeatMapVueInstance | undefined;
      if (!heatMap) return;
      await this.runExcelExport("Heatmap", this.heatmapPrintMeta, [{ printProfile: "skill-heatmap", build: (header, logo) => buildSkillHeatmapSheet({ view: heatMap.getExportView(), header, logo }) }]);
    },
    async runExcelExport(viewName: string, meta: MetaEntry[], sheets: ExcelWorkbookRequest["sheets"]) {
      this.isExcelExporting = true;
      try {
        await exportExcelWorkbook({ sheets, meta, fileNameParts: ["OAS Progress", viewName] });
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
