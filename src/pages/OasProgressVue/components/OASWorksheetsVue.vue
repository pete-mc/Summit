<template>
  <div class="oas-worksheet-scroll">
    <p v-if="!hasPages" class="oas-worksheet-empty">No worksheet pages match the current filters. Try widening the Skills or Stage range above.</p>

    <p v-if="hasSplitPages" class="oas-worksheet-split-note">This unit is large enough that some stages print across more than one sheet — each extra sheet repeats the same rows for its own batch of members.</p>

    <!-- v-simple-table, not v-data-table, because it needs rowspan. -->
    <template v-if="!isMembersAsRows">
      <v-simple-table v-for="view in columnsLayoutPages" :key="view.page.key" dense class="oas-worksheet-page oas-worksheet-layout-columns" :data-oas-worksheet-page="view.page.key">
        <thead>
          <tr v-if="patrolSpansForPage(view.page).length > 0" class="oas-worksheet-patrol-header-row">
            <th class="oas-worksheet-group-header" colspan="2"></th>
            <th
              v-for="span in patrolSpansForPage(view.page)"
              :key="span.patrolName"
              :colspan="span.columnCount"
              class="oas-worksheet-patrol-header oas-worksheet-patrol-group-start oas-worksheet-patrol-group-end"
            >
              {{ span.patrolName || "Unassigned" }}
            </th>
          </tr>
          <tr>
            <th class="oas-worksheet-group-header oas-worksheet-page-title" colspan="2">{{ view.page.title }}</th>
            <th
              v-for="(member, memberIndex) in view.page.members"
              :key="member.memberId"
              :class="[
                'oas-worksheet-member-header',
                patrolBorderClassesForPage(view.page)[memberIndex].start ? 'oas-worksheet-patrol-group-start' : '',
                patrolBorderClassesForPage(view.page)[memberIndex].end ? 'oas-worksheet-patrol-group-end' : '',
              ]"
            >
              <span class="oas-worksheet-rotated-text">{{ member.displayName }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in view.page.groups">
            <tr v-for="(row, rowIndex) in group.rows" :key="group.title + '::' + row.inputId">
              <td v-if="rowIndex === 0" :rowspan="group.rows.length" class="oas-worksheet-group-band">
                <span class="oas-worksheet-rotated-text">{{ group.title }}</span>
              </td>
              <td class="oas-worksheet-statement" :style="{ width: view.statementWidthPx + 'px' }">{{ row.iStatement }}</td>
              <td
                v-for="(cell, cellIndex) in row.cells"
                :key="view.page.members[cellIndex].memberId"
                :style="{ width: view.memberColumnWidthPx + 'px', minWidth: view.memberColumnWidthPx + 'px' }"
                :class="[
                  'oas-worksheet-cell',
                  worksheetCellClass(cell),
                  patrolBorderClassesForPage(view.page)[cellIndex].start ? 'oas-worksheet-patrol-group-start' : '',
                  patrolBorderClassesForPage(view.page)[cellIndex].end ? 'oas-worksheet-patrol-group-end' : '',
                ]"
              >
                <span v-if="cell.notApplicable" class="oas-worksheet-cell-na-label" title="Not part of the version of this stage this member started on">n/a</span>
                <span v-else-if="cell.date" class="oas-worksheet-cell-date">{{ formatWorksheetDate(cell.date) }}</span>
                <span v-else class="oas-worksheet-tick-box" aria-hidden="true"></span>
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
    </template>

    <!-- Layout B: members as rows, with rotated I-Statement headers. -->
    <template v-else>
      <v-simple-table v-for="view in rowsLayoutPages" :key="view.page.key" dense class="oas-worksheet-page oas-worksheet-layout-rows" :data-oas-worksheet-page="view.page.key">
        <thead>
          <tr class="oas-worksheet-group-span-row">
            <th class="oas-worksheet-member-name-header" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">{{ view.page.title }}</th>
            <th
              v-for="span in view.page.groupSpans"
              :key="span.title"
              :colspan="span.columnCount"
              class="oas-worksheet-group-header oas-worksheet-patrol-group-start oas-worksheet-patrol-group-end"
            >
              {{ span.title }}
            </th>
          </tr>
          <tr>
            <th class="oas-worksheet-member-name-header" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">Member</th>
            <th
              v-for="(column, columnIndex) in view.page.columns"
              :key="column.inputId"
              :style="{ width: view.columnWidthPx + 'px', minWidth: view.columnWidthPx + 'px' }"
              :class="[
                'oas-worksheet-statement-header',
                groupBorderClassesForPage(view.page)[columnIndex].start ? 'oas-worksheet-patrol-group-start' : '',
                groupBorderClassesForPage(view.page)[columnIndex].end ? 'oas-worksheet-patrol-group-end' : '',
              ]"
            >
              <span class="oas-worksheet-rotated-text">{{ column.iStatement }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, rowIndex) in view.page.rows">
            <tr v-if="patrolDividerBeforeRow(view.page, rowIndex)" :key="'patrol::' + row.memberId" class="oas-worksheet-patrol-divider-row">
              <td :colspan="view.page.columns.length + 1">{{ patrolDividerBeforeRow(view.page, rowIndex) }}</td>
            </tr>
            <tr :key="row.memberId">
              <td class="oas-worksheet-member-name-cell" :style="{ width: view.memberNameColumnWidthPx + 'px', minWidth: view.memberNameColumnWidthPx + 'px' }">{{ row.displayName }}</td>
              <td
                v-for="(cell, cellIndex) in row.cells"
                :key="view.page.columns[cellIndex].inputId"
                :class="[
                  'oas-worksheet-cell',
                  worksheetCellClass(cell),
                  groupBorderClassesForPage(view.page)[cellIndex].start ? 'oas-worksheet-patrol-group-start' : '',
                  groupBorderClassesForPage(view.page)[cellIndex].end ? 'oas-worksheet-patrol-group-end' : '',
                ]"
              >
                <span v-if="cell.notApplicable" class="oas-worksheet-cell-na-label" title="Not part of the version of this stage this member started on">n/a</span>
                <span v-else-if="cell.date" class="oas-worksheet-cell-date">{{ formatWorksheetDate(cell.date) }}</span>
                <span v-else class="oas-worksheet-tick-box" aria-hidden="true"></span>
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
    </template>
  </div>
