<template>
  <div class="oas-heatmap-scroll">
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
            <th class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom oas-peak-award-summary-th-rowspan" rowspan="2" colspan="2">Progress</th>
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
            <td class="oas-heatmap-highest-stage">{{ row.progressPercentText }}</td>
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

/* Border on both table and wrapper: a leftover from the old PDF export. Removing it is a visual change to check live. */
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

/* Keeps the trailing "X of Y" text on the same line as the boxes. */
.oas-peak-award-summary-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.oas-peak-award-summary-text {
  margin-left: var(--summit-space-sm, 8px);
  font-size: var(--oas-vue-font-size-body);
  color: var(--summit-color-text-primary, #2a2a2a);
}

/* Only one strong border, at the bottom of the whole two-row header. Row 1 cells get a lighter one. */
/* Gotcha: Vuetify's thead border outranks a plain scoped class, so ::v-deep is needed. */
.oas-heatmap-data-table ::v-deep thead .oas-peak-award-summary-th-top {
  border-bottom: 1px solid var(--summit-color-border-subtle, #e5e9ec) !important;
}

.oas-heatmap-data-table ::v-deep thead .oas-peak-award-summary-th-bottom {
  border-bottom: 2px solid var(--summit-color-border-default, #d3d9de) !important;
}

.oas-peak-award-summary-th-rowspan {
  vertical-align: middle;
}

/* Cancels the shared header's padding-left so a 3-column label centres. */
.oas-peak-award-summary-core-skills-header {
  text-align: center;
  border-left: 1px solid var(--summit-color-border-subtle);
  border-right: 1px solid var(--summit-color-border-subtle);
}

/* Sized to exactly the boxes it replaces (barWidthPx), not the heat map's 40px min-width, so columns line up. */
.oas-peak-award-summary-bar {
  min-width: 0;
  flex: none;
}
</style>
