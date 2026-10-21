import { defineComponent, type PropType } from "vue";
import IStatementFilters from "./IStatementFilters.vue";
import IStatementHeatMap from "./IStatementHeatMap.vue";
import SummitLoadingState from "@/components/SummitLoadingState.vue";
import { type IStatementMatrix } from "../services/buildIStatementMatrix";
import { filterIStatementMatrix, type FilteredMatrix, type IStatementFilters as Filters } from "../services/filterIStatementMatrix";
import { defaultIStatementFilters, loadIStatementFilters, saveIStatementFilters } from "../services/IStatementFilterPersistence";

export default defineComponent({
  name: "IStatementsContent",
  components: { IStatementFilters, IStatementHeatMap, SummitLoadingState },
  props: {
    matrix: { type: Object as PropType<IStatementMatrix | undefined>, default: undefined },
    loadState: { type: String, default: "loading-trees" },
    progressDone: { type: Number, default: 0 },
    progressTotal: { type: Number, default: 0 },
    onReload: { type: Function as PropType<() => void>, required: true },
  },
  data() {
    return { filters: loadIStatementFilters() };
  },
  computed: {
    isLoading(): boolean {
      return this.loadState === "loading-trees" || this.loadState === "loading-templates";
    },
    sharedLoadState(): "loading" | "ready" | "error" {
      if (this.isLoading) return "loading";
      return this.loadState === "error" ? "error" : "ready";
    },
    filtered(): FilteredMatrix {
      if (!this.matrix) {
        return { rows: [], groups: [], presentCells: new Set<string>() };
      }
      return filterIStatementMatrix(this.matrix, this.filters);
    },
    summaryText(): string {
      const rows = this.filtered.rows.length;
      const groups = this.filtered.groups.length;
      return rows + " i-statement" + (rows === 1 ? "" : "s") + " across " + groups + " skill/stream" + (groups === 1 ? "" : "s");
    },
  },
  methods: {
    onFiltersUpdate(filters: Filters) {
      this.filters = filters;
      saveIStatementFilters(filters);
    },
    onResetFilters() {
      this.filters = defaultIStatementFilters();
      saveIStatementFilters(this.filters);
    },
  },
});
