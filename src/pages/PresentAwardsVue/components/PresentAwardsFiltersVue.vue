<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <fieldset class="oas-heatmap-display-group">
        <legend class="oas-heatmap-filter-label oas-vue-filter-heading-match">Display</legend>
        <v-checkbox :input-value="filters.groupByMember" label="Group by member" dense hide-details @change="patch({ groupByMember: $event })"></v-checkbox>
        <v-checkbox :input-value="filters.showPreviouslyPresented" label="Show previously presented" dense hide-details @change="patch({ showPreviouslyPresented: $event })"></v-checkbox>
        <!--
          Same text button as the OAS Progression filter bars, last in the row like theirs. Resets
          everything on this page — display options AND column filters (user, 2026-10-11); it
          replaced the table's own "Clear filters" link.

          Inside the fieldset rather than after it: placed after it, the button landed on a line
          of its own (seen live 2026-10-11) — most likely the shared `.oas-heatmap-display-group
          legend { width: 100% }` rule (index.css) making the fieldset claim the whole row, though
          not confirmed in DevTools. As the fieldset's last flex item it sits to the right of the
          checkboxes regardless of the cause.
        -->
        <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts" src="./PresentAwardsFiltersVue.ts">
</script>

<style scoped>
/*
 * .oas-vue-filter-panel itself is the shared rule in src/styles/index.css — deliberately not
 * redeclared here.
 *
 * This override IS page-specific and stays: Present Awards has a single checkbox group rather
 * than a full filter row, so the bordered card look the shared rule gives would frame almost
 * nothing.
 */
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
  /* A bare <fieldset> carries the browser's own default border/padding/margin, which renders as a
     stray line around the checkbox row — reset explicitly rather than relying on nothing
     overriding it. */
  border: none;
  padding: 0;
  margin: 0;
}

/* Vuetify's v-checkbox reserves generous default spacing (a 16px top margin plus its own ripple
   padding) meant for a vertical list, not a dense inline row. */
.oas-heatmap-display-group ::v-deep .v-input--checkbox {
  margin-top: 0;
  padding-top: 0;
  flex: 0 0 auto;
}

/*
 * Terrain's own page-level CSS restyles every checkbox and sets margin-right: 24px as part of it
 * (`.v-application.theme--light .v-input--checkbox .v-input--selection-controls__input`). That
 * selector's specificity ties with this one, so cascade order alone doesn't reliably decide the
 * winner — !important guarantees it.
 */
.oas-heatmap-display-group ::v-deep .v-input--selection-controls__input {
  margin-right: 12px !important;
}

/* Checkbox labels sit at body size, matching the table and the column filters. */
.oas-heatmap-display-group ::v-deep .v-label {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/*
 * Same shared heading values every filter label on the OAS page uses, so "Display" reads
 * identically across the two pages. Terrain's floated-label blue is --color-scouts-medium-blue
 * (#00348d), NOT the button blue (#1070ca).
 */
.oas-vue-filter-heading-match {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
  padding: 0;
  border: 0;
}

/*
 * The UA stylesheet sets `legend { display: block }`, and the shared
 * `.oas-heatmap-display-group legend` rule in src/styles/index.css adds `width: 100%` on top.
 * Here the legend sits inline beside the checkboxes, where full width would stretch it into an
 * oversized box that reads as larger text than its actual font-size. `display: inline` alone does
 * not win against those rules — !important is required.
 */
.oas-heatmap-display-group legend.oas-vue-filter-heading-match {
  display: inline-block !important;
  width: auto !important;
}
</style>
