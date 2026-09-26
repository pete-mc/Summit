<template>
  <v-app>
    <div class="oas-vue-content present-awards-panel">
      <div class="oas-progression-view-row">
        <span v-if="loadState === 'loading'">Loading awards...</span>
        <span v-else-if="loadState === 'error'">Could not load awards. Try reloading the page.</span>
        <v-spacer></v-spacer>
        <v-btn outlined color="primary" class="oas-vue-pill-btn" :loading="isSaving" :disabled="isSaving" @click="onSaveClick">Save Changes</v-btn>
      </div>

      <div v-if="feedback" role="status" class="data-grid-export-feedback">{{ feedback }}</div>

      <PresentAwardsTableVue :items="items" :selected-ids="selectedIds" :presented-dates="presentedDates" @toggle-present="onTogglePresent" @update-date="onUpdateDate" />
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
