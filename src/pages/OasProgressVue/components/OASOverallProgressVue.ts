import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OverallProgressColumn, OverallProgressColumnSort, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import { groupRowsByPatrol, type PatrolGroupOf } from "@/pages/OasProgress/services/filterHeatMapSections";
import { formatStream, skillTitle } from "./OASHeatMapVue";

export interface OverallProgressHeaderView {
  key: string;
  skillLabel: string;
  streamLabel: string | null;
  sortDirection: "descending" | "ascending" | null;
}

export function buildHeaderView(column: OverallProgressColumn, columnSort: OverallProgressColumnSort | null = null): OverallProgressHeaderView {
  const sortDirection = columnSort && columnSort.key === column.key ? (columnSort.descending ? "descending" : "ascending") : null;
  return { key: column.key, skillLabel: skillTitle(column.skill), streamLabel: column.stream ? formatStream(column.stream) : null, sortDirection };
}

export default defineComponent({
  name: "OASOverallProgressVue",
  props: {
    columns: { type: Array as PropType<OverallProgressColumn[]>, required: true },
    rows: { type: Array as PropType<OverallProgressRow[]>, required: true },
    columnSort: { type: Object as PropType<OverallProgressColumnSort | null>, default: null },
    breakByPatrol: { type: Boolean, default: false },
  },
  computed: {
    rowGroups(): PatrolGroupOf<OverallProgressRow>[] {
      return groupRowsByPatrol(this.rows, this.breakByPatrol);
    },
    headerViews(): OverallProgressHeaderView[] {
      return this.columns.map((column) => buildHeaderView(column, this.columnSort));
    },
    /** Only tells v-data-table the column count. The <thead> is hand-written. */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      return [{ text: "Member", value: "member", sortable: false }, ...this.columns.map((column) => ({ text: column.key, value: column.key, sortable: false }))];
    },
  },
  methods: {
    onHeaderClick(key: string) {
      this.$emit("sort-column", key);
    },
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
