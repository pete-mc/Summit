<template>
  <div class="oas-heatmap-scroll">
    <!--
      Rendered through v-data-table so it inherits Terrain's table styling, exactly as
      OASHeatMapVue does — the two heat maps are visual siblings and are configured identically.
      See .claude/I_Statement/PLAN_STAGE_6_MATCH_OAS.md.

      The disabled props are features this table never used: its row order comes from the matrix
      builder and its filtering is the bar above. Switching them off stops Vuetify adding UI for
      them, rather than giving anything up.
    -->
    <v-data-table
      :headers="dataTableHeaders"
      :items="renderedRows"
      :items-per-page="-1"
      disable-sort
      disable-filtering
      disable-pagination
      hide-default-header
      hide-default-footer
      dense
      class="istatement-data-table"
    >
      <!--
        Hand-written thead: the group row uses colspan to span several stage columns under one
        stream label, which Vuetify's own header renderer (one <th> per header entry) cannot
        express.

        Deliberately WITHOUT a thead class that paints the header Summit green, matching
        OASHeatMapVue: Terrain does not style table headers at all. (The legacy React OAS page's
        .oas-heatmap-thead rule did this; it was removed from index.css along with that page.)
      -->
      <template #header>
        <thead>
          <tr>
            <th rowspan="2" class="istatement-label-header">I-Statement</th>
            <th v-for="group in groups" :key="group.label" :colspan="group.visibleStages.length" class="istatement-group-header">
              {{ group.label }}
            </th>
          </tr>
          <tr>
            <template v-for="group in groups">
              <th
                v-for="(stage, stageIndex) in group.visibleStages"
                :key="group.label + '::' + stage"
                :class="['istatement-stage-header', stageIndex === 0 ? 'istatement-group-start' : '']"
              >
                {{ stage }}
              </th>
            </template>
          </tr>
        </thead>
      </template>

      <!--
        Hand-written tbody: each row renders from a frozen boolean[] aligned to `columns` rather
        than from per-cell objects (~90k of them at full scale), which Vuetify's default row
        renderer cannot do.
      -->
      <template #body>
        <tbody>
          <tr v-for="row in renderedRows" :key="row.key">
            <td class="istatement-label-cell">
              {{ row.displayText }}<span v-if="row.variantCount > 1" class="istatement-variant-badge" :title="row.variantTitle">{{ row.variantCount }}</span>
            </td>
            <td
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              :class="['istatement-cell', column.groupStart ? 'istatement-group-start' : '']"
            >
              <div v-if="row.present[columnIndex]" class="istatement-square" :title="column.title"></div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <p v-if="renderedRows.length === 0" class="istatement-empty">No i-statements match the current filters.</p>
  </div>
</template>

<script lang="ts" src="./IStatementHeatMap.ts">
</script>

<style scoped>
/* Pinned to the shared scale so this table matches the OAS Progression page's tables. */
.istatement-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/*
 * Vuetify's table defaults to width: 100%. This is a wide grid (~180 columns) inside a
 * horizontal scroller, so it must size to its content instead. border-collapse: separate is
 * required for position: sticky to work on <th>/<td> at all — collapsed borders detach the
 * sticky cells' backgrounds.
 */
.istatement-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

/*
 * Terrain's own v-data-table frame, via its tokens rather than literals so it tracks any
 * retheme — same rule as OASHeatMapVue. Terrain does not style thead at all, so this table's
 * green header styling is removed rather than replaced.
 */
.istatement-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

/*
 * STICKY CELLS — read this block as a whole before changing any one rule in it.
 *
 * Every sticky cell needs an OPAQUE background. While the header was green that came for free
 * from .oas-heatmap-thead; now that the green is dropped to match the OAS page, these
 * backgrounds are load-bearing rather than decorative — without them, content scrolls visibly
 * through the header and the frozen first column.
 *
 * All of these selectors are deliberately written at the same specificity, `[data-v-*] thead th`
 * plus one class (0,2,1), so they resolve by source order. A bare `.istatement-stage-header`
 * (0,1,0) would silently LOSE its background to a `thead th` rule — which is exactly the kind of
 * near-invisible regression this shape prevents. Keep any new rule here the same shape.
 */
