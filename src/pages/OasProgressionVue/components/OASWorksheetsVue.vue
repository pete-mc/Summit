<template>
  <div class="oas-worksheet-scroll">
    <p v-if="!hasPages" class="oas-worksheet-empty">No worksheet pages match the current filters. Try widening the Skills or Stage range above.</p>

    <!--
      Informational, not a warning — Layout A now actually SPLITS an over-wide page across extra
      sheets rather than clipping columns (PLAN_STAGE_5_LARGE_UNITS.md §3), so this just tells the
      leader to expect more sheets than Skill/Stage pages, not that anything will be lost. Layout B
      never splits (rows are unbounded), so this only ever applies to Layout A.
    -->
    <p v-if="hasSplitPages" class="oas-worksheet-split-note">This unit is large enough that some stages print across more than one sheet — each extra sheet repeats the same rows for its own batch of members.</p>

    <!--
      Layout A — "members as columns" (the original layout). One plain <table> per page (Skill x
      Stream x Stage), split into extra sheets where needed by columnsLayoutPages (see the .ts) —
      NOT a v-data-table, since a worksheet needs a vertically-merged first column (rowspan), a
      thead the print CSS can make repeat per printed page, and exact control over page breaks.
      See .claude/OASWorksheets/PLAN_STAGE_3.md §4.
    -->
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
          <!-- Second header row for patrol spans, only when "break by patrol" is on. -->
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

    <!--
      Layout B — "members as rows" ("Like Terrain" in Topo). Members are rows (unbounded — the
      page just grows downward, never split) and I-Statements are rotated-header columns, wrapped
      at a fixed, never-shrinking font size (not font-shrunk to fit — see worksheetPrintPageSize.ts's
      TRANSPOSED_COLUMN_WIDTH_SCREEN_PX/_PRINT_PX), split into extra sheets where needed by
      rowsLayoutPages (see the .ts) once there are more I-Statement columns than fit wrapped.
      See .claude/OASWorksheets/PLAN_STAGE_5_LARGE_UNITS.md §1-2.
    -->
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
          <!-- Group-band spanning row over the I-Statement columns — the transposed mirror of Layout A's patrol-span row, per PLAN_STAGE_5_LARGE_UNITS.md decision 2. -->
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

/*
 * One table per page, with a visible gap between consecutive pages on screen (Stage 4 adds the
 * @media print page-break rules that make this an actual sheet boundary).
 *
 * `min-width: 100%` was REMOVED here (was present through Stage 5) — it forced the table to be at
 * least as wide as its container regardless of actual column count. For a large unit this did
 * nothing (real content already exceeds the viewport), but for a SMALL unit (few narrow columns)
 * it forced the table wider than its content wanted, and the only flexible column
 * (.oas-worksheet-statement, previously a soft min/max-width range) absorbed all the slack —
 * visible live as a large empty band between the I-Statement text and the member columns on a
 * 3-member unit. `width: max-content` alone sizes the table to its real content in both cases.
 */
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

/*
 * Rotated header/group-band text (Layout A's group-band and member-name headers, Layout B's own
 * I-Statement headers) — one shared class for the `writing-mode` treatment itself, since every
 * rotated text span needs the identical transform regardless of which layout or column it's in.
 * `vertical-rl` reads top-to-bottom; the row/column it sits in budgets the height this needs.
 */
.oas-worksheet-rotated-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  display: inline-block;
}

/*
 * GUI-only override: Plan/Do/Review/Verify stays horizontal on screen, unlike print (which keeps
 * it rotated — see printWorksheets.ts's own, separate copy of .oas-worksheet-rotated-text, which
 * is untouched by this rule since the two stylesheets are independent files targeting the same
 * class names). Scoped to `.oas-worksheet-group-band` specifically — Layout A's member-name
 * header and Layout B's I-Statement headers keep rotating on screen too; this is the one case the
 * user asked to change.
 */
.oas-worksheet-group-band .oas-worksheet-rotated-text {
  writing-mode: horizontal-tb;
  transform: none;
}

/*
 * STICKY CELLS — read this block as a whole before changing one rule in it, same discipline as
 * IStatementHeatMap.vue's identical block (see .claude/DESIGN.md "Sticky table cells need an
 * opaque background stated, not inherited"). Every rule here is written at the same shape
 * (element + one class) so they resolve by source order rather than by an accident of specificity
 * — a bare `.oas-worksheet-group-header` would silently lose its background to a plain `thead th`
 * rule at higher specificity.
 */
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

