<template>
  <div class="oas-heatmap-scroll">
    <v-data-table
      :headers="dataTableHeaders"
      :items="rows"
      :items-per-page="-1"
      disable-sort
      disable-filtering
      disable-pagination
      hide-default-header
      hide-default-footer
      dense
      class="oas-heatmap-data-table oas-overall-progress-table"
    >
      <template #header>
        <thead>
          <tr>
            <th class="oas-heatmap-member-header oas-overall-progress-member-header">Member</th>
            <th
              v-for="header in headerViews"
              :key="header.key"
              :class="['oas-overall-progress-column-header', { 'oas-overall-progress-column-sorted': header.sortDirection }]"
              :data-oas-column="header.key"
              :aria-sort="header.sortDirection || 'none'"
              title="Sort by this column"
              @click="onHeaderClick(header.key)"
            >
              <div class="oas-overall-progress-rotated-text">
                <span class="oas-overall-progress-skill-label">{{ header.skillLabel }}</span>
                <span v-if="header.streamLabel" class="oas-overall-progress-stream-label">{{ header.streamLabel }}</span>
              </div>
              <v-icon x-small class="oas-overall-progress-sort-icon">{{ header.sortDirection === "ascending" ? "mdi-arrow-up" : "mdi-arrow-down" }}</v-icon>
            </th>
          </tr>
        </thead>
      </template>

      <template #body>
        <tbody>
          <tr v-for="row in rows" :key="row.memberId" :data-oas-member="row.memberId">
            <td class="oas-heatmap-member-name">{{ row.displayName }}</td>
            <td v-for="(cell, index) in row.cells" :key="columns[index].key" class="oas-overall-progress-cell">
              {{ cell.stage }}<span v-if="cell.nextStageProgress" class="oas-heatmap-stage-progress">.{{ cell.nextStageProgress }}</span>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./OASOverallProgressVue.ts">
</script>

<style scoped>
.oas-heatmap-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: collapse;
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
}

.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

/* Every column is as wide as a two-line rotated header, so trunk and stream columns match. */
.oas-overall-progress-table {
  --oas-overall-progress-label-line-height: 18px;
  --oas-overall-progress-column-width: calc(2 * var(--oas-overall-progress-label-line-height) + 8px);
}

/* Gotcha: Vuetify's dense cell padding (16px a side) outranks a plain scoped class and would make every column wide. */
.oas-overall-progress-table ::v-deep thead th.oas-overall-progress-column-header,
.oas-overall-progress-table ::v-deep tbody td.oas-overall-progress-cell {
  box-sizing: border-box;
  width: var(--oas-overall-progress-column-width);
  min-width: var(--oas-overall-progress-column-width);
  max-width: var(--oas-overall-progress-column-width);
  padding: 4px;
  border-left: 1px solid var(--summit-color-border-subtle);
  text-align: center;
}

.oas-overall-progress-column-header {
  cursor: pointer;
  user-select: none;
}

/* The icon always takes its space, so headers don't jump when it appears. */
.oas-overall-progress-sort-icon {
  display: block;
  margin: 2px auto 0;
  visibility: hidden;
}

.oas-overall-progress-column-header:hover .oas-overall-progress-sort-icon {
  visibility: visible;
  opacity: 0.4;
}

.oas-overall-progress-column-sorted .oas-overall-progress-sort-icon,
.oas-overall-progress-column-sorted:hover .oas-overall-progress-sort-icon {
  visibility: visible;
  opacity: 1;
}

.oas-overall-progress-table ::v-deep thead th {
  height: auto;
  vertical-align: bottom;
  border-bottom: 2px solid var(--summit-color-border-default, #d3d9de) !important;
}

.oas-overall-progress-member-header {
  vertical-align: bottom;
}

/* Learning: in vertical-rl each span becomes a column of text, so the stream label sits beside the skill as a "second line" once rotated. */
.oas-overall-progress-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  line-height: var(--oas-overall-progress-label-line-height);
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}

.oas-overall-progress-stream-label {
  font-weight: normal;
  color: var(--color-neutral-charcoal, #748494);
}

.oas-overall-progress-cell {
  white-space: nowrap;
  color: var(--summit-color-text-primary);
}
</style>
