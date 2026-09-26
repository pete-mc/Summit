<template>
  <v-app>
    <div class="oas-vue-content present-awards-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadState === 'loading'">Loading awards...</span>
        <span v-else-if="loadState === 'error'">Could not load awards. Try reloading the page.</span>
        <v-spacer></v-spacer>
        <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onExcelExportClick">Excel Export</v-btn>
        <v-btn outlined color="primary" class="oas-vue-pill-btn" @click="onPdfExportClick">PDF Export</v-btn>
        <v-btn depressed class="oas-vue-pill-btn present-awards-save-btn" :loading="isSaving" :disabled="isSaving" @click="onSaveClick">Save Changes</v-btn>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <PresentAwardsFiltersVue :filters="displayFilters" @update:filters="onDisplayFiltersUpdate" />

      <div v-if="feedback" role="status" class="data-grid-export-feedback">{{ feedback }}</div>

      <PresentAwardsTableVue
        :items="visibleItems"
        :selected-ids="selectedIds"
        :presented-dates="presentedDates"
        :column-filters="columnFilters"
        :group-by-member="groupByMember"
        @toggle-present="onTogglePresent"
        @update-date="onUpdateDate"
        @update:columnFilters="onColumnFiltersUpdate"
      />
    </div>
  </v-app>
</template>

<script lang="ts" src="./PresentAwardsVueContent.ts">
</script>

<style scoped>
/*
 * Single type scale for the whole PresentAwardsVue page. Deliberately the SAME three
 * --oas-vue-* properties OasProgressionVueContent.vue declares, redeclared here rather than
 * given a page-specific --present-awards-* name: the pages are visual siblings, and per
 * .claude/DESIGN.md a parallel scale would reintroduce exactly the drift this scale exists to
 * prevent. src/pages/IStatements/ sets the same precedent. Custom properties inherit through the
 * DOM regardless of Vue's scoped-CSS boundaries, so every child component can reference these.
 */
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

/*
 * Matches Terrain's own bordered "pill" button look — confirmed live via DevTools Computed panel:
 * font-size 14px, font-weight 600, height 35px, min-width 80px, padding 0 18px,
 * border-radius 25px. `outlined color="primary"` already supplies the 1px border + blue
 * text/border from our Vuetify theme (see src/vuetifySetup.ts); this overrides only the
 * sizing/shape Vuetify's outlined variant doesn't match by default.
 */
/*
 * Let the action buttons wrap rather than overflow on a narrow window, and separate them from the
 * Display filter box below — without the bottom margin the export buttons sit directly on the
 * filter panel's top edge.
 */
.oas-progression-view-row {
  flex-wrap: wrap;
  gap: var(--summit-space-sm, 8px);
  margin-bottom: var(--summit-space-lg, 16px);
}

/*
 * Save is the page's one committing action, so it gets a filled button rather than an outlined
 * one — matching the Summit Calendar editor's own primary save button
 * (.summit-button-primary, which fills with --summit-color-bg-primary). Vuetify's `color` prop
 * would pull from the theme instead, which is Terrain's blue, so the fill is set here against
 * Summit's own brand token.
 */
.present-awards-save-btn.v-btn {
  background-color: var(--summit-color-bg-primary, #004c00) !important;
  color: var(--summit-color-text-on-primary, #ffffff) !important;
}

.present-awards-save-btn.v-btn:hover {
  background-color: var(--summit-color-bg-primary-hover, #006600) !important;
}

/* Vuetify dims a disabled button's own background; keep the brand fill visible while saving. */
.present-awards-save-btn.v-btn--disabled {
  opacity: 0.6;
}

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
