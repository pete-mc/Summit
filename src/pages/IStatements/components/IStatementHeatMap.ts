import { defineComponent, type PropType } from "vue";
import { type IStatementRow } from "../services/buildIStatementMatrix";
import { cellLookupKey, type VisibleGroup } from "../services/filterIStatementMatrix";

interface RenderedColumn {
  key: string;
  groupStart: boolean;
  title: string;
}

interface RenderedRow {
  key: string;
  displayText: string;
  present: boolean[];
  variantCount: number;
  variantTitle: string;
}

export default defineComponent({
  name: "IStatementHeatMap",
  props: {
    rows: { type: Array as PropType<IStatementRow[]>, required: true },
    groups: { type: Array as PropType<VisibleGroup[]>, required: true },
  },
  computed: {
    columns(): RenderedColumn[] {
      const columns: RenderedColumn[] = [];
      this.groups.forEach((group) => {
        group.visibleStages.forEach((stage, stageIndex) => {
          columns.push({
            key: cellLookupKey(group.skill, group.branch, stage),
            groupStart: stageIndex === 0,
            title: group.label + " — Stage " + stage,
          });
        });
      });
      return Object.freeze(columns) as RenderedColumn[];
    },

    /**
     * Learning: ~180 x ~500 cells. Rows are plain boolean[] (not ~90k objects), and the result is frozen so
     * Vue 2 doesn't make it reactive.
     */
    renderedRows(): RenderedRow[] {
      const columnKeys = this.columns.map((column) => column.key);

      const rendered = this.rows.map((row) => {
        const present = new Set<string>();
        row.cells.forEach((cell) => present.add(cellLookupKey(cell.skill, cell.branch, cell.stage)));

        const variants = Array.from(row.variants.keys());

        return Object.freeze({
          key: row.key,
          displayText: row.displayText,
          present: columnKeys.map((key) => present.has(key)),
          variantCount: variants.length,
          variantTitle: variants.length > 1 ? "Merged from " + variants.length + " wordings:\n• " + variants.join("\n• ") : "",
        });
      });

      return Object.freeze(rendered) as RenderedRow[];
    },

    /** Needed only for the column count; the header is hand-written for colspan. */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      return [{ text: "I-Statement", value: "statement", sortable: false }, ...this.columns.map((column) => ({ text: column.title, value: column.key, sortable: false }))];
    },
  },
});