/*
 * Layout A's own page-title cell specifically (NOT Layout B's group-span headers, which share the
 * base .oas-worksheet-group-header class above but span a variable, unrelated width — scoped via
 * this extra class rather than touching the shared rule). This cell's `colspan="2"` spans the
 * group-band + statement columns (70px + 350px = 420px — see those columns' own rules). Without
 * an explicit `max-width` here, a long title (e.g. "Stage 5 - Bushwalking (members 1-10 of 40)")
 * combined with `white-space: nowrap` would force the table layout to widen those two columns past
 * their own stated widths to fit the title on one line — the same mechanism that caused the
 * empty-gap bug, just triggered by a long TITLE instead of an unconstrained statement column.
 * Letting it wrap onto two lines instead keeps the two data columns at their real, intended widths.
 */
.oas-worksheet-page thead th.oas-worksheet-page-title {
  max-width: 420px;
  white-space: normal;
}

/*
 * Layout A's member-name header — rotated sideways (PLAN_STAGE_5_LARGE_UNITS.md §1) so the column
 * CAN narrow to roughly one line-height regardless of name length, but doesn't have to: the
 * column's actual rendered width always comes from its BODY cell (the `<td class="oas-worksheet-
 * cell">` below, whose width is now set PER PAGE via an inline style — computeColumnsLayoutMetrics
 * in worksheetPrintPageSize.ts), since a `<th>`/`<td>` sharing a column always render at the WIDER
 * of the two. This header's own 28px is only ever the floor a tight/split page settles at —
 * rotating the header text does not by itself buy more columns, only a taller/narrower header (see
 * worksheetPrintPageSize.ts's maxFittingMemberColumns comment for why).
 */
.oas-worksheet-page thead th.oas-worksheet-member-header {
  width: 28px;
  min-width: 28px;
  max-width: 28px;
  height: 140px;
  padding: 6px 2px;
  /* A bare <th> is bold by the browser's own UA stylesheet — this holds an actual member name
     (unlike the other header cells above, which are page/group titles), so it's stated normal
     explicitly rather than left to inherit that default. */
  font-weight: normal;
}

/*
 * Patrol span row sits above the member-header row (both sticky, both need to clear each other —
 * see IStatementHeatMap.vue's equivalent top-offset comment for the same reasoning), tinted per
 * DESIGN.md's group-header-row convention (muted background + semibold label, not a heavier
 * border — see PresentAwardsTableVue.vue's .present-awards-group-header).
 */
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

/*
 * The frozen first two columns (group band + statement text) — sticky on the left so they stay
 * visible while scrolling past many member columns. Opaque background stated explicitly per
 * DESIGN.md, since a sticky cell without one is transparent and scrolled content shows through it.
 *
 * Group-band width is 70px here (on screen) — NOT the 28px rotated-column width printing uses
 * (see the `.oas-worksheet-group-band .oas-worksheet-rotated-text` rule above, which un-rotates
 * this text for the GUI specifically and needs real horizontal room for "Review"/"Verify"). The
 * sticky statement column's `left` is set to match this same 70px, so the two stay in lockstep —
 * if this width changes, update that offset too.
 */
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

/*
 * A real, enforced `width` is still what prevents this column from being stretched arbitrarily wide
 * by the table-layout algorithm (see .oas-worksheet-page's own comment above) — but the actual VALUE
 * is now set PER PAGE as an inline style (`view.statementWidthPx`, template above), not a single
 * fixed number here, since the whole point of the adaptive-width change is that this column's width
 * varies with how many members are on the page (computeColumnsLayoutMetrics in
 * worksheetPrintPageSize.ts — relaxed/wide when a page doesn't need to split, squeezed to the
 * ~50-char wrap width once it does). The 350px here is only a FALLBACK for the rare case something
 * renders this cell without going through columnsLayoutPages (inline styles always win over this
 * rule regardless of selector specificity, so this never fights the real per-page value).
 * `left: 70px` matches the group-band column's own fixed width above (that one doesn't vary by page).
 */
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

