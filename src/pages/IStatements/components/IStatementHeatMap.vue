<template>
  <div class="oas-heatmap-scroll">
    <!-- Configured like OASHeatMapVue: v-data-table for Terrain's styling, built-in sort/filter/paging off. -->
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
      <!-- Hand-written thead for colspan. Left unstyled because Terrain doesn't style headers. -->
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

      <!-- Hand-written tbody: rows are frozen boolean[] (not ~90k cell objects), which Vuetify's row renderer can't do. -->
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
.istatement-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: position: sticky needs border-collapse: separate; collapsed borders detach sticky backgrounds. */
.istatement-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.istatement-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

/*
 * STICKY CELLS: every sticky cell needs an OPAQUE background, or content scrolls through it.
 * Gotcha: keep every selector here at `[data-v] thead th` + one class (0,2,1) so source order decides.
 * A bare class (0,1,0) silently loses its background to `thead th`.
 */
.istatement-data-table ::v-deep thead th {
  position: sticky;
  z-index: 3;
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

/* 28px = the group header row's height, so both rows stay visible. */
.istatement-data-table ::v-deep thead th.istatement-stage-header {
  top: 28px;
  background: var(--summit-color-bg-muted);
  /* Without these, Terrain's pale grey makes the numbers invisible. */
  color: var(--summit-color-text-primary);
  font-weight: var(--summit-font-weight-semibold);
  min-width: 22px;
  padding: 2px 4px;
  border-bottom: 1px solid var(--summit-color-border-default);
}

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

/* Sticky on both axes, so it must out-stack the header (3) and the label column (2). */
.istatement-data-table ::v-deep thead th.istatement-label-header {
  z-index: 4;
}

.istatement-cell {
  min-width: 22px;
  height: 20px;
  padding: 1px;
  text-align: center;
}

.istatement-group-start {
  border-left: 2px solid var(--summit-color-border-default);
}

/* The sticky label column has its own opaque background, so the stripe is repeated for it. */
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

/* Hover lists the merged wordings, so an over-merge can be spotted. */
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