.istatement-data-table ::v-deep thead th {
  position: sticky;
  z-index: 3;
  /* Matches the frame's white, not the old green. */
  background: var(--color-white, #fff);
}

.istatement-data-table ::v-deep thead th.istatement-group-header {
  top: 0;
  font-size: var(--oas-vue-font-size-body);
  font-weight: var(--summit-font-weight-semibold);
  white-space: nowrap;
  padding: 4px 8px;
  border-left: 2px solid var(--summit-color-border-default);
}

/*
 * Offset by the first header row's height so both rows stay visible when scrolling vertically;
 * 28px matches the group header's rendered height at the body font size. Muted rather than
 * white, so the stage numbers read as a sub-header of the stream label above them.
 */
.istatement-data-table ::v-deep thead th.istatement-stage-header {
  top: 28px;
  background: var(--summit-color-bg-muted);
  /*
   * Colour and weight set explicitly: without them the numbers inherit a pale grey from
   * Terrain's own table styling and are effectively invisible against the muted background.
   */
  color: var(--summit-color-text-primary);
  font-weight: var(--summit-font-weight-semibold);
  min-width: 22px;
  padding: 2px 4px;
  border-bottom: 1px solid var(--summit-color-border-default);
}

/*
 * The frozen first column — the header cell and every body cell share this, so they stay the
 * same width and keep one continuous right-hand edge.
 */
.istatement-data-table ::v-deep th.istatement-label-header,
.istatement-data-table ::v-deep td.istatement-label-cell {
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 320px;
  max-width: 420px;
  text-align: left;
  white-space: normal;
  padding: 4px 8px;
  background: var(--summit-color-bg-surface);
  border-right: 2px solid var(--summit-color-border-default);
}

/*
 * The corner cell is sticky on BOTH axes, so it has to out-stack the header row (3) and the
 * label column (2) alike — otherwise cells sliding underneath paint over it.
 *
 * Its background comes from the label-column rule above (0,2,1), which outranks the plain
 * `thead th` white (0,1,1) on specificity. That is deliberate: the corner belongs to the frozen
 * column visually, so it takes the column's surface colour rather than the header's white.
 */
.istatement-data-table ::v-deep thead th.istatement-label-header {
  z-index: 4;
}

.istatement-cell {
  min-width: 22px;
  height: 20px;
  padding: 1px;
  text-align: center;
}

/* Marks each group's first column so ~20 adjacent 9-column blocks stay visually separable. */
.istatement-group-start {
  border-left: 2px solid var(--summit-color-border-default);
}

/*
 * Zebra striping. The second rule repeats the first for the sticky label column specifically:
 * that column sets its own opaque background (it has to, or rows would show through it while
 * scrolling horizontally), which would otherwise override the stripe and leave the first column
 * a solid block beside striped rows.
 */
.istatement-data-table ::v-deep tbody tr:nth-child(even) td {
  background-color: var(--summit-color-bg-muted);
}

.istatement-data-table ::v-deep tbody tr:nth-child(even) .istatement-label-cell {
  background-color: var(--summit-color-bg-muted);
}

.istatement-square {
  width: 14px;
  height: 14px;
  margin: 0 auto;
  border-radius: 2px;
  background-color: var(--summit-color-status-answered);
}

/*
 * Marks a row whose wordings were merged by normalisation. Hovering lists the raw variants,
 * so an over-merge (two genuinely different statements collapsed into one row) is findable
 * rather than invisible.
 */
.istatement-variant-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 8px;
  background: var(--summit-color-bg-muted);
  border: 1px solid var(--summit-color-border-default);
  color: var(--summit-color-text-primary);
  font-size: var(--summit-font-size-sm);
  cursor: help;
}

.istatement-empty {
  padding: 12px 8px;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
}
</style>
