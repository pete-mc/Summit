<template>
  <v-app>
    <div class="oas-vue-content oas-progress-panel">
      <div class="oas-progress-view-row">
        <span v-if="loadingStreams.size > 0">Loading skills {{ streamsDone }}/{{ totalStreams }}...</span>
        <v-spacer></v-spacer>
        <template v-if="hasContent">
          <template v-if="filters.viewMode === 'summary'">
            <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onSummaryExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="overall-progress" :target="overallProgressPrintTarget" :meta="summaryPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'peakAward'">
            <SummitPillButton v-if="peakAwardRequirement" :loading="isExcelExporting" :disabled="isExcelExporting" @click="onPeakAwardExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton v-if="peakAwardRequirement" profile="peak-award-summary" :target="peakAwardPrintTarget" :meta="peakAwardPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'heatmap'">
            <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onHeatmapExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="skill-heatmap" :target="heatMapPrintTarget" :meta="heatmapPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'nextSteps'">
            <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onNextStepsExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="oas-next-steps" :target="nextStepsPrintTarget" :meta="nextStepsPrintMeta" />
          </template>
          <template v-else-if="filters.viewMode === 'stageGrid'">
            <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onStageGridExcelExportClick">Excel Export</SummitPillButton>
            <SummitPrintButton profile="oas-stage-grid" :targets="stageGridPrintTargets" :meta="stageGridPrintMeta" />
          </template>
        </template>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!-- Gotcha: v-tab's identity prop is `tab-value`, NOT `value`. `value` is silently dropped and every tab falls back to its index. -->
      <v-tabs v-if="hasContent" :value="filters.viewMode" grow height="40" color="primary" background-color="grey lighten-5" @change="onViewModeTabChange">
        <v-tab tab-value="about" class="oas-about-tab"><v-icon small class="oas-about-tab-icon">mdi-information-outline</v-icon>About</v-tab>
        <v-tab tab-value="summary">Summary</v-tab>
        <v-tab tab-value="peakAward">Peak Award</v-tab>
        <v-tab tab-value="heatmap">Heatmap</v-tab>
        <v-tab tab-value="nextSteps">Next Steps</v-tab>
        <v-tab tab-value="stageGrid">Stage Grid</v-tab>
      </v-tabs>

      <div v-if="hasContent && jumpOrigin" class="oas-tab-jump-bar">
        <v-btn text small color="primary" class="oas-tab-jump-back" @click="onJumpBack"><v-icon small left>mdi-arrow-left</v-icon>Back to {{ jumpOrigin.tabName }}</v-btn>
        <span class="oas-tab-jump-detail">Opened from {{ jumpOrigin.tabName }}: {{ jumpOrigin.detail }}</span>
        <v-spacer></v-spacer>
        <v-btn icon x-small title="Close" @click="onJumpBarClose"><v-icon small>mdi-close</v-icon></v-btn>
      </div>

      <SummitLoadingState :state="sharedLoadState" :done="streamsDone" :total="totalStreams" error-message="Could not load OAS progress data." :on-retry="onReloadAllClick" />

      <OASAboutTabsVue v-if="hasContent && filters.viewMode === 'about'" @select-tab="onViewModeTabChange" />

      <template v-if="hasContent && filters.viewMode === 'summary'">
        <OASSummaryTabFiltersVue
          :member-filter.sync="filters.summaryMemberFilter"
          :selected-patrols.sync="filters.summarySelectedPatrols"
          :sort-by="filters.summarySortBy"
          :sort-options="summarySortOptions"
          :name-format.sync="filters.summaryNameFormat"
          :break-by-patrol.sync="filters.summaryBreakByPatrol"
          :expand-streams.sync="filters.summaryExpandStreams"
          :show-not-started-skills.sync="filters.summaryShowNotStartedSkills"
          :available-patrols="availablePatrols"
          :patrol-filter-options="patrolFilterOptions"
          :can-filter-by-patrol="canFilterByPatrol"
          @update:sortBy="onSummarySortByUpdate"
          @sort-reselected="clearSummaryColumnSort"
          @reset="onResetFilters"
        />
        <OASOverallProgressVue
          ref="overallProgress"
          :columns="overallProgressView.columns"
          :rows="overallProgressView.rows"
          :break-by-patrol="filters.summaryBreakByPatrol"
          :column-sort="summaryColumnSort"
          :cell-jumps="summaryCellJumps"
          :column-jumps="summaryColumnMenus"
          :member-jumps="summaryMemberMenus"
          @sort-column="onOverallProgressSortColumn"
          @jump="onTabJump"
        />
      </template>

      <template v-if="hasContent && filters.viewMode === 'peakAward'">
        <p v-if="!peakAwardRequirement" class="oas-peak-award-summary-no-section">Could not determine this unit's section.</p>
        <template v-else>
          <OASSummaryTabFiltersVue
            :member-filter.sync="filters.peakAwardMemberFilter"
            :selected-patrols.sync="filters.peakAwardSelectedPatrols"
            :sort-by.sync="filters.peakAwardSortBy"
            :sort-options="peakAwardSortOptions"
            :name-format.sync="filters.peakAwardNameFormat"
            :break-by-patrol.sync="filters.peakAwardBreakByPatrol"
            :available-patrols="availablePatrols"
            :patrol-filter-options="patrolFilterOptions"
            :can-filter-by-patrol="canFilterByPatrol"
            @reset="onResetFilters"
          />
          <OASPeakAwardSummaryVue
            ref="peakAward"
            :rows="filteredPeakAwardSummaryRows"
            :name-format="filters.peakAwardNameFormat"
            :break-by-patrol="filters.peakAwardBreakByPatrol"
            :has-special="!!peakAwardRequirement.special"
            :special-condition-text="specialConditionText"
            :core-skill-jumps="peakAwardCoreSkillJumps"
            :core-skill-header-jumps="peakAwardCoreSkillMenus"
            :core-skills-group-jumps="peakAwardCoreSkillsGroupMenu"
            :member-jumps="peakAwardMemberMenus"
            @jump="onTabJump"
          />
        </template>
      </template>

      <template v-if="hasContent && filters.viewMode === 'heatmap'">
        <OASProgressFiltersVue :filters="filters" :available-patrols="availablePatrols" :patrol-filter-options="patrolFilterOptions" :can-filter-by-patrol="canFilterByPatrol" @update:filters="onFiltersUpdate" @reset="onResetFilters" />

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
          :show-approved="filters.showApproved"
          :show-not-started="filters.showNotStarted"
          :show-answered="filters.showAnswered"
          :group-by="filters.groupBy"
          :can-open-peak-award="!!peakAwardRequirement"
          @jump="onTabJump"
        />
      </template>

      <template v-if="hasContent && filters.viewMode === 'nextSteps'">
        <OASNextStepsFiltersVue
          :member-id="resolvedNextStepsMemberId"
          :member-options="nextStepsMemberOptions"
          :skill-stream="resolvedNextStepsSkillStream"
          :skill-stream-options="nextStepsSkillStreamOptions"
          :stage="resolvedNextStepsStage"
          :stage-options="nextStepsStageOptions"
          @update:memberId="onNextStepsMemberUpdate"
          @update:skillStream="onNextStepsSkillStreamUpdate"
          @update:stage="onNextStepsStageUpdate"
          @reset="onResetFilters"
        />
        <p v-if="nextStepsRows.length === 0" class="oas-next-steps-nothing-outstanding">Every stage has been approved.</p>
        <OASNextStepsVue v-else ref="nextSteps" :rows="nextStepsRows" />
      </template>

      <template v-if="hasContent && filters.viewMode === 'stageGrid'">
        <OASStageGridFiltersVue
          :filters="filters"
          :skill-streams="stageGridSkillStreams"
          :skill-stream="resolvedStageGridSkillStream"
          :stage="resolvedStageGridStage"
          :stage-options="stageGridStageOptions"
          :available-patrols="availablePatrols"
          :patrol-filter-options="patrolFilterOptions"
          :can-filter-by-patrol="canFilterByPatrol"
          @update:filters="onFiltersUpdate"
          @reset="onResetFilters"
        />

        <OASStageGridVue
          ref="stageGrid"
          :items="items"
          :filters="filters"
          :skill-stream="resolvedStageGridSkillStream"
          :stage="resolvedStageGridStage"
          :available-patrols="availablePatrols"
          :can-open-peak-award="!!peakAwardRequirement"
          @jump="onTabJump"
        />
      </template>
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressVueContent.ts"></script>

