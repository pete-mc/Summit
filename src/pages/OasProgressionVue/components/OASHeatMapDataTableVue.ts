import OASHeatMapVue from "./OASHeatMapVue";

/**
 * SPIKE — heat map rendered through v-data-table.
 *
 * Extends the real heat map's options object rather than duplicating its ~250 lines of grouping,
 * filtering and cell-state logic, so this measures the RENDERING change and nothing else.
 *
 * See .claude/OASProgression/SPIKE_HEATMAP_DATATABLE.md for what this proved.
 */

interface SectionLike {
  key: string;
  skill: string;
  iconUrl: string | null;
  title: string;
  patrolGroups: Array<{ patrolName: string; members: unknown[] }>;
}

export default {
  ...OASHeatMapVue,
  name: "OASHeatMapDataTableVue",
  computed: {
    ...OASHeatMapVue.computed,

    /**
     * Headers exist only so v-data-table renders a <thead> with the right number of columns.
     *
     * Every one is `sortable: false`: sorting is disabled wholesale, because row order comes from
     * sortMembers() with patrol grouping and codename handling, which Vuetify's comparator knows
     * nothing about.
     *
     * NOTE what is missing — the real heat map's stage-group header uses colspan to span several
     * stage columns under one label. v-data-table's header renderer emits one <th> per header
     * with no colspan support, so reproducing that needs the `header` slot too, i.e. hand-writing
     * the thead as well as the tbody.
     */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stages = (this as any).allStages as number[];
      return [
        { text: "Member", value: "member", sortable: false },
        { text: "Stage", value: "stage", sortable: false },
        ...stages.map((stage) => ({ text: String(stage), value: `stage-${stage}`, sortable: false })),
      ];
    },

    /**
     * v-data-table requires a flat `items` array, but the heat map's shape is three levels deep
     * (section -> patrol group -> member row). This flattens it purely to satisfy that contract —
     * the body slot then immediately un-flattens it via sectionsFrom() below.
     *
     * That round trip is the clearest evidence the component is being fought rather than used:
     * the data is reshaped to enter it and reshaped back to render.
     */
    flatRows(): Array<{ sectionKey: string }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sections = (this as any).sections as SectionLike[];
      return sections.flatMap((section) => section.patrolGroups.flatMap((group) => group.members.map(() => ({ sectionKey: section.key }))));
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(OASHeatMapVue as any).methods,

    /**
     * Recovers the original section tree, ignoring the flat `items` the slot hands back.
     *
     * The argument is accepted and discarded deliberately: it shows that nothing v-data-table
     * does to `items` (sorting, filtering, pagination — all disabled above) is of any use here,
     * so the rendering reads straight from the component's own `sections` computed.
     */
    sectionsFrom(_items: unknown[]): SectionLike[] {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this as any).sections as SectionLike[];
    },
  },
};