/*
 * `min-width: 70px` is the floor a member column can never shrink below (date text/tick-box need
 * this much room) — the actual width is now set PER PAGE as an inline style
 * (`view.memberColumnWidthPx`, template above) by computeColumnsLayoutMetrics, so a page with few
 * members gets columns wider than this floor, filling whatever width is actually available, instead
 * of always sitting at the bare minimum.
 */
.oas-worksheet-page td.oas-worksheet-cell {
  min-width: 70px;
  text-align: center;
  vertical-align: middle;
  padding: 4px;
  border-bottom: 1px solid var(--summit-color-border-subtle);
}

/*
 * Column-group boundaries — a border around each group's own block of columns. Layout A applies
 * this via patrolBorderClassesForPage() (see the .ts) per PATROL group, to the first/last column of
 * every patrol group's member-header/body cells and its own patrol-span header cell. Layout B
 * reuses the same two classes via groupBorderClassesForPage() per PLAN/DO/REVIEW/VERIFY group —
 * both the group-span header `<th>` AND, "all the way down" (requested live), every body `<td>` in
 * that group's I-Statement columns, the column-axis mirror of Layout A's own per-member treatment.
 *
 * Replaces an earlier alternating background-tint approach, dropped after live feedback: tinting
 * every cell in a patrol's columns made an identical (unanswered) cell look like a different
 * colour depending which patrol it was in, which reads as meaningful when it isn't — the cell's
 * OWN state (empty/answered/awarded) is the only thing its background should ever signal. A
 * border marks the boundary between patrols without touching any cell's own colour.
 *
 * Matches the sticky group-band/statement column dividers exactly — same
 * --summit-color-border-default token, same 2px weight — rather than introducing a second,
 * visually competing "stronger" border colour. An earlier attempt used 3px of
 * --color-medium-charcoal specifically to stand out more, which live feedback called too thick
 * and intrusive; this is the toned-down version, consistent with the table's existing borders.
 */
.oas-worksheet-patrol-group-start {
  border-left: 2px solid var(--summit-color-border-default);
}

.oas-worksheet-patrol-group-end {
  border-right: 2px solid var(--summit-color-border-default);
}

/*
 * Three cell states, per PLAN.md decisions 2/3 — see worksheetCellClass() in the .ts.
 * --summit-color-status-awarded is the dark primary green, so the date text needs the matching
 * on-primary colour or it's unreadable grey-on-green. Print has its own light-green rule
 * (printWorksheets.ts) with dark text, so this is screen-only.
 */
