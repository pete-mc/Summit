<template>
  <v-app>
    <div class="oas-vue-content oas-progression-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadingStreams.size > 0">Loading skills {{ streamsDone }}/{{ totalStreams }}...</span>
        <v-spacer></v-spacer>
        <!-- Exports need something to act on; hidden until a stream lands. -->
        <template v-if="hasContent">
          <v-btn v-if="filters.viewMode === 'heatmap'" outlined color="primary" class="oas-vue-pill-btn" @click="onPdfExportClick">PDF Export</v-btn>
          <template v-else-if="filters.viewMode === 'table'">
            <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onTableExcelExportClick">Excel Export</v-btn>
            <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onTablePdfExportClick">PDF Export</v-btn>
          </template>
          <v-btn v-else-if="filters.viewMode === 'worksheets'" outlined color="primary" class="oas-vue-pill-btn" @click="onWorksheetPrintClick">Print</v-btn>
        </template>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadAllClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!--
        Terrain's own tab control (see .claude/OASWorksheets/PLAN_STAGE_2.md) — a plain Vuetify
        v-tabs, matching the classes/props read off Terrain's live Programming page tab strip.
        Bound to filters.viewMode by explicit string :value/@change rather than v-model, which
        would model a numeric index and create a second source of truth for the same thing (see
        PLAN_STAGE_2.md §3). A full-width row of its own, below the export/refresh row — not
        another item inside .oas-progression-view-row, which is right-aligned.

        IMPORTANT: v-tab's own identity prop is `tab-value`, NOT `value` — `value` on v-tab is a
        read-only COMPUTED (falls back to `to`/`href`, else undefined) with no corresponding prop,
        so a plain `value="heatmap"` attribute is silently dropped and every tab's effective
        identity becomes its index instead. That made every tab compare against filters.viewMode's
        string and never match, so Vuetify's "mandatory" selection logic always fell back to the
        same tab regardless of which one was clicked. See VTab.js's `value` computed and
        VItemGroup.js's `getValue()` (`item.value === undefined ? i : item.value`) for why.
      -->
      <v-tabs v-if="hasContent" :value="filters.viewMode" grow height="40" color="primary" background-color="grey lighten-5" @change="onViewModeTabChange">
        <v-tab tab-value="heatmap">Heatmap</v-tab>
        <v-tab tab-value="table">Table</v-tab>
        <!-- Labelled "Worksheets", not "OAS Worksheets" — the page itself is already titled OAS
             Progression, so the prefix would be redundant here (DEV_NOTES). -->
        <v-tab tab-value="worksheets">Worksheets</v-tab>
      </v-tabs>

      <!--
        Unlike the other two pages this bar sits ALONGSIDE the content rather than replacing it:
        the nine skills arrive one at a time and each renders as it lands. See `hasContent` in
        the .ts for why hiding the body here would be a regression.
      -->
      <SummitLoadingState
        :state="sharedLoadState"
        :done="streamsDone"
        :total="totalStreams"
        error-message="Could not load OAS progression data."
        :on-retry="onReloadAllClick"
      />

      <div v-if="exportFeedback" role="status" class="data-grid-export-feedback">{{ exportFeedback }}</div>

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

      <OASProgressionTableVue v-if="hasContent && filters.viewMode === 'table'" :items="items" :column-filters.sync="tableColumnFilters" />

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

/*
 * Vuetify's v-tab defaults to uppercase + letter-spaced labels; Terrain's own Programming page
 * tab strip (the reference this control is copied from — see .claude/OASWorksheets/
 * PLAN_STAGE_2.md §1) shows sentence-case labels ("Upcoming activities", not "UPCOMING
 * ACTIVITIES") in the captured markup. ::v-deep is required since .v-tab is Vuetify-internal
 * render output this template doesn't write directly.
 *
 * NOT YET VERIFIED LIVE — the capture confirms the rendered text case but not whether that is
 * Vuetify's own default being overridden by Terrain's page CSS (in which case this is redundant,
 * since Terrain's CSS already wins here the same way) or something this override is actually
 * needed for. Confirm against the live Programming page in DevTools per PLAN_STAGE_2.md's
 * verification section, and delete this comment once checked either way.
 */
.oas-vue-content ::v-deep .v-tab {
  text-transform: none;
  letter-spacing: normal;
}
</style>
