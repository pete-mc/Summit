<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onPdfExportClick">PDF Export</v-btn>
      </div>

      <div v-if="pdfExportFeedback" role="status" class="data-grid-export-feedback">{{ pdfExportFeedback }}</div>

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
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressionVueContent.ts">
</script>

<style scoped>
.oas-vue-content {
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