</template>

<script lang="ts" src="./OASWorksheetsVue.ts">
</script>

<style scoped>
.oas-worksheet-empty {
  padding: 12px 8px;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
}

.oas-worksheet-split-note {
  margin: 0 0 var(--summit-space-md) 0;
  padding: var(--summit-space-sm) var(--summit-space-md);
  background: var(--summit-color-bg-muted);
  border-radius: 4px;
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  color: var(--summit-color-text-primary);
}

/* Same frame as the Heatmap and Summary tables. width: max-content so the frame hugs the table instead of spanning the page. */
.oas-worksheet-page {
  width: max-content;
  max-width: none;
  margin-bottom: var(--summit-space-lg);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: Vuetify's wrapper scrolls (overflow-x: auto), which would stop the sticky header and columns sticking to the page. */
.oas-worksheet-page ::v-deep > .v-data-table__wrapper {
  overflow: visible;
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

.oas-worksheet-page ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
}

/* Gotcha: Vuetify's row hover would grey only the cells without their own background, leaving sticky and awarded cells white. */
.oas-worksheet-page ::v-deep > .v-data-table__wrapper > table > tbody > tr:hover {
  background: transparent !important;
}

.oas-worksheet-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

.oas-worksheet-group-band .oas-worksheet-rotated-text {
  writing-mode: horizontal-tb;
  transform: none;
}

/* Gotcha: sticky cells need an explicit opaque background. Keep every selector in this block at element + class specificity so source order decides. */
.oas-worksheet-page thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--color-white, #fff);
}

/* Learning: column lines are right borders only. The tables use separate borders (for sticky cells), so a left + right pair would draw a double line. */
.oas-worksheet-page thead th.oas-worksheet-group-header {
  text-align: left;
  white-space: nowrap;
  padding: 6px 8px;
}

/* 420px = group band + statement. Without max-width, a long nowrap title widens those columns. */
.oas-worksheet-page thead th.oas-worksheet-page-title {
  max-width: 420px;
  white-space: normal;
  color: var(--summit-color-text-primary);
  font-size: var(--summit-font-size-lg);
  font-weight: var(--summit-font-weight-semibold);
  border-right: 1px solid var(--summit-color-border-default);
}

