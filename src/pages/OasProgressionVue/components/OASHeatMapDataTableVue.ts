import OASHeatMapVue from "./OASHeatMapVue";

/**
 * Heat map rendered through v-data-table, so Terrain's own table styling is inherited rather than
 * reimplemented in Summit's CSS.
 *
 * Extends the real heat map's options object rather than duplicating its grouping, filtering and
 * cell-state logic — only the rendering differs. See
 * .claude/OASProgression/SPIKE_HEATMAP_DATATABLE.md.
 */
export default {
  ...OASHeatMapVue,
  name: "OASHeatMapDataTableVue",
  computed: {
    ...OASHeatMapVue.computed,

    /**
     * Column definitions, used only to tell v-data-table how many columns exist — the actual
     * <thead> is hand-written in the header slot, because the stage-group row needs colspan.
     */
    dataTableHeaders(): Array<{ text: string; value: string; sortable: boolean }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stages = (this as any).allStages as number[];
      return [{ text: "Member", value: "member", sortable: false }, { text: "Stage", value: "stage", sortable: false }, ...stages.map((stage) => ({ text: String(stage), value: `stage-${stage}`, sortable: false }))];
    },

    /**
     * v-data-table requires an `items` array, but the heat map's rows are rendered from its own
     * `sections` tree in the body slot. One entry per rendered member row keeps the component's
     * internal bookkeeping (empty-state detection, item counts) consistent with what is on screen
     * without the rendering depending on it.
     */
    flatRows(): Array<{ memberId: string }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sections = (this as any).sections as Array<{ patrolGroups: Array<{ members: Array<{ memberId: string }> }> }>;
      return sections.flatMap((section) => section.patrolGroups.flatMap((group) => group.members.map((member) => ({ memberId: member.memberId }))));
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...((OASHeatMapVue as any).methods ?? {}),

    /**
     * The <table> element the PDF export measures row geometry from.
     *
     * A `ref` on a v-data-table resolves to the Vue component instance, not an element, so the
     * old `$refs.exportTable` contract cannot work here — and the failure would be silent, since
     * exportElementToPdf would simply find no <tr>s and produce an empty PDF rather than throwing.
     * Exposing it as a method keeps the caller working against a stable contract regardless of how
     * either heat map renders internally.
     */
    getExportTable(): HTMLTableElement | undefined {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((this as any).$el as HTMLElement | undefined)?.querySelector("table") ?? undefined;
    },
  },
};
