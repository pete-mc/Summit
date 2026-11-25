import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressFiltersVue from "./OASProgressFiltersVue.vue";
import OASNextStepsVue from "./OASNextStepsVue.vue";
import OASStageGridFiltersVue from "./OASStageGridFiltersVue.vue";
import OASStageGridVue from "./OASStageGridVue.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import SummitPrintButton from "@/components/SummitPrintButton.vue";
import SummitPillButton from "@/components/SummitPillButton.vue";
import { buildHeatmapPrintMeta, buildNextStepsPrintMeta, buildPeakAwardPrintMeta, buildSummaryPrintMeta, buildStageGridPrintMeta } from "@/pages/OasProgressVue/services/oasPrintMeta";
import type { MetaEntry } from "@/print/summitPrint";
import OASNextStepsFiltersVue from "./OASNextStepsFiltersVue.vue";
import type { NextStepsFilterOption } from "./OASNextStepsFiltersVue";
import { buildNextStepsRows, listOutstandingRows, listStageOptions, type NextStepsRow } from "@/pages/OasProgressVue/services/nextStepsRows";
import type { StageGridExportView } from "./OASStageGridVue";
import { groupRowsForHeatMap } from "@/pages/OasProgress/services/groupRowsForHeatMap";
import { buildPeakAwardSummaryRows, sortPeakAwardSummaryRows, type PeakAwardMemberRow } from "@/pages/OasProgress/services/buildPeakAwardSummaryRows";
import { PEAK_AWARD_REQUIREMENTS, type PeakAwardRequirement } from "@/pages/OasProgress/data/peakAwardRequirements";
import { collectPatrolNames, hasUnassignedMembers, UNASSIGNED_PATROL, OAS_SKILLS } from "@/pages/OasProgress/services/filterHeatMapSections";
import { loadOASProgressVueFilters, saveOASProgressVueFilters, type OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";
import { commonDefaultsForAllTabs, commonDefaultsForTab } from "@/pages/OasProgressVue/services/oasFilterDefaults";
import { loadFilterDefaults, loadFilterDefaultsAppliedAt } from "@/shared/filterDefaults";
import { exportExcelWorkbook, type ExcelWorkbookRequest } from "@/excel/summitExcel";
import { buildPeakAwardSummarySheet } from "@/excel/sheets/peakAwardSummary";
import { buildOverallProgressSheet } from "@/excel/sheets/overallProgress";
import { buildSkillHeatmapSheet } from "@/excel/sheets/skillHeatmap";
import { buildNextStepsSheet } from "@/excel/sheets/oasNextSteps";
import { buildStageGridSheet } from "@/excel/sheets/oasStageGrid";
import type { HeatMapExportView } from "./OASHeatMapVue";
import { createLogger, showTerrainToast } from "@/helpers";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";
import type { TerrainAchievementsSection } from "@/shared";
import OASSummaryTabFiltersVue from "./OASSummaryTabFiltersVue.vue";
import OASAboutTabsVue from "./OASAboutTabsVue.vue";
import type { SortOption } from "./OASSummaryTabFiltersVue";
import OASPeakAwardSummaryVue from "./OASPeakAwardSummaryVue.vue";
import OASOverallProgressVue from "./OASOverallProgressVue.vue";
import { buildHeaderView } from "./OASOverallProgressVue";
import {
  buildCollapsedOverallProgressColumns,
  buildCollapsedOverallProgressRows,
  buildOverallProgressColumns,
  buildOverallProgressRows,
  collapsedColumnSort,
  hideNotStartedColumns,
  nextColumnSort,
  sortOverallProgressRows,
  type OverallProgressColumn,
  type OverallProgressColumnSort,
  type OverallProgressRow,
} from "@/pages/OasProgress/services/buildOverallProgressRows";
import { getMemberDisplayName, type NameFormat } from "@/pages/OasProgress/services/getMemberDisplayName";
import { listSkillStreams, skillStreamKey, type SkillStream } from "@/pages/OasProgressVue/services/skillStreams";
import { buildUnitMemberList, filterMemberRows, sortMembersByName, type UnitMemberListItem } from "@/pages/OasProgressVue/services/unitMemberList";
import {
  buildPeakAwardCoreSkillJumps,
  buildSummaryCellJumps,
  highestApprovedStreams,
  listOutstandingSkillStreams,
  lowestStagesNeeded,
  peakAwardCoreSkillHeaderJumps,
  peakAwardCoreSkillsGroupJumps,
  peakAwardMemberJumps,
  summaryColumnJumps,
  summaryMemberJumps,
  TAB_ORDER,
  type CellJumps,
  type ShownPeople,
  type TabJump,
} from "@/pages/OasProgressVue/services/tabJumps";

const logger = createLogger("OasProgressVueContent");

interface HeatMapVueInstance {
  getExportTable(): HTMLTableElement | undefined;
  getExportView(): HeatMapExportView;
}

interface PeakAwardVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface OverallProgressVueInstance {
  getExportTable(): HTMLTableElement | undefined;
}

interface StageGridVueInstance {
  getPrintTables(): HTMLTableElement[];
  getExportView(): StageGridExportView;
}

interface NextStepsVueInstance {
  getPrintTable(): HTMLTableElement | undefined;
}

const MAX_STAGE = 9;

const DEFAULT_FILTERS: OASProgressVueFilterState = {
  viewMode: "summary",
  summaryMemberFilter: "",
  summaryNameFormat: "full",
  summarySelectedPatrols: null,
  summarySortBy: "firstName",
  summaryColumnSort: null,
  summaryExpandStreams: true,
  summaryShowNotStartedSkills: true,
  summaryBreakByPatrol: false,
  peakAwardMemberFilter: "",
  peakAwardNameFormat: "full",
  peakAwardSelectedPatrols: null,
  peakAwardSortBy: "firstName",
  peakAwardBreakByPatrol: false,
  groupBy: "skill",
  memberFilter: "",
  nameFormat: "full",
  // Gotcha: null means "not resolved yet" and [] means "show nothing". The patrolFilterOptions watcher fills in null once patrols load.
  selectedPatrols: null,
  breakByPatrol: false,
  showEmptySkillRows: true,
  showApproved: true,
  showNotStarted: true,
  showAnswered: true,
  visibleStreams: OAS_SKILLS,
  visibleStages: Array.from({ length: MAX_STAGE }, (_, i) => i + 1),
  sortBy: "firstName",

  nextStepsMemberId: "",
  nextStepsSkillStream: "",
  nextStepsStage: null,
  nextStepsNameFormat: "full",

  // Stage Grid default narrow (Camping, stage 1) to limit processing; it's a print target.
  stageGridSkillStream: skillStreamKey("camping", "camping"),
  stageGridStage: 1,
  stageGridNameFormat: "full",
  stageGridSortBy: "firstName",
  stageGridSelectedPatrols: null,
  stageGridBreakByPatrol: false,
  stageGridShowApproved: true,
  stageGridLayout: "membersAsColumns",

  filterDefaultsAppliedAt: null,
};

// Catches a stored viewMode that is present but invalid; a missing one is covered by the defaults spread.
const VALID_VIEW_MODES = TAB_ORDER;

/** Each tab's "Reset filters" resets only its own keys. viewMode is never reset. */
const SUMMARY_FILTER_KEYS = ["summaryMemberFilter", "summaryNameFormat", "summarySelectedPatrols", "summarySortBy", "summaryColumnSort", "summaryExpandStreams", "summaryShowNotStartedSkills", "summaryBreakByPatrol"] as const;
const PEAK_AWARD_FILTER_KEYS = ["peakAwardMemberFilter", "peakAwardNameFormat", "peakAwardSelectedPatrols", "peakAwardSortBy", "peakAwardBreakByPatrol"] as const;
const HEATMAP_FILTER_KEYS = ["groupBy", "memberFilter", "nameFormat", "selectedPatrols", "breakByPatrol", "showEmptySkillRows", "showApproved", "showNotStarted", "showAnswered", "visibleStreams", "visibleStages", "sortBy"] as const;
const NEXT_STEPS_FILTER_KEYS = ["nextStepsMemberId", "nextStepsSkillStream", "nextStepsStage", "nextStepsNameFormat"] as const;
const STAGE_GRID_FILTER_KEYS = ["stageGridSkillStream", "stageGridStage", "stageGridNameFormat", "stageGridSortBy", "stageGridSelectedPatrols", "stageGridBreakByPatrol", "stageGridShowApproved", "stageGridLayout"] as const;

const RESETNEXT_STEPS_FILTER_KEYS_BY_VIEW: Record<OASProgressVueFilterState["viewMode"], readonly (keyof OASProgressVueFilterState)[]> = {
  about: [],
  summary: SUMMARY_FILTER_KEYS,
  peakAward: PEAK_AWARD_FILTER_KEYS,
  heatmap: HEATMAP_FILTER_KEYS,
  stageGrid: STAGE_GRID_FILTER_KEYS,
  nextSteps: NEXT_STEPS_FILTER_KEYS,
};

export function sanitiseViewMode(viewMode: unknown): OASProgressVueFilterState["viewMode"] {
  return VALID_VIEW_MODES.includes(viewMode as OASProgressVueFilterState["viewMode"]) ? (viewMode as OASProgressVueFilterState["viewMode"]) : "summary";
}

/** Saved filters beat the leader's defaults, except after "Apply defaults to all pages" on Display Options, which overwrites them once. */
function loadInitialFilters(): OASProgressVueFilterState {
  const userDefaults = commonDefaultsForAllTabs(loadFilterDefaults());
  const appliedAt = loadFilterDefaultsAppliedAt();
  const stored = loadOASProgressVueFilters() ?? {};
  const storedAppliedAt = typeof stored.filterDefaultsAppliedAt === "number" ? stored.filterDefaultsAppliedAt : null;
  const needsCatchUp = appliedAt !== null && (storedAppliedAt === null || appliedAt > storedAppliedAt);
  const merged: OASProgressVueFilterState = needsCatchUp ? { ...DEFAULT_FILTERS, ...stored, ...userDefaults, filterDefaultsAppliedAt: appliedAt } : { ...DEFAULT_FILTERS, ...userDefaults, ...stored };
  const summarySortBy: OASProgressVueFilterState["summarySortBy"] = merged.summarySortBy === "lastName" ? "lastName" : "firstName";
  const filters: OASProgressVueFilterState = { ...merged, viewMode: sanitiseViewMode(merged.viewMode), summarySortBy };
  if (needsCatchUp) saveOASProgressVueFilters(filters);
  return filters;
}

const SUMMARY_SORT_OPTIONS: SortOption[] = [
  { value: "firstName", text: "First Name" },
  { value: "lastName", text: "Last Name" },
];

const PEAK_AWARD_SORT_OPTIONS: SortOption[] = [...SUMMARY_SORT_OPTIONS, { value: "progress", text: "Progress" }];

export default defineComponent({
  name: "OasProgressVueContent",
  components: {
    OASHeatMapVue,
    OASOverallProgressVue,
    OASSummaryTabFiltersVue,
    OASAboutTabsVue,
    OASPeakAwardSummaryVue,
    OASProgressFiltersVue,
    OASNextStepsVue,
    OASNextStepsFiltersVue,
    OASStageGridFiltersVue,
    OASStageGridVue,
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
      jumpOrigin: null as TabJump["from"] | null,
      isReloading: false,
      isExcelExporting: false,
      summarySortOptions: SUMMARY_SORT_OPTIONS,
      peakAwardSortOptions: PEAK_AWARD_SORT_OPTIONS,
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
    nextStepsMemberOptions(): NextStepsFilterOption[] {
      const nameFormat = this.filters.nextStepsNameFormat;
      return sortMembersByName(this.unitMembers, "firstName").map((m) => ({ text: getMemberDisplayName(m.firstName, m.lastName, m.memberId, nameFormat), value: m.memberId }));
    },
    /** Falls back to the first member while nothing is picked, or when the picked member is no longer listed. */
    resolvedNextStepsMemberId(): string {
      const options = this.nextStepsMemberOptions;
      return options.some((o) => o.value === this.filters.nextStepsMemberId) ? this.filters.nextStepsMemberId : (options[0]?.value ?? "");
    },
    nextStepsOutstandingRows(): OASProgressRow[] {
      return listOutstandingRows(this.items, this.resolvedNextStepsMemberId);
    },
    nextStepsSkillStreams(): SkillStream[] {
      return listSkillStreams(this.nextStepsOutstandingRows);
    },
    nextStepsSkillStreamOptions(): NextStepsFilterOption[] {
      return this.nextStepsSkillStreams.map((s) => ({ text: s.label, value: s.key }));
    },
    resolvedNextStepsSkillStream(): string {
      const options = this.nextStepsSkillStreams;
      return options.some((o) => o.key === this.filters.nextStepsSkillStream) ? this.filters.nextStepsSkillStream : (options[0]?.key ?? "");
    },
    nextStepsStageOptions(): number[] {
      return listStageOptions(this.nextStepsOutstandingRows, this.resolvedNextStepsSkillStream);
    },
    resolvedNextStepsStage(): number | null {
      const stage = this.filters.nextStepsStage;
      return stage !== null && this.nextStepsStageOptions.indexOf(stage) !== -1 ? stage : (this.nextStepsStageOptions[0] ?? null);
    },
    stageGridSkillStreams(): SkillStream[] {
      return listSkillStreams(this.items);
    },
    resolvedStageGridSkillStream(): string {
      const options = this.stageGridSkillStreams;
      return options.some((o) => o.key === this.filters.stageGridSkillStream) ? this.filters.stageGridSkillStream : (options[0]?.key ?? "");
    },
    stageGridStageOptions(): number[] {
      return listStageOptions(this.items, this.resolvedStageGridSkillStream);
    },
    resolvedStageGridStage(): number | null {
      const stage = this.filters.stageGridStage;
      return stage !== null && this.stageGridStageOptions.indexOf(stage) !== -1 ? stage : (this.stageGridStageOptions[0] ?? null);
    },
    nextStepsRows(): NextStepsRow[] {
      return buildNextStepsRows(this.nextStepsOutstandingRows, this.resolvedNextStepsSkillStream, this.resolvedNextStepsStage);
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
      const filtered = filterMemberRows(this.peakAwardSummaryRows, this.filters.peakAwardMemberFilter, this.filters.peakAwardSelectedPatrols ?? []);
      return sortPeakAwardSummaryRows(filtered, this.filters.peakAwardSortBy);
    },
    unitMembers(): UnitMemberListItem[] {
      return buildUnitMemberList(this.members);
    },
    overallProgressColumns(): OverallProgressColumn[] {
      return this.filters.summaryExpandStreams ? buildOverallProgressColumns(this.grouped) : buildCollapsedOverallProgressColumns(this.grouped);
    },
    summaryColumnSort(): OverallProgressColumnSort | null {
      return this.filters.summaryExpandStreams ? this.filters.summaryColumnSort : collapsedColumnSort(this.filters.summaryColumnSort);
    },
    overallProgressRows(): OverallProgressRow[] {
      const filtered = filterMemberRows(this.unitMembers, this.filters.summaryMemberFilter, this.filters.summarySelectedPatrols ?? []);
      const members = sortMembersByName(filtered, this.filters.summarySortBy).map((row) => ({
        memberId: row.memberId,
        displayName: getMemberDisplayName(row.firstName, row.lastName, row.memberId, this.filters.summaryNameFormat),
        patrolName: row.patrolName,
      }));
      const rows = this.filters.summaryExpandStreams ? buildOverallProgressRows(this.grouped, members) : buildCollapsedOverallProgressRows(this.grouped, members);
      return sortOverallProgressRows(rows, this.overallProgressColumns, this.summaryColumnSort);
    },
    overallProgressView(): { columns: OverallProgressColumn[]; rows: OverallProgressRow[] } {
      const all = { columns: this.overallProgressColumns, rows: this.overallProgressRows };
      return this.filters.summaryShowNotStartedSkills ? all : hideNotStartedColumns(all.columns, all.rows);
    },
    summaryCellJumps(): CellJumps {
      return buildSummaryCellJumps(this.overallProgressView.columns, this.overallProgressView.rows, this.outstandingSkillStreams);
    },
    outstandingSkillStreams(): Set<string> {
      return listOutstandingSkillStreams(this.items);
    },
    peakAwardPeople(): ShownPeople {
      return { selectedPatrols: this.filters.peakAwardSelectedPatrols, memberFilter: this.filters.peakAwardMemberFilter };
    },
    peakAwardCoreSkillJumps(): CellJumps {
      const nameFormat = this.filters.peakAwardNameFormat;
      const displayName = (row: PeakAwardMemberRow) => getMemberDisplayName(row.firstName, row.lastName, row.memberId, nameFormat);
      return buildPeakAwardCoreSkillJumps(this.filteredPeakAwardSummaryRows, displayName, highestApprovedStreams(this.items), this.outstandingSkillStreams);
    },
    peakAwardCoreSkillMenus(): TabJump[][] {
      if (!this.peakAwardRequirement) return [];
      const lowestStages = lowestStagesNeeded(
        this.items,
        this.filteredPeakAwardSummaryRows.map((row) => row.memberId),
      );
      return peakAwardCoreSkillHeaderJumps(this.peakAwardPeople, lowestStages, this.peakAwardRequirement.coreSkillStage);
    },
    peakAwardCoreSkillsGroupMenu(): TabJump[] {
      return peakAwardCoreSkillsGroupJumps(this.peakAwardPeople);
    },
    peakAwardMemberMenus(): Record<string, TabJump[]> {
      const nameFormat = this.filters.peakAwardNameFormat;
      const menus: Record<string, TabJump[]> = {};
      this.filteredPeakAwardSummaryRows.forEach((row) => {
        menus[row.memberId] = peakAwardMemberJumps(row, getMemberDisplayName(row.firstName, row.lastName, row.memberId, nameFormat), this.peakAwardPeople);
      });
      return menus;
    },
    summaryPeople(): ShownPeople {
      return { selectedPatrols: this.filters.summarySelectedPatrols, memberFilter: this.filters.summaryMemberFilter };
    },
    summaryColumnMenus(): TabJump[][] {
      const { columns, rows } = this.overallProgressView;
      const lowestStages = lowestStagesNeeded(
        this.items,
        rows.map((row) => row.memberId),
      );
      return columns.map((column) => summaryColumnJumps(column, this.summaryPeople, lowestStages));
    },
    summaryMemberMenus(): Record<string, TabJump[]> {
      const fullNames: Record<string, string> = {};
      this.unitMembers.forEach((member) => (fullNames[member.memberId] = member.memberName));
      const menus: Record<string, TabJump[]> = {};
      this.overallProgressView.rows.forEach((row) => {
        menus[row.memberId] = summaryMemberJumps(row, fullNames[row.memberId] ?? row.displayName, this.summaryPeople, !!this.peakAwardRequirement);
      });
      return menus;
    },
    summaryPrintMeta(): MetaEntry[] {
      return buildSummaryPrintMeta(this.filters, this.patrolFilterOptions, this.canFilterByPatrol);
    },
    peakAwardPrintMeta(): MetaEntry[] {
      return buildPeakAwardPrintMeta(this.filters, this.patrolFilterOptions, this.canFilterByPatrol);
    },
    nextStepsPrintMeta(): MetaEntry[] {
      const member = this.nextStepsMemberOptions.find((o) => o.value === this.resolvedNextStepsMemberId);
      const skillStream = this.nextStepsSkillStreams.find((s) => s.key === this.resolvedNextStepsSkillStream);
      return buildNextStepsPrintMeta(member?.text ?? "", skillStream?.label ?? "", this.resolvedNextStepsStage);
    },
    stageGridPrintMeta(): MetaEntry[] {
      const skillStream = this.stageGridSkillStreams.find((o) => o.key === this.resolvedStageGridSkillStream);
      return buildStageGridPrintMeta(this.filters, skillStream?.label ?? "", this.resolvedStageGridStage, this.patrolFilterOptions, this.canFilterByPatrol);
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
      if (this.filters.stageGridSelectedPatrols === null) {
        resolved.stageGridSelectedPatrols = newOptions;
      }
      if (this.filters.summarySelectedPatrols === null) {
        resolved.summarySelectedPatrols = newOptions;
      }
      if (this.filters.peakAwardSelectedPatrols === null) {
        resolved.peakAwardSelectedPatrols = newOptions;
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
    onSummarySortByUpdate(summarySortBy: OASProgressVueFilterState["summarySortBy"]) {
      this.filters = { ...this.filters, summarySortBy, summaryColumnSort: null };
    },
    clearSummaryColumnSort() {
      this.filters = { ...this.filters, summaryColumnSort: null };
    },
    onOverallProgressSortColumn(key: string) {
      this.filters = { ...this.filters, summaryColumnSort: nextColumnSort(this.summaryColumnSort, key) };
    },
    /** Re-selecting the tab already shown keeps the back bar, in case v-tabs echoes a jump's new value as a change. */
    onViewModeTabChange(viewMode: OASProgressVueFilterState["viewMode"]) {
      if (viewMode === this.filters.viewMode) return;
      this.filters = { ...this.filters, viewMode };
      this.jumpOrigin = null;
    },
    onTabJump(jump: TabJump) {
      this.filters = { ...this.filters, ...jump.filters, viewMode: jump.viewMode };
      this.jumpOrigin = jump.from;
    },
    onJumpBack() {
      if (this.jumpOrigin) this.onViewModeTabChange(this.jumpOrigin.viewMode);
    },
    onJumpBarClose() {
      this.jumpOrigin = null;
    },
    onResetFilters() {
      const keysToReset = RESETNEXT_STEPS_FILTER_KEYS_BY_VIEW[this.filters.viewMode] ?? [];

      const resetValues: Partial<OASProgressVueFilterState> = {};
      keysToReset.forEach((key) => {
        (resetValues as Record<string, unknown>)[key] = DEFAULT_FILTERS[key];
      });
      Object.assign(resetValues, commonDefaultsForTab(this.filters.viewMode, loadFilterDefaults()));

      // Gotcha: resolve the patrol selection here. patrolFilterOptions won't change on reset, so its watcher won't fire and null would mean "show nothing".
      const resolvedPatrols = this.patrolFilterOptions.length > 0 ? this.patrolFilterOptions : null;
      if (this.filters.viewMode === "summary") {
        resetValues.summarySelectedPatrols = resolvedPatrols;
      } else if (this.filters.viewMode === "peakAward") {
        resetValues.peakAwardSelectedPatrols = resolvedPatrols;
      } else if (this.filters.viewMode === "stageGrid") {
        resetValues.stageGridSelectedPatrols = resolvedPatrols;
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
    peakAwardPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.peakAward as unknown as PeakAwardVueInstance | undefined)?.getExportTable();
    },
    overallProgressPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.overallProgress as unknown as OverallProgressVueInstance | undefined)?.getExportTable();
    },
    nextStepsPrintTarget(): HTMLTableElement | undefined {
      return (this.$refs.nextSteps as unknown as NextStepsVueInstance | undefined)?.getPrintTable();
    },
    /** A new member or skill starts at its lowest unapproved stage. */
    onNextStepsMemberUpdate(nextStepsMemberId: string) {
      this.filters = { ...this.filters, nextStepsMemberId, nextStepsStage: null };
    },
    onNextStepsSkillStreamUpdate(nextStepsSkillStream: string) {
      this.filters = { ...this.filters, nextStepsSkillStream, nextStepsStage: null };
    },
    onNextStepsStageUpdate(nextStepsStage: number) {
      this.filters = { ...this.filters, nextStepsStage };
    },
    onNextStepsNameFormatUpdate(nextStepsNameFormat: NameFormat) {
      this.filters = { ...this.filters, nextStepsNameFormat };
    },
    async onNextStepsExcelExportClick() {
      await this.runExcelExport("Next Steps", this.nextStepsPrintMeta, [{ printProfile: "oas-next-steps", build: (header, logo) => buildNextStepsSheet({ rows: this.nextStepsRows, header, logo }) }]);
    },
    async onSummaryExcelExportClick() {
      const sheet: ExcelWorkbookRequest["sheets"][number] = {
        printProfile: "overall-progress",
        build: (header, logo) =>
          buildOverallProgressSheet({
            headers: this.overallProgressView.columns.map((c) => buildHeaderView(c)),
            rows: this.overallProgressView.rows,
            breakByPatrol: this.filters.summaryBreakByPatrol,
            header,
            logo,
          }),
      };
      await this.runExcelExport("Summary", this.summaryPrintMeta, [sheet]);
    },
    async onPeakAwardExcelExportClick() {
      const requirement = this.peakAwardRequirement;
      if (!requirement) return;
      const sheet: ExcelWorkbookRequest["sheets"][number] = {
        printProfile: "peak-award-summary",
        build: (header, logo) =>
          buildPeakAwardSummarySheet({
            rows: this.filteredPeakAwardSummaryRows,
            requirement,
            nameFormat: this.filters.peakAwardNameFormat,
            specialConditionText: this.specialConditionText,
            breakByPatrol: this.filters.peakAwardBreakByPatrol,
            header,
            logo,
          }),
      };
      await this.runExcelExport("Peak Award", this.peakAwardPrintMeta, [sheet]);
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
        showTerrainToast("Excel export complete");
      } catch (e) {
        logger.error(`${viewName} Excel export failed:`, e);
        showTerrainToast(`Excel export failed: ${e instanceof Error ? e.message : "Unknown error"}`, "error");
      } finally {
        this.isExcelExporting = false;
      }
    },
    stageGridPrintTargets(): HTMLTableElement[] {
      return (this.$refs.stageGrid as unknown as StageGridVueInstance | undefined)?.getPrintTables() ?? [];
    },
    async onStageGridExcelExportClick() {
      const stageGrid = this.$refs.stageGrid as unknown as StageGridVueInstance | undefined;
      if (!stageGrid) return;
      const view = stageGrid.getExportView();
      const sheets: ExcelWorkbookRequest["sheets"] = view.pages.map((page) => ({
        printProfile: "oas-stage-grid",
        build: (header, logo) => buildStageGridSheet({ page, membersAsRows: view.membersAsRows, breakByPatrol: view.breakByPatrol, header, logo }),
      }));
      await this.runExcelExport("Stage Grid", this.stageGridPrintMeta, sheets);
    },
  },
});
