<template>
  <div class="oas-stage-grid-scroll">
    <p v-if="!hasPages" class="oas-stage-grid-empty">No pages match the current filters. Try another Skill or Stage above.</p>

    <p v-if="hasSplitPages" class="oas-stage-grid-split-note">This unit is large enough that some stages print across more than one sheet — each extra sheet repeats the same rows for its own batch of members.</p>

    <!-- v-simple-table, not v-data-table, because it needs rowspan. -->
    <template v-if="!isMembersAsRows">
      <v-simple-table v-for="view in columnsLayoutPages" :key="view.page.key" dense class="oas-stage-grid-page oas-stage-grid-layout-columns" :data-oas-stage-grid-page="view.page.key">
        <thead>
          <tr v-if="patrolSpansForPage(view.page).length > 0" class="oas-stage-grid-patrol-header-row">
            <th class="oas-stage-grid-group-header" colspan="2"></th>
            <th v-for="span in patrolSpansForPage(view.page)" :key="span.patrolName" :colspan="span.columnCount" class="oas-stage-grid-patrol-header oas-stage-grid-patrol-group-start oas-stage-grid-patrol-group-end">
              {{ span.patrolName || "Unassigned" }}
            </th>
          </tr>
          <tr>
            <th class="oas-stage-grid-group-header oas-stage-grid-page-title" colspan="2">{{ view.page.title }}</th>
            <th
              v-for="(member, memberIndex) in view.page.members"
              :key="member.memberId"
              :class="[
                'oas-stage-grid-member-header',
                patrolBorderClassesForPage(view.page)[memberIndex].start ? 'oas-stage-grid-patrol-group-start' : '',
                patrolBorderClassesForPage(view.page)[memberIndex].end ? 'oas-stage-grid-patrol-group-end' : '',
              ]"
            >
              <span class="oas-stage-grid-rotated-text">{{ member.displayName }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in view.page.groups">
            <tr v-for="(row, rowIndex) in group.rows" :key="group.title + '::' + row.inputId">
              <td v-if="rowIndex === 0" :rowspan="group.rows.length" class="oas-stage-grid-group-band">
                <span class="oas-stage-grid-rotated-text">{{ group.title }}</span>
              </td>
              <td class="oas-stage-grid-statement" :style="{ width: view.statementWidthPx + 'px' }">{{ row.iStatement }}</td>
              <td
                v-for="(cell, cellIndex) in row.cells"
                :key="view.page.members[cellIndex].memberId"
                :style="{ width: view.memberColumnWidthPx + 'px', minWidth: view.memberColumnWidthPx + 'px' }"
                :class="[
                  'oas-stage-grid-cell',
                  stageGridCellClass(cell),
                  patrolBorderClassesForPage(view.page)[cellIndex].start ? 'oas-stage-grid-patrol-group-start' : '',
                  patrolBorderClassesForPage(view.page)[cellIndex].end ? 'oas-stage-grid-patrol-group-end' : '',
                ]"
              >
                <span v-if="cell.notApplicable" class="oas-stage-grid-cell-na-label" title="Not part of the version of this stage this member started on">n/a</span>
                <div v-else :class="['oas-heatmap-square', stageGridSquareClass(cell)]" :title="stageGridSquareTitle(cell)"></div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
    </template>

    <!-- Layout B: members as rows, with rotated I-Statement headers. -->
    <template v-else>
      <v-simple-table v-for="view in rowsLayoutPages" :key="view.page.key" dense class="oas-stage-grid-page oas-stage-grid-layout-rows" :data-oas-stage-grid-page="view.page.key">
        <thead>
          <tr class="oas-stage-grid-group-span-row">
            <th class="oas-stage-grid-member-name-header" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">{{ view.page.title }}</th>
            <th v-for="span in view.page.groupSpans" :key="span.title" :colspan="span.columnCount" class="oas-stage-grid-group-header oas-stage-grid-patrol-group-start oas-stage-grid-patrol-group-end">
              {{ span.title }}
            </th>
          </tr>
          <tr>
            <th class="oas-stage-grid-member-name-header" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">Member</th>
            <th
              v-for="(column, columnIndex) in view.page.columns"
              :key="column.inputId"
              :style="{ width: view.columnWidthPx + 'px', minWidth: view.columnWidthPx + 'px' }"
              :class="[
                'oas-stage-grid-statement-header',
                groupBorderClassesForPage(view.page)[columnIndex].start ? 'oas-stage-grid-patrol-group-start' : '',
                groupBorderClassesForPage(view.page)[columnIndex].end ? 'oas-stage-grid-patrol-group-end' : '',
              ]"
            >
              <span class="oas-stage-grid-rotated-text">{{ column.iStatement }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, rowIndex) in view.page.rows">
            <tr v-if="patrolDividerBeforeRow(view.page, rowIndex)" :key="'patrol::' + row.memberId" class="oas-stage-grid-patrol-divider-row">
              <td :colspan="view.page.columns.length + 1">{{ patrolDividerBeforeRow(view.page, rowIndex) }}</td>
            </tr>
            <tr :key="row.memberId">
              <td class="oas-stage-grid-member-name-cell" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">{{ row.displayName }}</td>
              <td
                v-for="(cell, cellIndex) in row.cells"
                :key="view.page.columns[cellIndex].inputId"
                :class="[
                  'oas-stage-grid-cell',
                  stageGridCellClass(cell),
                  groupBorderClassesForPage(view.page)[cellIndex].start ? 'oas-stage-grid-patrol-group-start' : '',
                  groupBorderClassesForPage(view.page)[cellIndex].end ? 'oas-stage-grid-patrol-group-end' : '',
                ]"
              >
                <span v-if="cell.notApplicable" class="oas-stage-grid-cell-na-label" title="Not part of the version of this stage this member started on">n/a</span>
                <div v-else :class="['oas-heatmap-square', stageGridSquareClass(cell)]" :title="stageGridSquareTitle(cell)"></div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
    </template>
  </div>
