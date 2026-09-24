<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>
        <v-spacer></v-spacer>
        <v-btn v-if="filters.viewMode === 'heatmap'" outlined color="primary" class="oas-vue-pill-btn" @click="onPdfExportClick">PDF Export</v-btn>
        <template v-else>
          <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onTableExcelExportClick">Excel Export</v-btn>
          <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onTablePdfExportClick">PDF Export</v-btn>
        </template>
        <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onToggleViewModeClick">{{ filters.viewMode === "heatmap" ? "Show Table" : "Show Heatmap" }}</v-btn>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <div v-if="exportFeedback" role="status" class="data-grid-export-feedback">{{ exportFeedback }}</div>

      <template v-if="filters.viewMode === 'heatmap'">
        <OASProgressionFiltersVue
          :filters="filters"
          :available-patrols="availablePatrols"
          :has-any-empty-sections="hasAnyEmptySections"
          @update:filters="onFiltersUpdate"
          @reset="onResetFilters"
        />

        <OASHeatMapVue
          ref="heatMap"
          :items="items"
          :trunk-stage-counts="trunkStageCounts"
          :members="members"
          :visible-streams="filters.visibleStreams"
          :stage-range="filters.stageRange"
          :sort-by="filters.sortBy"
          :show-empty-sections="!filters.hideEmptyStreams"
          :member-filter="filters.memberFilter"
          :hide-last-name="filters.hideLastName"
          :use-codenames="filters.useCodenames"
          :selected-patrols="filters.selectedPatrols"
          :break-by-patrol="filters.breakByPatrol"
          :hide-empty-top-columns="filters.hideEmptyTopColumns"
          :only-in-progress="filters.onlyInProgress"
        />
      </template>

      <OASProgressionTableVue v-else :items="items" :column-filters.sync="tableColumnFilters" />
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressionVueContent.ts">
</script>

<style scoped>
/*
 * Single type scale for the whole OasProgressionVue page (this component plus
 * OASProgressionFiltersVue, OASProgressionTableVue, OASHeatMapVue) — CSS custom properties
 * inherit down through the DOM regardless of Vue's scoped-CSS/child-component boundaries, so
 * every descendant can reference these instead of each file hardcoding its own copy of "18px" or
 * "NunitoSans-regular, arial, sans-serif". Previously every heading/body font-size and font-family
 * across the three files was set independently by reading one live DevTools value at a time for
 * one specific element, with no shared source of truth tying them together — which is how a
 * <legend> and a <label> both ended up at "the same" font-size on paper while looking completely
 * different in practice (a layout bug, not a size bug, but only found because there was no single
 * place to check "should these even match"). Two tiers only, matching what's actually needed:
 *   heading — filter-row labels (Member/Skills/Patrol/Stage/Sort by/Display)
 *   body    — table cells (both views) and filter/select input text
 */
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

/*
 * Matches Terrain's own bordered "pill" button look (e.g. Approvals page's "View printable
 * version" button, a real .minor.medium button) — confirmed live via DevTools Computed panel:
 * font-size 14px, font-weight 600, height 35px, min-width 80px, padding 0 18px,
 * border-radius 25px. `outlined color="primary"` already gets the 1px border + blue
 * text/border from our Vuetify theme (see src/vuetifySetup.ts) — this overrides only the
 * sizing/shape Vuetify's own outlined variant doesn't match by default.
 */
.oas-vue-pill-btn.v-btn {
  font-size: 14px;
  font-weight: 600;
  height: 35px !important;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  letter-spacing: normal;
}

</style>
