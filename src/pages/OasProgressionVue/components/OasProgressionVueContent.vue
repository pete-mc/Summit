<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn text class="oas-vue-terrain-btn-minor" @click="onPdfExportClick">PDF Export</v-btn>
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
 * Replicates Terrain's own .medium/.minor button look (confirmed live via DevTools: every
 * .minor/.medium rule in Terrain's stylesheet is scoped with a Vue SFC data-v-* attribute
 * specific to Terrain's own component, so those class names alone do nothing on an element
 * outside that component — a plain <button class="minor medium"> test came back fully
 * unstyled). Terrain's --color-white/--color-base-blue CSS custom properties ARE set globally
 * (confirmed via getComputedStyle(document.documentElement)), so those are reused directly
 * rather than hardcoding Terrain's hex values, keeping this in sync if Terrain's theme changes.
 */
.oas-vue-terrain-btn-minor.v-btn {
  background-color: var(--color-white, #fff);
  border: 1px solid var(--color-base-blue, #1070ca);
  color: var(--color-base-blue, #1070ca);
  font-size: 14px;
  font-weight: 600;
  height: 35px;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  box-shadow: none;
}

.oas-vue-terrain-btn-minor.v-btn:hover {
  background-color: var(--color-white, #fff);
}
</style>
