<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <fieldset class="oas-heatmap-display-group">
        <legend class="oas-heatmap-filter-label oas-vue-filter-heading-match">Display</legend>
        <v-checkbox :input-value="filters.groupByMember" label="Group by member" dense hide-details @change="patch({ groupByMember: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.showPreviouslyPresented" label="Show previously presented" dense hide-details @change="patch({ showPreviouslyPresented: $event })"></v-checkbox>
        <!-- Inside the fieldset: after it, the button wrapped onto its own line. -->
        <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts" src="./PresentAwardsFiltersVue.ts">
</script>

<style scoped>
/* Page-specific: a single checkbox group doesn't need the shared bordered card. */
.oas-heatmap-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 20px;
  row-gap: 8px;
}

.oas-heatmap-display-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 20px;
  row-gap: 4px;
  border: none;
  padding: 0;
  margin: 0;
}

.oas-heatmap-display-group ::v-deep .v-input--checkbox {
  margin-top: 0;
  padding-top: 0;
  flex: 0 0 auto;
}

/* Gotcha: Terrain's checkbox rule ties on specificity, so !important is needed. */
.oas-heatmap-display-group ::v-deep .v-input--selection-controls__input {
  margin-right: 12px !important;
}

.oas-heatmap-display-group ::v-deep .v-label {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/* Gotcha: Terrain's label blue is --color-scouts-medium-blue (#00348d), not the button blue (#1070ca). */
.oas-vue-filter-heading-match {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
  padding: 0;
  border: 0;
}

/* Gotcha: the UA rule and index.css's `width: 100%` beat `display: inline` without !important. */
.oas-heatmap-display-group legend.oas-vue-filter-heading-match {
  display: inline-block !important;
  width: auto !important;
}
</style>
