<template>
  <div class="oas-heatmap-scroll">
    <!--
      Same v-data-table shell as OASHeatMapVue (hand-written thead/tbody, Vuetify's own frame
      styling) — see that component's own comment on why the built-in header/sort/filter/pagination
      are disabled here too: this is one continuous grid, not a sortable/paginated grid.
    -->
    <v-data-table
      :headers="dataTableHeaders"
      :items="rowViews"
      :items-per-page="-1"
      disable-sort
      disable-filtering
      disable-pagination
      hide-default-header
      hide-default-footer
      dense
      class="oas-heatmap-data-table"
    >
      <template #header>
        <thead class="oas-peak-award-summary-thead">
          <tr>
            <th class="oas-heatmap-member-header oas-peak-award-summary-th-bottom oas-peak-award-summary-th-rowspan" rowspan="2">Member</th>
            <th class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom oas-peak-award-summary-th-rowspan" rowspan="2">Progress</th>
            <th class="oas-peak-award-summary-core-skills-header oas-peak-award-summary-th-top" colspan="3">Core Skills</th>
            <th class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom oas-peak-award-summary-th-rowspan" rowspan="2">Progressions</th>
            <th v-if="hasSpecial" class="oas-heatmap-stage-group-header oas-peak-award-summary-th-top">Special</th>
          </tr>
          <tr>
            <th v-for="skill in ['Bushcraft', 'Bushwalking', 'Camping']" :key="skill" class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom">{{ skill }}</th>
            <th v-if="hasSpecial" class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom">{{ specialConditionText }}</th>
          </tr>
        </thead>
      </template>

      <template #body>
        <tbody>
          <tr v-for="row in rowViews" :key="row.memberId" :data-oas-member="row.memberId">
            <td class="oas-heatmap-member-name">{{ row.displayName }}</td>
            <td class="oas-heatmap-highest-stage">{{ row.progressText }}</td>
            <td v-for="coreSkill in row.coreSkills" :key="coreSkill.title" class="oas-heatmap-stage-cell">
              <div v-if="coreSkill.kind === 'bar'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete oas-peak-award-summary-bar" :style="{ width: barWidthPx(coreSkill.boxCount) }" :title="coreSkill.barTitle"></div>
              <div v-else class="oas-heatmap-squares">
                <div v-for="(box, index) in coreSkill.boxes" :key="index" :class="['oas-heatmap-square', box.met ? 'oas-heatmap-square-answered' : 'oas-heatmap-square-unanswered']" :title="box.title"></div>
              </div>
            </td>
            <td class="oas-heatmap-stage-cell">
              <div class="oas-peak-award-summary-row">
                <div v-if="row.progressions.kind === 'bar'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete oas-peak-award-summary-bar" :style="{ width: barWidthPx(row.progressions.boxCount) }" :title="row.progressions.barTitle"></div>
                <div v-else class="oas-heatmap-squares">
                  <div v-for="(box, index) in row.progressions.boxes" :key="index" :class="['oas-heatmap-square', box.met ? 'oas-heatmap-square-answered' : 'oas-heatmap-square-unanswered']" :title="box.title"></div>
                </div>
                <span class="oas-peak-award-summary-text">{{ row.progressions.text }}</span>
              </div>
            </td>
            <td v-if="hasSpecial && row.special" class="oas-heatmap-stage-cell">
              <div class="oas-peak-award-summary-row">
                <div v-if="row.special.kind === 'bar'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete oas-peak-award-summary-bar" :style="{ width: barWidthPx(row.special.boxCount) }" :title="row.special.barTitle"></div>
                <div v-else class="oas-heatmap-squares">
                  <div v-for="(box, index) in row.special.boxes" :key="index" :class="['oas-heatmap-square', box.met ? 'oas-heatmap-square-answered' : 'oas-heatmap-square-unanswered']" :title="box.title"></div>
                </div>
                <span class="oas-peak-award-summary-text">{{ row.special.text }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./OASPeakAwardSummaryVue.ts">
</script>

<style scoped>
.oas-heatmap-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/*
 * The border lives on BOTH the table and its wrapper div. It was added for the old snapdom PDF
 * export (removed 2026-10-12, .claude/Print/PLAN_STAGE_5.md), which captured the <table> alone.
 * Kept for the same reason as OASHeatMapVue.vue's copy: removing it is a visual change to judge
 * live, not part of that cleanup. summit-print doesn't need it (it draws its own frame).
 */
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

/*
 * Squares + trailing "X of Y"/"X above Y" text on one row, not stacked — a plain <span> after
 * the flex .oas-heatmap-squares block would otherwise wrap onto its own line the moment the
 * boxes fill the available width, since nothing ties the two together as a single row.
 */
.oas-peak-award-summary-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* "X of Y" / "X above Y" trailing text, beside the boxes — same body scale as the rest of the
   table, so it reads as part of the cell rather than a separate caption. */
.oas-peak-award-summary-text {
  margin-left: var(--summit-space-sm, 8px);
  font-size: var(--oas-vue-font-size-body);
  color: var(--summit-color-text-primary, #2a2a2a);
}

/*
 * The heat map never hand-writes a two-row <thead> (its own stage-group header is a single row),
 * so there is no existing shared rule for a header bottom border or for centering a rowspan'd
 * header against the group row beneath it — added here rather than to the shared heatmap styles,
 * since this table is the only one with a two-row header.
 *
 * Only ONE border is dark/thick: the true bottom edge of the whole header (row 2 — or, for a
 * rowspan="2" cell like Member/Progressions, that same line, since the cell's own bottom edge IS
 * row 2's bottom edge). Row 1's own non-rowspan cells ("Core Skills", "Special") sit ABOVE that
 * line and must not repeat the same dark weight underneath them — a lighter border separates them
 * from row 2 instead, so there is exactly one strong visual "header ends here" line across the
 * whole table.
 */
/*
 * Vuetify's own default (.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child >
 * th { border-bottom: thin solid rgba(0,0,0,0.12) } — vuetify.css) outranks a plain scoped class
 * selector on specificity alone, so both rules below need the same ::v-deep escalation this file
 * already uses elsewhere for Vuetify-internal overrides (see the .v-data-table__wrapper rules
 * above) — without it, Vuetify's own thin border silently wins on BOTH rows, which is exactly why
 * Progressions/Special's own header row never looked bold.
 */
.oas-heatmap-data-table ::v-deep thead .oas-peak-award-summary-th-top {
  border-bottom: 1px solid var(--summit-color-border-subtle, #e5e9ec) !important;
}

.oas-heatmap-data-table ::v-deep thead .oas-peak-award-summary-th-bottom {
  border-bottom: 2px solid var(--summit-color-border-default, #d3d9de) !important;
}

/* Member/Progressions span both header rows — their own text is centered against the full
   two-row height, rather than sitting high against just row 1's shorter box. */
.oas-peak-award-summary-th-rowspan {
  vertical-align: middle;
}

/*
 * "Core Skills" spans all 3 sub-columns (colspan="3") and must read as centered across their
 * whole combined width — .oas-heatmap-stage-group-header's own padding-left: 1em (correct for a
 * single-column header lined up with one set of boxes below it) would otherwise pull a
 * multi-column centered label visibly left of true-center.
 */
.oas-peak-award-summary-core-skills-header {
  text-align: center;
  border-left: 1px solid var(--summit-color-border-subtle);
  border-right: 1px solid var(--summit-color-border-subtle);
}

/*
 * Collapsed "every box met" bar — same green as the heat map's own bar-complete
 * (.oas-heatmap-stage-bar-complete), but sized exactly to the row of boxes it replaces (via
 * barWidthPx) instead of the heat map's own min-width: 40px, which would make a short 1-3 box
 * group's bar wider than its own column of individual boxes and break column alignment across
 * rows.
 */
.oas-peak-award-summary-bar {
  min-width: 0;
  flex: none;
}
</style>
