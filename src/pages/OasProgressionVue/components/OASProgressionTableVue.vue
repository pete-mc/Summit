<template>
  <div class="oas-vue-table-panel">
    <div class="oas-vue-clear-filters-row">
      <v-btn v-if="hasActiveColumnFilters" text small color="primary" class="oas-vue-clear-filters-btn" @click="onClearFiltersClick">Clear filters</v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="filteredItems"
      dense
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
      :footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }"
      class="oas-vue-data-table"
    >
      <template #body.prepend>
        <tr class="oas-vue-column-filter-row">
          <th v-for="header in headers" :key="header.value">
            <v-select
              v-if="header.filterType === 'select'"
              :value="columnFilters[header.value] || null"
              :items="columnFilterOptions[header.value]"
              item-text="text"
              item-value="value"
              solo
              flat
              dense
              hide-details
              clearable
              class="oas-vue-column-filter-input"
              :aria-label="`Filter ${header.text}`"
              :data-oas-column-filter="header.value"
              @change="onColumnFilterInput(header.value, $event || '')"
            ></v-select>
            <v-text-field
              v-else
              :value="columnFilters[header.value] || ''"
              solo
              flat
              dense
              hide-details
              clearable
              prepend-inner-icon="mdi-magnify"
              class="oas-vue-column-filter-input"
              :aria-label="`Filter ${header.text}`"
              :data-oas-column-filter="header.value"
              @input="onColumnFilterInput(header.value, $event || '')"
            ></v-text-field>
          </th>
        </tr>
      </template>
      <template #item.answered="{ item }">{{ item.answered ? "Yes" : "No" }}</template>
      <template #item.awarded="{ item }">{{ item.awarded ? "Yes" : "No" }}</template>
      <template #item.date="{ item }">{{ formatDate(item.date) }}</template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./OASProgressionTableVue.ts">
</script>

<style scoped>
.oas-vue-table-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Reserves the button's height so the table doesn't jump when it appears. */
.oas-vue-clear-filters-row {
  min-height: 30px;
  display: flex;
  align-items: center;
}

.oas-vue-clear-filters-btn {
  align-self: flex-start;
}

.oas-vue-column-filter-row th {
  padding: 4px 6px;
  vertical-align: middle;
}


.oas-vue-data-table ::v-deep tbody td {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: content-script CSS loses cascade ties to Terrain's, so on a cold load Vuetify's padding can lose. Restate it. */
.oas-vue-data-table ::v-deep > .v-data-table__wrapper > table > tbody > tr > td,
.oas-vue-data-table ::v-deep > .v-data-table__wrapper > table > thead > tr > th {
  padding: 0 16px;
}

/* Gotcha: Vuetify's row-hover rule also matches the #body.prepend filter row. */
.oas-vue-column-filter-row:hover {
  background: transparent !important;
}

/*
 * Learning: Vue 2 scoped CSS can't reach Vuetify-internal elements without ::v-deep.
 * Gotcha: global Vuetify rules force inputs and v-select values to 20px, hence the !important below.
 */
.oas-vue-column-filter-input ::v-deep .v-input__control,
.oas-vue-column-filter-input ::v-deep .v-input__slot {
  min-height: 30px !important;
  box-shadow: none !important;
}

.oas-vue-column-filter-input ::v-deep .v-input__slot {
  background-color: #eceff1 !important;
  border-radius: 4px;
  padding: 0 8px !important;
}

.oas-vue-column-filter-input.v-text-field ::v-deep input,
.oas-vue-column-filter-input.v-select ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

.oas-vue-column-filter-input ::v-deep .v-icon {
  font-size: 16px;
}

/* Gotcha: the clear icon only shows on hover, which touch devices don't have. */
.oas-vue-column-filter-input.v-input--is-dirty ::v-deep .v-input__icon--clear {
  opacity: 1 !important;
}
</style>
