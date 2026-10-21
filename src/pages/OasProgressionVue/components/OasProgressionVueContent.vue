<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading skills {{ streamsDone }}/{{ totalStreams }}...</span>
        <v-spacer></v-spacer>
        <template v-if="hasContent">
          <template v-if="filters.viewMode === 'summary'">
            <SummitPillButton v-if="peakAwardRequirement" :loading="isExcelExporting" :disabled="isExcelExporting" @click="onSummaryExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="peak-award-summary" :target="summaryPrintTarget" :meta="summaryPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'heatmap'">
            <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onHeatmapExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="skill-heatmap" :target="heatMapPrintTarget" :meta="heatmapPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'table'">
            <SummitPillButton @click="onTableExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="oas-table" :target="tablePrintTarget" :prepare="prepareTablePrint" :meta="tablePrintMeta" />
          </template>
          <SummitPillButton v-else-if="filters.viewMode === 'worksheets'" @click="onWorksheetPrintClick">Print</SummitPillButton>
        </template>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!-- Gotcha: v-tab's identity prop is `tab-value`, NOT `value`. `value` is silently dropped and every tab falls back to its index. -->
      <v-tabs v-if="hasContent" :value="filters.viewMode" grow height="40" color="primary" background-color="grey lighten-5" @change="onViewModeTabChange">
        <v-tab tab-value="summary">Summary</v-tab>
        <v-tab tab-value="heatmap">Heatmap</v-tab>
        <v-tab tab-value="table">Table</v-tab>
        <v-tab tab-value="worksheets">Worksheets</v-tab>
      </v-tabs>

      <SummitLoadingState
        :state="sharedLoadState"
        :done="streamsDone"
        :total="totalStreams"
        error-message="Could not load OAS progression data."
        :on-retry="onReloadAllClick"
      />

      <div v-if="exportFeedback" role="status" class="data-grid-export-feedback">{{ exportFeedback }}</div>

      <template v-if="hasContent && filters.viewMode === 'summary'">
        <p v-if="!peakAwardRequirement" class="oas-peak-award-summary-no-section">Could not determine this unit's section.</p>
        <template v-else>
          <OASPeakAwardSummaryFiltersVue
            :filters="filters"
            :patrol-filter-options="patrolFilterOptions"
            :can-filter-by-patrol="canFilterByPatrol"
            @update:filters="onFiltersUpdate"
            @reset="onResetFilters"
          />

          <OASPeakAwardSummaryVue
            ref="summary"
            :rows="filteredPeakAwardSummaryRows"
            :name-format="filters.summaryNameFormat"
            :has-special="!!peakAwardRequirement.special"
            :special-condition-text="specialConditionText"
          />
        </template>
      </template>

      <template v-if="hasContent && filters.viewMode === 'heatmap'">
        <OASProgressionFiltersVue
          :filters="filters"
          :available-patrols="availablePatrols"
          :patrol-filter-options="patrolFilterOptions"
          :can-filter-by-patrol="canFilterByPatrol"
          @update:filters="onFiltersUpdate"
          @reset="onResetFilters"
        />

        <OASHeatMapVue
          ref="heatMap"
          :items="items"
          :trunk-stage-counts="trunkStageCounts"
          :members="members"
          :visible-streams="filters.visibleStreams"
          :visible-stages="filters.visibleStages"
          :sort-by="filters.sortBy"
          :show-empty-skill-rows="filters.showEmptySkillRows"
          :member-filter="filters.memberFilter"
          :name-format="filters.nameFormat"
          :selected-patrols="filters.selectedPatrols || []"
          :break-by-patrol="filters.breakByPatrol"
          :show-empty-top-stages="filters.showEmptyTopStages"
          :show-awarded="filters.showAwarded"
          :show-not-started="filters.showNotStarted"
          :show-answered="filters.showAnswered"
          :group-by="filters.groupBy"
        />
      </template>

      <OASProgressionTableVue v-if="hasContent && filters.viewMode === 'table'" ref="table" :items="items" :column-filters.sync="tableColumnFilters" />

      <template v-if="hasContent && filters.viewMode === 'worksheets'">
        <OASWorksheetFiltersVue
          :filters="filters"
          :available-patrols="availablePatrols"
          :patrol-filter-options="patrolFilterOptions"
          :can-filter-by-patrol="canFilterByPatrol"
          @update:filters="onFiltersUpdate"
          @reset="onResetFilters"
        />

        <OASWorksheetsVue ref="worksheets" :items="items" :filters="filters" :available-patrols="availablePatrols" />
      </template>
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressionVueContent.ts">
</script>

<style scoped>
/* The page's one type scale. Custom properties inherit through scoped child components, so they all use these. */
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

/* Terrain's tabs use sentence case. Not yet verified live whether this override is needed. */
.oas-vue-content ::v-deep .v-tab {
  text-transform: none;
  letter-spacing: normal;
}

.oas-peak-award-summary-no-section {
  color: var(--summit-color-text-primary, #2a2a2a);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}
</style>
