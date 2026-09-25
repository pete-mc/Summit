<template>
  <div class="oas-heatmap-scroll">
    <table class="oas-heatmap-table istatement-table">
      <thead class="oas-heatmap-thead">
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
    </table>
    <p v-if="renderedRows.length === 0" class="istatement-empty">No i-statements match the current filters.</p>
  </div>
</template>

<script lang="ts" src="./IStatementHeatMap.ts">
</script>

<style scoped>
/* Pinned to the shared scale so this table matches the OAS Progression page's tables. */
.istatement-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  border-collapse: separate;
  border-spacing: 0;
}

.istatement-label-header,
.istatement-label-cell {
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

.istatement-label-header {
  z-index: 4;
  background: var(--summit-color-bg-primary);
  color: var(--summit-color-text-on-primary);
}

.oas-heatmap-thead th {
  position: sticky;
  z-index: 3;
}

.istatement-group-header {
  top: 0;
  background: var(--summit-color-bg-primary);
  color: var(--summit-color-text-on-primary);
  font-size: var(--oas-vue-font-size-body);
  font-weight: var(--summit-font-weight-semibold);
  white-space: nowrap;
  padding: 4px 8px;
  border-left: 2px solid var(--summit-color-border-default);
}

/*
 * Offset by the first header row's height so both rows stay visible when scrolling
 * vertically; 28px matches the group header's rendered height at the body font size.
 */
.istatement-stage-header {
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

.istatement-table tbody tr:nth-child(even) td {
  background-color: var(--summit-color-bg-muted);
}

.istatement-table tbody tr:nth-child(even) .istatement-label-cell {
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
