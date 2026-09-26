<template>
  <div class="present-awards-table-panel">
    <div class="oas-vue-clear-filters-row">
      <v-btn v-if="hasActiveColumnFilters" text small color="primary" class="oas-vue-clear-filters-btn" @click="onClearFiltersClick">Clear filters</v-btn>
    </div>

    <v-data-table :headers="headers" :items="filteredItems" dense :items-per-page="25" :footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }" class="present-awards-data-table">
      <!--
        The filter row goes in #body.prepend, not a header slot: header.<value> slots only
        customize a cell WITHIN the existing header <tr> and cannot emit a sibling row.
      -->
      <template #body.prepend>
        <tr class="oas-vue-column-filter-row">
          <th v-for="header in headers" :key="header.value">
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

      <template #item.presented="{ item }">
        <span v-if="!presentedValue(item)">No</span>
        <v-menu v-else :value="isDateMenuOpen(item)" :close-on-content-click="false" offset-y min-width="auto" @input="setDateMenuOpen(item, $event)">
          <template #activator="{ on, attrs }">
            <span class="present-awards-date-activator" v-bind="attrs" :aria-label="`Change presentation date for ${item.achievementName}`" v-on="on">{{ presentedValue(item) }}</span>
          </template>
          <v-date-picker :value="pickerValue(item)" no-title @input="onDateInput(item, $event)"></v-date-picker>
        </v-menu>
      </template>

      <template #item.present="{ item }">
        <v-simple-checkbox :value="isSelected(item)" :ripple="false" :aria-label="`Mark ${item.achievementName} as presented`" @input="onTogglePresent(item, $event)"></v-simple-checkbox>
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

/*
 * v-data-table's body text otherwise falls back to whatever Vuetify/Terrain's ambient table font
 * resolves to. Pin it explicitly via the shared body scale (defined once on .oas-vue-content in
 * PresentAwardsVueContent.vue) so it matches the OAS table rather than drifting independently.
 * ::v-deep is required: Vue 2's scoped CSS only stamps its data-v-* attribute onto elements this
 * component's own template literally writes, and <td> comes from Vuetify's render function.
 */
.present-awards-data-table ::v-deep tbody td {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/* Fixed height so the table doesn't jump as "Clear filters" appears and disappears. */
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

/*
 * v-data-table applies its row-hover highlight to any <tr> in <tbody>, and its selector's two
 * :not()s don't exclude a #body.prepend row — so the filter row picked up the highlight like a
 * real data row. Opt out: it's a filter row, not selectable data.
 */
.oas-vue-column-filter-row:hover {
  background: transparent !important;
}

/*
 * Every rule below reaching a Vuetify-internal element (.v-input__slot, .v-select__selection,
 * .v-icon, the raw <input>) needs ::v-deep. Vue 2's scoped CSS stamps its data-v-* attribute onto
 * the RIGHTMOST compound selector, and only onto elements this template literally writes — so
 * `.oas-vue-column-filter-input .v-input__slot` compiles to `... .v-input__slot[data-v-xxx]`,
 * which can never match something Vuetify's own render function produced.
 */
.oas-vue-column-filter-input ::v-deep .v-input__control,
.oas-vue-column-filter-input ::v-deep .v-input__slot {
  min-height: 30px !important;
  box-shadow: none !important;
}

/* Opaque, not translucent: a translucent background composites against the row behind it and
   disappears on white. */
.oas-vue-column-filter-input ::v-deep .v-input__slot {
  background-color: #eceff1 !important;
  border-radius: 4px;
  padding: 0 8px !important;
}

/*
 * Two global Terrain/Vuetify rules force 20px here and neither is itself !important, so a plain
 * override at equal specificity would still lose:
 *   .v-application .theme--light.v-text-field input { font-size: 20px; }
 *   .v-application .v-select__selection--comma      { font-size: 20px; }
 * The second only applies once a value is actually selected.
 */
.oas-vue-column-filter-input.v-text-field ::v-deep input,
.oas-vue-column-filter-input.v-select ::v-deep .v-select__selection {
  font-size: var(--oas-vue-font-size-body) !important;
  font-family: var(--oas-vue-font-family) !important;
}

.oas-vue-column-filter-input ::v-deep .v-icon {
  font-size: 16px;
}

/*
 * Vuetify's clearable "x" is opacity:0 until :hover or :focus — unreachable on touch devices,
 * which have no hover. Show it whenever the field actually holds a value.
 */
.oas-vue-column-filter-input.v-input--is-dirty ::v-deep .v-input__icon--clear {
  opacity: 1 !important;
}

/*
 * The presented date doubles as the button that opens its own date picker, so it needs to look
 * clickable without becoming a full v-btn (which would blow out the row height on a dense table).
 * A dotted underline reads as "editable text" rather than as a link.
 */
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
