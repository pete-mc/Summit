import { defineComponent } from "vue";
import type { PropType } from "vue";
import OASHeatMapVue from "./OASHeatMapVue.vue";
import OASProgressionFiltersVue from "./OASProgressionFiltersVue.vue";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { collectPatrolNames, OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import { loadOASProgressionVueFilters, saveOASProgressionVueFilters, type OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";
import { exportElementToPdf } from "@/components/gridExport";
import { createLogger } from "@/helpers";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const logger = createLogger("OasProgressionVueContent");

interface HeatMapVueInstance {
  $refs: { exportTable?: HTMLTableElement };
}

const MAX_STAGE = 9;

const DEFAULT_FILTERS: OASProgressionVueFilterState = {
  memberFilter: "",
  hideLastName: false,
  useCodenames: false,
  selectedPatrols: [],
  breakByPatrol: false,
  hideEmptyStreams: false,
  hideEmptyTopColumns: false,
  onlyInProgress: false,
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
  components: { OASHeatMapVue, OASProgressionFiltersVue },
  props: {
    items: { type: Array as PropType<OASProgressionRow[]>, required: true },
    trunkStageCounts: { type: Object as PropType<Record<string, number>>, required: true },
    members: { type: Array as PropType<TerrainUnitMember[]>, required: true },
    loadingStreams: { type: Object as PropType<Set<string>>, required: true },
    onReloadAll: { type: Function as PropType<() => void>, required: true },
    onReloadStream: { type: Function as PropType<(stream: string) => void>, required: true },
  },
  data() {
    return {
      filters: loadInitialFilters() as OASProgressionVueFilterState,
      isReloading: false,
      pdfExportFeedback: "",
    };
  },
  computed: {
    grouped(): Record<string, ReturnType<typeof groupRowsForHeatMap>[string]> {
      return groupRowsForHeatMap(this.items, this.trunkStageCounts, this.members);
    },
    availablePatrols(): string[] {
      return collectPatrolNames(Object.values(this.grouped).flatMap((skill) => skill.sections));
    },
    hasAnyEmptySections(): boolean {
      return Object.values(this.grouped).some((skill) => skill.sections.some((section) => section.isEmpty));
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
    onResetFilters() {
      this.filters = { ...DEFAULT_FILTERS };
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
      const table = heatMap?.$refs.exportTable;
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
        this.pdfExportFeedback = "PDF export complete";
      } catch (e) {
        logger.error("PDF export failed:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        this.pdfExportFeedback = `PDF export failed: ${message}`;
      }
    },
  },
});