</template>

<script lang="ts" src="./OASStageGridVue.ts"></script>

<style scoped>
.oas-stage-grid-empty {
  padding: 12px 8px;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
}

.oas-stage-grid-split-note {
  margin: 0 0 var(--summit-space-md) 0;
  padding: var(--summit-space-sm) var(--summit-space-md);
  background: var(--summit-color-bg-muted);
  border-radius: 4px;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  color: var(--summit-color-text-primary);
}

/* Same frame as the Heatmap and Summary tables. width: max-content so the frame hugs the table instead of spanning the page. */
.oas-stage-grid-page {
  width: max-content;
  max-width: none;
  margin-bottom: var(--summit-space-lg);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: Vuetify's wrapper scrolls (overflow-x: auto), which would stop the sticky header and columns sticking to the page. */
.oas-stage-grid-page ::v-deep > .v-data-table__wrapper {
  overflow: visible;
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

.oas-stage-grid-page ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
}

/* Gotcha: Vuetify's row hover would grey only the cells without their own background, leaving sticky and awarded cells white. */
.oas-stage-grid-page ::v-deep > .v-data-table__wrapper > table > tbody > tr:hover {
  background: transparent !important;
}

.oas-stage-grid-page tbody td {
  vertical-align: middle;
}

.oas-stage-grid-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

.oas-stage-grid-group-band .oas-stage-grid-rotated-text {
  writing-mode: horizontal-tb;
  transform: none;
}

/* Gotcha: sticky cells need an explicit opaque background. Keep every selector in this block at element + class specificity so source order decides. */
.oas-stage-grid-page thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--color-white, #fff);
}

/* Learning: column lines are right borders only. The tables use separate borders (for sticky cells), so a left + right pair would draw a double line. */
.oas-stage-grid-page thead th.oas-stage-grid-group-header {
  text-align: left;
  white-space: nowrap;
  padding: 6px 8px;
}

/* 420px = group band + statement. Without max-width, a long nowrap title widens those columns. */
.oas-stage-grid-page thead th.oas-stage-grid-page-title {
  max-width: 420px;
  white-space: normal;
  color: var(--summit-color-text-primary);
  font-size: var(--summit-font-size-lg);
  font-weight: var(--summit-font-weight-semibold);
  border-right: 1px solid var(--summit-color-border-default);
}

/* Learning: a column renders at its wider cell, so the body cell (inline per-page width) decides the width, not this header. */
.oas-stage-grid-page thead th.oas-stage-grid-member-header {
  font-size: var(--oas-vue-font-size-body);
  font-weight: normal;
  vertical-align: bottom;
  width: 30px;
  min-width: 30px;
  max-width: 30px;
  height: 140px;
  padding: 6px 2px;
  border-right: 1px solid var(--summit-color-border-subtle);
}

.oas-stage-grid-page thead th.oas-stage-grid-patrol-header {
  background: var(--summit-color-bg-muted);
  color: var(--summit-color-text-primary);
  text-align: center;
  padding: 2px 4px;
}

