import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { OverallProgressCell, OverallProgressColumn, OverallProgressColumnSort, OverallProgressRow } from "@/pages/OasProgress/services/buildOverallProgressRows";
import { groupRowsByPatrol, type PatrolGroupOf } from "@/pages/OasProgress/services/filterHeatMapSections";
import type { SummaryCellJumps, TabJump } from "@/pages/OasProgressVue/services/tabJumps";
import { formatStream, skillTitle } from "./OASHeatMapVue";
import { awardTooltip } from "./OASPeakAwardSummaryVue";
import OASTabJumpMenu from "./OASTabJumpMenu.vue";

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

export function cellTitle(cell: OverallProgressCell): string | null {
  if (!cell.awards) return null;
  return cell.awards.map((award) => awardTooltip(award, award.stage)).join("\n") || null;
}

export function linkedCellTitle(cell: OverallProgressCell, jump: TabJump | null): string | null {
  const lines = [cellTitle(cell), jump?.title].filter((line): line is string => !!line);
  return lines.join("\n") || null;
}

export default defineComponent({
  name: "OASOverallProgressVue",
  components: { OASTabJumpMenu },
  props: {
    columns: { type: Array as PropType<OverallProgressColumn[]>, required: true },
    rows: { type: Array as PropType<OverallProgressRow[]>, required: true },
    columnSort: { type: Object as PropType<OverallProgressColumnSort | null>, default: null },
    breakByPatrol: { type: Boolean, default: false },
    cellJumps: { type: Object as PropType<SummaryCellJumps>, default: () => ({}) },
    /** Aligned with the columns. */
    columnJumps: { type: Array as PropType<TabJump[][]>, default: () => [] },
    /** Keyed by memberId. */
    memberJumps: { type: Object as PropType<Record<string, TabJump[]>>, default: () => ({}) },
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
    cellJump(row: OverallProgressRow, index: number): TabJump | null {
      return this.cellJumps[row.memberId]?.[index] ?? null;
    },
    cellTooltip(row: OverallProgressRow, cell: OverallProgressCell, index: number): string | null {
      return linkedCellTitle(cell, this.cellJump(row, index));
    },
    onCellClick(row: OverallProgressRow, index: number) {
      const jump = this.cellJump(row, index);
      if (jump) this.onJump(jump);
    },
    onJump(jump: TabJump) {
      this.$emit("jump", jump);
    },
    onHeaderClick(key: string) {
      this.$emit("sort-column", key);
    },
    /** Gotcha: a ref on v-data-table is the component, not the <table>. */
    getExportTable(): HTMLTableElement | undefined {
      return (this.$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
});
