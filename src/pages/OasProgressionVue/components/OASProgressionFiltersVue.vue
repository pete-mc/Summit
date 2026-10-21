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
/* Gotcha: the #selection slot replaces .v-select__selection, so the ::v-deep sizing below never reaches it. */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Learning: every filter heading uses the same values on purpose, not each Vuetify control's own native style. */
.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

/* Gotcha: global Vuetify/Terrain rules force these to 20px (see OASProgressionTableVue.vue). */
.oas-heatmap-controls ::v-deep .v-text-field input,
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

/* An empty text field's label stays "resting". Force it floated so it matches the other headings. */
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