.oas-worksheet-cell-awarded {
  background: var(--summit-color-status-awarded);
  color: var(--summit-color-text-on-primary, #ffffff);
}

/*
 * Not part of the template version this member started the stage on — no tick box, muted so it
 * reads as "nothing to do here" (PLAN_TEMPLATE_VERSIONS.md decision 6). Print has its own copy.
 */
.oas-worksheet-cell-na {
  background: var(--summit-color-bg-muted);
}

.oas-worksheet-cell-na-label {
  font-size: 11px;
  color: var(--color-neutral-charcoal, #748494);
}

/* `white-space: nowrap` added live — a date like "03/02/24" could otherwise wrap once its 70px-min-width cell is squeezed (routine once many member columns are packed onto one sheet). */
.oas-worksheet-cell-date {
  font-size: var(--oas-vue-font-size-body);
  white-space: nowrap;
}

/*
 * The empty box a leader ticks by hand — must be visible on its own, not just rely on the cell's
 * own border, which is the whole point of the page (PLAN.md decision 2).
 */
.oas-worksheet-tick-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid var(--color-light-mid-charcoal, #b7c2cc);
  border-radius: 2px;
}

/*
 * Layout B ("members as rows") — its own header/row treatment. The member-name column is fixed
 * width and NOT rotated (names read fine horizontally as rows — PLAN_STAGE_5_LARGE_UNITS.md §1) and
 * never wraps (requested live — a long name wrapping onto two lines made rows uneven and harder to
 * scan); I-Statement columns are a FIXED width (worksheetPrintPageSize.ts's
 * TRANSPOSED_COLUMN_WIDTH_SCREEN_PX/_PRINT_PX) with rotated header text that WRAPS at a constant,
 * never-shrinking font size — replacing the earlier font-shrinking approach (fitRotatedHeaderFont.ts)
 * now unused by this layout; a page with too many I-Statement columns to fit wrapped splits onto an
 * extra sheet instead (rowsLayoutPages in the .ts).
 */
/*
 * Width is MEASURED per page and set inline (view.memberNameColumnWidthPx, in the template) — the
 * longest member name on the page, in full (requested live: never wrap, truncate, or ellipsise a
 * name) — see memberNameColumnWidthPx in worksheetPrintPageSize.ts. No max-width here any more: an
 * unexpectedly long name must still show in full rather than being clipped by a stale fixed cap.
 * The 140px min-width is only a FALLBACK for a cell that somehow didn't get an inline width.
 */
.oas-worksheet-layout-rows thead th.oas-worksheet-member-name-header {
  text-align: left;
  min-width: 140px;
  padding: 6px 8px;
  font-weight: var(--summit-font-weight-semibold);
}

/*
 * The page TITLE lives on the group-span row's own member-name-header cell (see
 * splitRowsTableColumnsForPrint's own comment on where the title text actually sits) — it must keep
 * wrapping (a long title like "Stage 1 - Bushcraft (statements 1-10 of 20)" needs to), unlike the
 * statement-header row's OWN member-name-header cell below it, which only ever holds the fixed, short
 * word "Member" and should never wrap onto two lines.
 */
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

/*
 * Rotating text 90° (`writing-mode: vertical-rl`, see .oas-worksheet-rotated-text) swaps which box
 * dimension is "the wrap length" vs "the dimension that grows as more lines wrap": characters flow
 * top-to-bottom along the element's HEIGHT, and wrapping to a new line extends sideways (WIDTH) — the
 * opposite of normal horizontal text. An earlier version of this rule had the two axes backwards
 * (height was the ~220px budget, width the ~350px one), which wrapped I-Statement text at ~30
 * characters instead of the requested ~50 and made the header font look smaller/more cramped than
 * Layout A's own rotated headers even though both share the same font-size.
 *
 * height: the ~50-char wrap LENGTH (TRANSPOSED_COLUMN_WRAP_WIDTH_SCREEN_PX in worksheetPrintPageSize.ts).
 * width: up to TRANSPOSED_COLUMN_MAX_WRAP_LINES lines' worth of width (TRANSPOSED_COLUMN_WIDTH_SCREEN_PX) —
 * also set inline per batch (view.columnWidthPx in the template) since it's the value
 * maxFittingTransposedColumns' own splitting decision depends on; this rule is a fallback only.
 *
 * `text-align: left` (requested live, replacing the browser's default centered `<th>` text) — in
 * this rotated frame, "left" reads as hugging the near edge of the column rather than the text
 * floating centered across the column's multi-line width; paired with `vertical-align: bottom` so
 * the rotated text's own start-of-flow edge sits at the bottom of the header.
 */
.oas-worksheet-layout-rows thead th.oas-worksheet-statement-header {
  height: 350px;
  padding: 4px 2px;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
}

/*
 * Wraps (requested live — fixed font, never shrinking, wrapping instead) rather than staying on one
 * line like Layout A's own rotated headers (short, fixed single words/names, never meant to wrap) —
 * scoped to this layout's own header class so the shared .oas-worksheet-rotated-text rule's
 * `white-space: nowrap` (still correct for Layout A) is untouched. `word-break: break-word` only
 * engages for a single word that alone exceeds the column's width (normal word-wrap still applies
 * first) — without it, one long word could force the column wider than its fixed, inline-styled
 * width, the same "unconstrained cell stretches the table" mechanism as the empty-gap bug fixed
 * earlier on Layout A.
 */
.oas-worksheet-layout-rows thead th.oas-worksheet-statement-header .oas-worksheet-rotated-text {
  white-space: normal;
  word-break: break-word;
}

/*
 * Layout B's patrol grouping is a labelled divider ROW (members are rows in this layout, same
 * convention the heat map itself uses), not Layout A's column-spanning header — see
 * patrolDividerBeforeRow()'s comment in the .ts.
 */
.oas-worksheet-patrol-divider-row td {
  position: sticky;
  left: 0;
  background: var(--summit-color-bg-muted);
  font-weight: var(--summit-font-weight-semibold);
  padding: 4px 8px;
  text-align: left;
}
</style>
