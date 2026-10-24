<template>
  <div class="oas-worksheet-scroll">
    <p v-if="!hasPages" class="oas-worksheet-empty">No worksheet pages match the current filters. Try widening the Skills or Stage range above.</p>

    <p v-if="hasSplitPages" class="oas-worksheet-split-note">This unit is large enough that some stages print across more than one sheet — each extra sheet repeats the same rows for its own batch of members.</p>

    <!-- Layout A: members as columns. A plain <table>, not v-data-table, because it needs rowspan and a repeating print thead. -->
    <template v-if="!isMembersAsRows">
      <table
        v-for="view in columnsLayoutPages"
        :key="view.page.key"
        class="oas-worksheet-page oas-worksheet-layout-columns"
        :data-oas-worksheet-page="view.page.key"
        :data-oas-worksheet-member-offset="view.memberOffset"
        :data-oas-worksheet-member-total="view.originalMemberCount"
      >
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
      </table>
    </template>

    <!-- Layout B: members as rows, with rotated I-Statement headers. -->
    <template v-else>
      <table
        v-for="view in rowsLayoutPages"
        :key="view.page.key"
        class="oas-worksheet-page oas-worksheet-layout-rows"
        :data-oas-worksheet-page="view.page.key"
        :data-oas-worksheet-statement-offset="view.statementOffset"
        :data-oas-worksheet-statement-total="view.originalColumnCount"
      >
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
      </table>
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

/* Gotcha: no `min-width: 100%`. On small units it lets the statement column absorb slack and leaves an empty gap. */
.oas-worksheet-page {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: var(--summit-space-lg);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

.oas-worksheet-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

/* Screen only: group-band text stays horizontal. printWorksheets.ts keeps it rotated. */
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

.oas-worksheet-page thead th.oas-worksheet-group-header {
  text-align: left;
  font-size: var(--oas-vue-font-size-body);
  font-weight: var(--summit-font-weight-semibold);
  white-space: nowrap;
  padding: 6px 8px;
}

/* 420px = group band + statement. Without max-width, a long nowrap title widens those columns. */
.oas-worksheet-page thead th.oas-worksheet-page-title {
  max-width: 420px;
  white-space: normal;
}

/* Learning: a column renders at its wider cell, so the body cell (inline per-page width) decides the width, not this header. */
.oas-worksheet-page thead th.oas-worksheet-member-header {
  width: 28px;
  min-width: 28px;
  max-width: 28px;
  height: 140px;
  padding: 6px 2px;
  font-weight: normal;
}

.oas-worksheet-page thead th.oas-worksheet-patrol-header {
  background: var(--summit-color-bg-muted);
  font-weight: var(--summit-font-weight-semibold);
  text-align: center;
  padding: 2px 4px;
  border-bottom: 1px solid var(--summit-color-border-default);
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
  border-right: 2px solid var(--summit-color-border-default);
  border-bottom: 1px solid var(--summit-color-border-subtle);
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
  border-right: 2px solid var(--summit-color-border-default);
  border-bottom: 1px solid var(--summit-color-border-subtle);
}

.oas-worksheet-page td.oas-worksheet-cell {
  min-width: 70px;
  text-align: center;
  vertical-align: middle;
  padding: 4px;
  border-bottom: 1px solid var(--summit-color-border-subtle);
}

/* Learning: borders, not background tints, mark patrol/group boundaries. A cell's background should only ever show its own state. */
.oas-worksheet-patrol-group-start {
  border-left: 2px solid var(--summit-color-border-default);
}

.oas-worksheet-patrol-group-end {
  border-right: 2px solid var(--summit-color-border-default);
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
  font-weight: var(--summit-font-weight-semibold);
}

/* The title cell may wrap; the "Member" cell below it must not. */
.oas-worksheet-layout-rows thead tr.oas-worksheet-group-span-row th.oas-worksheet-member-name-header {
  white-space: normal;
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
  border-right: 2px solid var(--summit-color-border-default);
  border-bottom: 1px solid var(--summit-color-border-subtle);
  white-space: nowrap;
}

/* Gotcha: rotated text swaps axes. Height is the ~50-char wrap length; width grows with extra wrapped lines. */
.oas-worksheet-layout-rows thead th.oas-worksheet-statement-header {
  height: 350px;
  padding: 4px 2px;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
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
</style>
