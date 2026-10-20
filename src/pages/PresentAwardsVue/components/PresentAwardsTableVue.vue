<template>
  <div class="present-awards-table-panel">
    <v-data-table
      ref="table"
      :headers="headers"
      :items="filteredItems"
      :group-by="groupBy"
      dense
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }"
      class="present-awards-data-table"
    >
      <!-- Gotcha: header.<value> slots can't add a sibling row, so the filter row goes in #body.prepend. -->
      <template #body.prepend>
        <tr class="oas-vue-column-filter-row">
          <th v-for="header in renderedHeaders" :key="header.value">
            <template v-if="header.filterable !== false">
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
                :data-present-awards-column-filter="header.value"
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
                :data-present-awards-column-filter="header.value"
                @input="onColumnFilterInput(header.value, $event || '')"
              ></v-text-field>
            </template>
          </th>
        </tr>
      </template>

      <!-- Gotcha: Vuetify's default group header has a "remove grouping" button with no way back. -->
      <template #group.header="{ group, isOpen, toggle }">
        <td :colspan="renderedHeaders.length" class="present-awards-group-header">
          <v-btn icon small class="present-awards-group-toggle" :aria-label="isOpen ? `Collapse ${group}` : `Expand ${group}`" @click="toggle">
            <v-icon small>{{ isOpen ? "mdi-chevron-down" : "mdi-chevron-right" }}</v-icon>
          </v-btn>
          <span class="present-awards-group-label">{{ groupLabel(group) }}</span>
        </td>
      </template>

      <template #item.achievementName="{ item }">
        <span class="present-awards-award">
          <span class="present-awards-badge-slot">
            <img v-if="badgeIconUrl(item)" :src="badgeIconUrl(item)" alt="" class="present-awards-badge-icon" :class="{ 'present-awards-badge-icon--wide': isWideBadge(item) }" />
            <span v-else class="present-awards-badge-placeholder" aria-hidden="true"></span>
          </span>
          <span class="present-awards-award-name">{{ item.achievementName }}</span>
        </span>
      </template>

      <template #item.presentedDate="{ item }">
        <v-menu v-if="presentedValue(item)" :value="isDateMenuOpen(item)" :close-on-content-click="false" offset-y min-width="auto" @input="setDateMenuOpen(item, $event)">
          <template #activator="{ on, attrs }">
            <span class="present-awards-date-activator" v-bind="attrs" :aria-label="`Change presentation date for ${item.achievementName}`" v-on="on">{{ presentedValue(item) }}</span>
          </template>
          <v-date-picker :value="pickerValue(item)" no-title @input="onDateInput(item, $event)"></v-date-picker>
        </v-menu>
      </template>

      <template #item.presented="{ item }">{{ presentedValue(item) ? "Yes" : "No" }}</template>

      <!-- Gotcha: the icon font doesn't reach the print document, so data-present carries the tick state. -->
      <template #item.present="{ item }">
        <v-simple-checkbox :data-present="isSelected(item) ? 'yes' : 'no'" :value="isSelected(item)" :ripple="false" :aria-label="`Mark ${item.achievementName} as presented`" @input="onTogglePresent(item, $event)"></v-simple-checkbox>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./PresentAwardsTableVue.ts">
</script>

<style scoped>
.present-awards-table-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.present-awards-data-table ::v-deep tbody td {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Gotcha: content-script CSS loses cascade ties to Terrain's, so on a cold load Vuetify's padding can lose. Restate it. */
.present-awards-data-table ::v-deep > .v-data-table__wrapper > table > tbody > tr > td,
.present-awards-data-table ::v-deep > .v-data-table__wrapper > table > thead > tr > th {
  padding: 0 16px;
}


.oas-vue-column-filter-row th {
  padding: 4px 6px;
  vertical-align: middle;
}

/* Gotcha: Vuetify's row-hover rule also matches the #body.prepend filter row. */
.oas-vue-column-filter-row:hover {
  background: transparent !important;
}

/* Learning: Vue 2 scoped CSS can't reach Vuetify-internal elements without ::v-deep. */
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

/* Gotcha: global Vuetify rules force 20px (v-text-field input, .v-select__selection--comma once a value is set). */
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

/* A fixed-width badge slot so every name starts at the same x. */
.present-awards-award {
  display: inline-flex;
  align-items: center;
  gap: var(--summit-space-sm, 8px);
}

.present-awards-badge-slot {
  flex: 0 0 41px;
  display: flex;
  justify-content: center;
}

.present-awards-badge-icon,
.present-awards-badge-placeholder {
  display: block;
  width: 28px;
  height: 28px;
}

.present-awards-badge-icon {
  object-fit: contain;
}

/* Additional-award art is 96x66. Letterboxed into 28px it would look too small. */
.present-awards-badge-icon--wide {
  width: 41px;
}

.present-awards-badge-placeholder {
  border: 1px dashed var(--summit-color-border-default, #c8c6c4);
  border-radius: 50%;
  background: var(--summit-color-bg-muted, #f3f2f1);
}

.present-awards-group-header {
  background-color: var(--summit-color-bg-muted, #f3f2f1);
}

.present-awards-group-label {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  font-weight: var(--summit-font-weight-semibold, 600);
  margin-left: var(--summit-space-xs, 4px);
}

.present-awards-group-toggle.v-btn {
  width: 20px;
  height: 20px;
  margin: 0;
}

/* Not a v-btn, which would blow out a dense row's height. */
.present-awards-date-activator {
  cursor: pointer;
  border-bottom: 1px dotted currentColor;
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.present-awards-date-activator:hover {
  color: var(--color-base-blue, #1070ca);
}
</style>
