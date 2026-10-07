<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-text-field
        :value="filters.memberFilter"
        label="Member"
        prepend-inner-icon="mdi-magnify"
        dense
        hide-details
        clearable
        style="max-width: 220px"
        @input="patch({ memberFilter: $event || '' })"
      ></v-text-field>

      <v-select
        v-if="canFilterByPatrol"
        :value="filters.selectedPatrols || []"
        :items="patrolFilterOptions"
        label="Patrol"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ selectedPatrols: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ (filters.selectedPatrols || []).length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.visibleStreams"
        :items="skillOptions"
        item-text="text"
        item-value="value"
        label="Skills"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="patch({ visibleStreams: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.visibleStreams.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.visibleStages"
        :items="stageOptions"
        label="Stages"
        multiple
        dense
        hide-details
        style="max-width: 140px"
        class="oas-vue-filter-select"
        @change="patch({ visibleStages: $event })"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ filters.visibleStages.length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="filters.sortBy"
        :items="sortOptions"
        item-text="text"
        item-value="value"
        label="Sort by"
        dense
        hide-details
        style="max-width: 180px"
        class="oas-vue-filter-select"
        @change="patch({ sortBy: $event })"
      ></v-select>

      <v-select
        :value="filters.groupBy"
        :items="groupByOptions"
        item-text="text"
        item-value="value"
        label="Group by"
        dense
        hide-details
        style="max-width: 140px"
        class="oas-vue-filter-select"
        @change="onGroupByChange"
      ></v-select>

      <NameFormatSelect :value="filters.nameFormat" @input="patch({ nameFormat: $event })" />

      <v-select
        :value="showSelection"
        :items="showOptions"
        item-text="text"
        item-value="value"
        label="Show"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        :menu-props="{ contentClass: 'oas-vue-show-menu' }"
        @change="onShowChange"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ showSelection.length }} selected</span>
        </template>
      </v-select>

      <v-btn text color="primary" @click="resetFilters">Reset filters</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./OASProgressionFiltersVue.ts">
</script>

<style scoped>
/*
 * This is a custom <span> in the v-select's own #selection slot template, not Vuetify's native
 * .v-select__selection element the ::v-deep rule below targets — it renders instead of that
 * element (this slot replaces it), so it never picked up that rule's body size/family and was
 * left at whatever size it inherits ambiently. Sized explicitly to match, via the shared scale
 * defined on .oas-vue-content (see OasProgressionVueContent.vue).
 */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/*
 * ONE shared set of values — Skills' own label styling, exactly as read off its live Computed
 * panel — applied identically to every filter heading on this row via the shared
 * --oas-vue-font-size-heading/--oas-vue-font-family scale defined once on .oas-vue-content
 * (OasProgressionVueContent.vue), so every heading references the same source of truth instead
 * of each carrying its own hardcoded copy of the number. Deliberately NOT per-element "native"
 * values: an earlier attempt replicated each element's own distinct underlying Terrain rule
 * (Member's v-text-field rule differs from a v-select rule in font-weight/font-family), which
 * produced visibly different-looking headings even though each individually matched its own
 * "correct" source rule — not what was asked for. The user wants ALL of them to look the same,
 * full stop:
 *   color: #00348d (--color-scouts-medium-blue)
 *   font-weight: normal (Skills' own rule is `inherit`, which resolves to normal weight here)
 *   letter-spacing: -0.01em
 * Applied here to every v-select's own native label (Skills/Patrol/Stages/Sort
 * by/Group by/Show). Vuetify renders both the "resting" (unfocused, no value) and "floated"
 * (.v-label--active) label states as .v-label, so one rule covers both; ::v-deep is required
 * since .v-label is Vuetify-internal render output this template doesn't write directly.
 */
.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

/*
 * Same global-rule override as OASProgressionTableVue.vue's own filter boxes (see that file's
 * comment for the full DevTools-confirmed root cause): Vuetify/Terrain's page-level CSS forces
 * v-text-field's <input> and v-select's selected-value text to 20px regardless of `dense`. Both
 * views' filter/table text is deliberately kept at the one shared body size/family (see the
 * --oas-vue-font-size-body scale on .oas-vue-content) rather than each view picking its own value.
 * ::v-deep is required — these are Vuetify-internal elements this template doesn't directly
 * write, so Vue's scoped data-v-* attribute never reaches them.
 */
.oas-heatmap-controls ::v-deep .v-text-field input,
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/*
 * Member's label (empty field, "resting" inside the box) looked visually different from
 * Skills/Stages/Sort by's labels (already floated above the box, since those fields
 * already hold a value) — Vuetify only applies its `.v-label--active` class once a field has
 * focus/a value, so Member's label sits in its default resting position/style until then. Force
 * the same floated position always, and apply the same shared heading values as every other
 * label (see .oas-vue-filter-select ::v-deep .v-label above) rather than Member's own distinct
 * native Terrain rule — matching what was actually asked for (all headings identical), not each
 * element's own "correct" source.
 */
.oas-heatmap-controls ::v-deep .v-text-field .v-label {
  max-width: 133%;
  transform: translateY(-18px) scale(0.75);
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}
</style>
