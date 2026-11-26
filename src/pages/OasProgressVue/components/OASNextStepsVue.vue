<template>
  <div class="oas-heatmap-scroll">
    <v-data-table :headers="headers" :items="rows" :items-per-page="-1" disable-sort disable-filtering disable-pagination hide-default-header hide-default-footer dense class="oas-heatmap-data-table oas-vue-data-table">
      <template #header>
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.value" :class="['oas-next-steps-header', 'oas-next-steps-' + header.value]">{{ header.text }}</th>
          </tr>
        </thead>
      </template>

      <template #body>
        <tbody>
          <template v-for="group in rowGroups">
            <tr v-for="(row, rowIndex) in group.rows" :key="row.inputId" :class="{ 'oas-next-steps-group-start': rowIndex === 0 }" :data-oas-input="row.inputId">
              <td v-if="rowIndex === 0" :rowspan="group.rows.length" class="oas-next-steps-inputGroup">{{ group.title }}</td>
              <td class="oas-next-steps-answered">
                <div :class="['oas-heatmap-square', row.answered ? 'oas-heatmap-square-answered' : 'oas-heatmap-square-unanswered']" :title="row.answered ? 'Answered' : 'Not answered'"></div>
              </td>
              <td class="oas-next-steps-iStatement">{{ row.iStatement }}</td>
              <td class="oas-next-steps-date">{{ formatDate(row.date) }}</td>
            </tr>
          </template>
        </tbody>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./OASNextStepsVue.ts"></script>

<style scoped>
/* Learning: fit-content is the table's one-line width while there is room, then the box's width, so I-Statements wrap only once the window is narrower. */
.oas-heatmap-data-table {
  width: fit-content;
  max-width: 100%;
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: Vuetify gives the <table> width: 100%, which is circular inside a fit-content parent. */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: auto;
  border-collapse: collapse;
}

/* Gotcha: Vuetify's wrapper scrolls sideways itself, which puts the horizontal scrollbar below the last row, out of view inside .oas-heatmap-scroll. */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  overflow: visible !important;
}

.oas-heatmap-data-table ::v-deep thead th {
  border-bottom: 2px solid var(--summit-color-border-default, #d3d9de) !important;
  white-space: nowrap;
}

/* Gotcha: content-script CSS loses cascade ties to Terrain's, so on a cold load Vuetify's padding can lose. Restate it. */
.oas-heatmap-data-table ::v-deep tbody td {
  padding: 4px 16px;
  vertical-align: middle;
  color: var(--summit-color-text-primary);
}

/* Gotcha: not `td + td`. Below a group's first row the rowspan Group cell isn't in the row, so Answered is the first td. */
.oas-heatmap-data-table ::v-deep thead th + th,
.oas-heatmap-data-table ::v-deep tbody td:not(.oas-next-steps-inputGroup) {
  border-left: 1px solid var(--summit-color-border-subtle);
}

/* Gotcha: the rowspan Group cell is in the group's first row only, so a hover greys part of the group. */
.oas-heatmap-data-table ::v-deep tbody tr:hover {
  background: transparent !important;
}

.oas-heatmap-data-table ::v-deep tbody tr.oas-next-steps-group-start > td {
  border-top: 1px solid var(--summit-color-border-default);
}

.oas-heatmap-data-table ::v-deep tbody td.oas-next-steps-inputGroup {
  font-weight: var(--summit-font-weight-semibold);
}

.oas-next-steps-inputGroup,
.oas-next-steps-date {
  white-space: nowrap;
}

.oas-next-steps-iStatement {
  min-width: 200px;
}

.oas-next-steps-answered {
  text-align: center;
}

.oas-next-steps-answered .oas-heatmap-square {
  display: inline-block;
  vertical-align: middle;
}
</style>