/* Learning: a column renders at its wider cell, so the body cell (inline per-page width) decides the width, not this header. */
.oas-worksheet-page thead th.oas-worksheet-member-header {
  font-size: var(--oas-vue-font-size-body);
  width: 28px;
  min-width: 28px;
  max-width: 28px;
  height: 140px;
  padding: 6px 2px;
  border-right: 1px solid var(--summit-color-border-subtle);
}

.oas-worksheet-page thead th.oas-worksheet-patrol-header {
  background: var(--summit-color-bg-muted);
  color: var(--summit-color-text-primary);
  text-align: center;
  padding: 2px 4px;
}

.oas-worksheet-patrol-header-row th.oas-worksheet-group-header {
  background: var(--summit-color-bg-muted);
}

/* Gotcha: 70px must match .oas-worksheet-statement's `left`, and GROUP_BAND_COLUMN_WIDTH_SCREEN_PX. */
.oas-worksheet-page td.oas-worksheet-group-band {
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
.oas-worksheet-page td.oas-worksheet-statement {
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

.oas-worksheet-page td.oas-worksheet-cell {
  min-width: 70px;
  text-align: center;
  vertical-align: middle;
  padding: 4px;
  border-right: 1px solid var(--summit-color-border-subtle);
}

/* Dark green background, so the text needs the on-primary colour. Print uses its own light green. */
.oas-worksheet-cell-awarded {
  background: var(--summit-color-status-awarded);
  color: var(--summit-color-text-on-primary, #ffffff);
}

.oas-worksheet-cell-na {
  background: var(--summit-color-bg-muted);
}

.oas-worksheet-cell-na-label {
  font-size: 11px;
  color: var(--color-neutral-charcoal, #748494);
}

.oas-worksheet-cell-date {
  font-size: var(--oas-vue-font-size-body);
  white-space: nowrap;
}

.oas-worksheet-tick-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid var(--color-light-mid-charcoal, #b7c2cc);
  border-radius: 2px;
}

/* No max-width: names must never be clipped. The inline measured width wins. */
.oas-worksheet-layout-rows thead th.oas-worksheet-member-name-header {
  text-align: left;
  min-width: 140px;
  padding: 6px 8px;
  border-right: 1px solid var(--summit-color-border-default);
}

.oas-worksheet-layout-rows thead tr.oas-worksheet-group-span-row th.oas-worksheet-member-name-header {
  white-space: normal;
  color: var(--summit-color-text-primary);
  font-size: var(--summit-font-size-lg);
  font-weight: var(--summit-font-weight-semibold);
}

.oas-worksheet-layout-rows thead tr:not(.oas-worksheet-group-span-row) th.oas-worksheet-member-name-header {
  white-space: nowrap;
}

.oas-worksheet-layout-rows td.oas-worksheet-member-name-cell {
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
/* Gotcha: Vuetify shrinks header text to 12px; the rotated names and I-statements are content, so they keep the body size. */
.oas-worksheet-layout-rows thead th.oas-worksheet-statement-header {
  font-size: var(--oas-vue-font-size-body);
  height: 350px;
  padding: 4px 2px;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
  border-right: 1px solid var(--summit-color-border-subtle);
}

/* break-word stops one long word forcing the fixed-width column wider. */
.oas-worksheet-layout-rows thead th.oas-worksheet-statement-header .oas-worksheet-rotated-text {
  white-space: normal;
  word-break: break-word;
}

.oas-worksheet-patrol-divider-row td {
  position: sticky;
  left: 0;
  background: var(--summit-color-bg-muted);
  font-weight: var(--summit-font-weight-semibold);
  padding: 4px 8px;
  text-align: left;
}

/* Last on purpose: these tie on specificity with the cell rules above, so source order decides. */
.oas-worksheet-page td.oas-worksheet-patrol-group-end,
.oas-worksheet-page thead th.oas-worksheet-patrol-group-end {
  border-right: 1px solid var(--summit-color-border-default);
}

.oas-worksheet-page td.oas-worksheet-cell:last-child,
.oas-worksheet-page thead th:last-child {
  border-right: none;
}
</style>