.oas-stage-grid-patrol-header-row th.oas-stage-grid-group-header {
  background: var(--summit-color-bg-muted);
}

/* Gotcha: 70px must match .oas-stage-grid-statement's `left`, and GROUP_BAND_COLUMN_WIDTH_SCREEN_PX. */
.oas-stage-grid-page td.oas-stage-grid-group-band {
  position: sticky;
  left: 0;
  z-index: 2;
  width: 70px;
  min-width: 70px;
  max-width: 70px;
  text-align: center;
  vertical-align: middle;
  font-weight: var(--summit-font-weight-semibold);
  padding: 4px 2px;
  background: var(--color-white, #fff);
  border-right: 1px solid var(--summit-color-border-subtle);
}

/* The inline per-page width overrides this 350px fallback. A real `width` is needed so the table can't stretch the column. */
.oas-stage-grid-page td.oas-stage-grid-statement {
  position: sticky;
  left: 70px;
  z-index: 2;
  width: 350px;
  text-align: left;
  white-space: normal;
  padding: 4px 8px;
  background: var(--color-white, #fff);
  border-right: 1px solid var(--summit-color-border-default);
}

/* Gotcha: 30px must match MEMBER_COLUMN_MIN_WIDTH_PX and the member header width. */
.oas-stage-grid-page td.oas-stage-grid-cell {
  min-width: 30px;
  text-align: center;
  vertical-align: middle;
  padding: 4px 2px;
  border-right: 1px solid var(--summit-color-border-subtle);
}

.oas-stage-grid-cell-na {
  background: var(--summit-color-bg-muted);
}

.oas-stage-grid-cell-na-label {
  font-size: 11px;
  color: var(--color-neutral-charcoal, #748494);
}

.oas-stage-grid-cell .oas-heatmap-square {
  display: inline-block;
  vertical-align: middle;
}

/* No max-width: names must never be clipped. The inline measured width wins. */
.oas-stage-grid-layout-rows thead th.oas-stage-grid-member-name-header {
  text-align: left;
  min-width: 140px;
  padding: 6px 8px;
  border-right: 1px solid var(--summit-color-border-default);
}

.oas-stage-grid-layout-rows thead tr.oas-stage-grid-group-span-row th.oas-stage-grid-member-name-header {
  white-space: normal;
  color: var(--summit-color-text-primary);
  font-size: var(--summit-font-size-lg);
  font-weight: var(--summit-font-weight-semibold);
}

.oas-stage-grid-layout-rows thead tr:not(.oas-stage-grid-group-span-row) th.oas-stage-grid-member-name-header {
  white-space: nowrap;
}

.oas-stage-grid-layout-rows td.oas-stage-grid-member-name-cell {
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 140px;
  text-align: left;
  padding: 4px 8px;
  background: var(--color-white, #fff);
  border-right: 1px solid var(--summit-color-border-default);
  white-space: nowrap;
}

/* Gotcha: rotated text swaps axes. Height is the ~50-char wrap length; width grows with extra wrapped lines. */
/* Gotcha: Vuetify shrinks header text to 12px; the rotated names and I-statements are read like content, so they keep the body size. */
.oas-stage-grid-layout-rows thead th.oas-stage-grid-statement-header {
  font-size: var(--oas-vue-font-size-body);
  height: 350px;
  padding: 4px 2px;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
  border-right: 1px solid var(--summit-color-border-subtle);
}

/* break-word stops one long word forcing the fixed-width column wider. */
.oas-stage-grid-layout-rows thead th.oas-stage-grid-statement-header .oas-stage-grid-rotated-text {
  white-space: normal;
  word-break: break-word;
}

.oas-stage-grid-patrol-divider-row td {
  position: sticky;
  left: 0;
  background: var(--summit-color-bg-muted);
  font-weight: var(--summit-font-weight-semibold);
  padding: 4px 8px;
  text-align: left;
}

/* Last on purpose: these tie on specificity with the cell rules above, so source order decides. */
.oas-stage-grid-page td.oas-stage-grid-patrol-group-end,
.oas-stage-grid-page thead th.oas-stage-grid-patrol-group-end {
  border-right: 1px solid var(--summit-color-border-default);
}

.oas-stage-grid-page td.oas-stage-grid-cell:last-child,
.oas-stage-grid-page thead th:last-child {
  border-right: none;
}
</style>
