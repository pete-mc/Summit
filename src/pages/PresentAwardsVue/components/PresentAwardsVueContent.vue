<template>
  <v-app>
    <div class="oas-vue-content present-awards-panel">
      <div class="oas-progression-view-row">
        <span v-if="sharedLoadState === 'loading'">Loading awards...</span>
        <v-spacer></v-spacer>
        <template v-if="hasContent">
          <SummitPillButton :loading="isExcelExporting" :disabled="isExcelExporting" @click="onExcelExportClick">Excel Export</SummitPillButton>
          <SummitPrintButton profile="present-awards" :target="presentAwardsPrintTarget" :prepare="preparePresentAwardsPrint" :meta="presentAwardsPrintMeta" />
          <SummitPillButton variant="major" class="present-awards-save-btn" :loading="isSaving" :disabled="isSaving" @click="onSaveClick">Save Changes</SummitPillButton>
        </template>
        <v-btn icon title="Refresh data" :loading="isReloading" :disabled="isReloading" @click="onReloadClick"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <SummitLoadingState :state="sharedLoadState" error-message="Could not load awards." :on-retry="onReloadClick" />

      <!-- Gotcha: outside the ready gate, because Save triggers a reload and would hide "Saved." -->
      <div v-if="feedback" role="status" class="data-grid-export-feedback">{{ feedback }}</div>

      <template v-if="hasContent">
        <PresentAwardsFiltersVue :filters="displayFilters" @update:filters="onDisplayFiltersUpdate" @reset="onResetFilters" />

        <PresentAwardsTableVue
          ref="table"
          :items="visibleItems"
          :selected-ids="selectedIds"
          :presented-dates="presentedDates"
          :column-filters="columnFilters"
          :group-by-member="groupByMember"
          @toggle-present="onTogglePresent"
          @update-date="onUpdateDate"
          @update:columnFilters="onColumnFiltersUpdate"
        />
      </template>
    </div>
  </v-app>
</template>

<script lang="ts" src="./PresentAwardsVueContent.ts">
</script>

<style scoped>
/* Deliberately the same --oas-vue-* scale as OAS Progression, so the sibling pages can't drift. */
.oas-vue-content {
  --oas-vue-font-size-heading: 18px;
  --oas-vue-font-size-body: 14px;
  --oas-vue-font-family: NunitoSans-regular, arial, sans-serif;
  padding: 8px 0;
}

.oas-progression-view-row {
  flex-wrap: wrap;
  gap: var(--summit-space-sm, 8px);
  margin-bottom: var(--summit-space-lg, 16px);
}

/* Filled with Summit's brand token; Vuetify's `color` prop would use Terrain's blue. */
.present-awards-save-btn.v-btn {
  background-color: var(--summit-color-bg-primary, #004c00) !important;
  color: var(--summit-color-text-on-primary, #ffffff) !important;
}

.present-awards-save-btn.v-btn:hover {
  background-color: var(--summit-color-bg-primary-hover, #006600) !important;
}

.present-awards-save-btn.v-btn--disabled {
  opacity: 0.6;
}

</style>
