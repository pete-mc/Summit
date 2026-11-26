<template>
  <div class="oas-vue-filter-panel">
    <div class="oas-heatmap-controls">
      <v-text-field
        :value="memberFilter"
        label="Member"
        prepend-inner-icon="mdi-magnify"
        dense
        hide-details
        clearable
        style="max-width: 220px"
        @input="$emit('update:memberFilter', $event || '')"
      ></v-text-field>

      <v-select
        v-if="canFilterByPatrol"
        :value="selectedPatrols || []"
        :items="patrolFilterOptions"
        label="Patrol"
        multiple
        dense
        hide-details
        style="max-width: 220px"
        class="oas-vue-filter-select"
        @change="$emit('update:selectedPatrols', $event)"
      >
        <template #selection="{ index }">
          <span v-if="index === 0" class="oas-vue-select-summary">{{ (selectedPatrols || []).length }} selected</span>
        </template>
      </v-select>

      <v-select
        :value="sortBy"
        :items="sortOptions"
        item-text="text"
        item-value="value"
        label="Sort by"
        dense
        hide-details
        style="max-width: 180px"
        class="oas-vue-filter-select"
        @change="$emit('update:sortBy', $event)"
      >
        <!-- Gotcha: v-select emits no change when the already-selected option is picked, so that click is reported as sort-reselected (Summary clears its column sort on it). -->
        <template #item="{ item, on, attrs }">
          <v-list-item v-bind="attrs" v-on="on" @click="item.value === sortBy && $emit('sort-reselected')">
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <NameFormatSelect :value="nameFormat" @input="$emit('update:nameFormat', $event)" />

      <v-select
        v-if="showOptions.length > 0"
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

      <v-btn text color="primary" @click="$emit('reset')">Reset filters</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./OASSummaryTabFiltersVue.ts">
</script>

<style scoped>
/* Kept in sync by hand with OASProgressFiltersVue.vue: scoped styles can't be shared. */
.oas-vue-select-summary {
  color: rgba(0, 0, 0, 0.6);
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-vue-filter-select ::v-deep .v-label {
  color: var(--color-scouts-medium-blue, #00348d) !important;
  font-size: var(--oas-vue-font-size-heading) !important;
  font-family: var(--oas-vue-font-family) !important;
  font-weight: normal !important;
  letter-spacing: -0.01em !important;
}

.oas-heatmap-controls ::v-deep .v-text-field input,
.oas-heatmap-controls ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

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
