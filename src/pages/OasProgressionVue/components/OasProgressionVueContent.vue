<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
        <v-btn text color="primary" @click="onPdfExportClick">PDF Export</v-btn>
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
</style>
