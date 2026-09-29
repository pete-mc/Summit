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
    /**
     * Column identity (key/title/group-start) is the same for every row, so it is built once
     * here rather than being recomputed inside each row's cell list.
     */
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
     * At full scale this is ~180 columns x ~500 rows. Two deliberate choices keep a filter
     * change cheap:
     *
     *  - each row carries a plain boolean[] aligned to `columns`, not an array of per-cell
     *    objects, which avoids allocating ~90k objects per recompute;
     *  - the result is frozen, so Vue 2 skips walking it to install reactive getters on data
     *    that is rebuilt wholesale and never mutated in place.
     */
    renderedRows(): RenderedRow[] {
      const columnKeys = this.columns.map((column) => column.key);

      const rendered = this.rows.map((row) => {
        const present = new Set<string>();
        row.cells.forEach((cell) => present.add(cellLookupKey(cell.skill, cell.branch, cell.stage)));

        // Rows built from more than one raw wording are marked so an over-merge is visible
        // in the UI rather than silently presented as a single statement.
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

    /**
     * v-data-table requires `headers` even though the header is hand-written in the #header
     * slot — the two-row header spans stage columns under one group label via colspan, which
     * Vuetify's own renderer (one <th> per entry) cannot express. Mirrors OASHeatMapVue so both
     * heat maps are configured the same way.
     */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      return [{ text: "I-Statement", value: "statement", sortable: false }, ...this.columns.map((column) => ({ text: column.title, value: column.key, sortable: false }))];
    },
  },
});