<style scoped>
.oas-heatmap-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  width: 100%;
}

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

/* Constrain heatmap scroll container to viewport height and width minus top elements */
.oas-vue-content ::v-deep .oas-heatmap-scroll {
  max-height: calc(100vh - 320px);
  max-width: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  scrollbar-width: auto;
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}

/* Vertical scrollbar styling */
.oas-vue-content ::v-deep .oas-heatmap-scroll::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.oas-vue-content ::v-deep .oas-heatmap-scroll::-webkit-scrollbar-track {
  background: var(--color-light-charcoal, #e5e9ec);
}

.oas-vue-content ::v-deep .oas-heatmap-scroll::-webkit-scrollbar-thumb {
  background: var(--color-neutral-charcoal, #748494);
  border-radius: 6px;
}

.oas-vue-content ::v-deep .oas-heatmap-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-scouts-medium-blue, #00348d);
}

.oas-vue-content ::v-deep .oas-heatmap-scroll::-webkit-scrollbar-corner {
  background: var(--color-light-charcoal, #e5e9ec);
}

/* Gotcha: the tabs use grow, which stretches every tab equally; this one keeps its content width. */
.oas-vue-content ::v-deep .v-tab.oas-about-tab {
  flex: 0 0 auto;
  min-width: 0;
  padding: 0 12px;
}

.oas-about-tab-icon {
  margin-right: 4px;
  color: inherit !important;
}

.oas-tab-jump-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px;
  margin-top: 4px;
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
  background: var(--color-white, #fff);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-tab-jump-back {
  text-transform: none;
  letter-spacing: normal;
}

.oas-tab-jump-detail {
  color: var(--color-neutral-charcoal, #748494);
}

.oas-peak-award-summary-no-section,
.oas-next-steps-nothing-outstanding {
  color: var(--summit-color-text-primary, #2a2a2a);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}
</style>
