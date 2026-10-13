<template>
  <div class="present-awards-table-panel">
    <!-- No "Clear filters" link here: the filter bar's "Reset filters" clears column filters too
         (user, 2026-10-11). -->
    <!-- items-per-page/page are .sync-bound so printing can show every row, then restore them (prepareForPrint).
         sort-by/sort-desc are .sync-bound so the Excel export can follow the on-screen sort (getExportView). -->
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
      <!--
        The filter row goes in #body.prepend, not a header slot: header.<value> slots only
        customize a cell WITHIN the existing header <tr> and cannot emit a sibling row.
      -->
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

      <!--
        Custom group header: Vuetify's default one includes a "remove grouping" button that would
        silently drop grouping with no way to get it back, since the toggle lives in the page
        header. This keeps the collapse toggle and drops that.
      -->
      <template #group.header="{ group, isOpen, toggle }">
        <td :colspan="renderedHeaders.length" class="present-awards-group-header">
          <v-btn icon small class="present-awards-group-toggle" :aria-label="isOpen ? `Collapse ${group}` : `Expand ${group}`" @click="toggle">
            <v-icon small>{{ isOpen ? "mdi-chevron-down" : "mdi-chevron-right" }}</v-icon>
          </v-btn>
          <span class="present-awards-group-label">{{ groupLabel(group) }}</span>
        </td>
      </template>

      <!--
        Badge artwork inside the Award cell, just before the award's name (user, 2026-10-12) —
        connected to the name it illustrates, without a column of its own. Every badge gets the
        same fixed-width slot so the names line up; award types without artwork yet show a neutral
        dashed placeholder in it. The image is decorative (alt="", no tooltip): the name beside it
        says the same thing. Sorting and filtering still use achievementName.
      -->
      <template #item.achievementName="{ item }">
        <span class="present-awards-award">
          <span class="present-awards-badge-slot">
            <img v-if="badgeIconUrl(item)" :src="badgeIconUrl(item)" alt="" class="present-awards-badge-icon" :class="{ 'present-awards-badge-icon--wide': isWideBadge(item) }" />
            <span v-else class="present-awards-badge-placeholder" aria-hidden="true"></span>
          </span>
          <span class="present-awards-award-name">{{ item.achievementName }}</span>
        </span>
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

/*
 * Cell padding, set explicitly rather than inherited from Vuetify's own rule.
 *
 * Vuetify supplies `padding: 0 16px` for these cells, but our copy of it arrives in
 * summit.css — which manifest.json injects as a CONTENT SCRIPT stylesheet. Chrome places those
 * in a lower-precedence cascade origin than the page's own stylesheets, so on a cold load
 * (hard refresh straight onto the page) Terrain's ambient table CSS can win and the first
 * column ends up flush against the table edge. Navigating in from another Summit page made it
 * look correct only because the styles had already settled by then — the classic symptom of a
 * load-order race rather than a wrong value.
 *
 * Restating the padding here, scoped to this component and reaching through ::v-deep, means the
 * layout no longer depends on which stylesheet won.
 */
.present-awards-data-table ::v-deep > .v-data-table__wrapper > table > tbody > tr > td,
.present-awards-data-table ::v-deep > .v-data-table__wrapper > table > thead > tr > th {
  padding: 0 16px;
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
 * Award cell: badge, then name, on one line (user, 2026-10-12). The slot is the width of the widest
 * (additional award) artwork, with each badge centred in it, so every name starts at the same x.
 */
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

/*
 * Badge artwork. Fixed 28px so every row is the same height whether its badge has artwork or a
 * placeholder, and so a dense row doesn't grow to fit the image.
 */
.present-awards-badge-icon,
.present-awards-badge-placeholder {
  display: block;
  width: 28px;
  height: 28px;
}

.present-awards-badge-icon {
  object-fit: contain;
}

/*
 * Additional awards are wide (96x66) rather than square like the OAS icons. Letterboxing one into
 * the 28px square would shrink it to ~19px tall and leave it visibly smaller than its neighbours,
 * so it gets the width its aspect ratio needs while keeping the shared 28px row height.
 */
.present-awards-badge-icon--wide {
  width: 41px;
}

/* Neutral dashed outline: reads as "artwork not loaded yet" rather than as a real badge. */
.present-awards-badge-placeholder {
  border: 1px dashed var(--summit-color-border-default, #c8c6c4);
  border-radius: 50%;
  background: var(--summit-color-bg-muted, #f3f2f1);
}

/*
 * Group header rows. A tinted background and a semibold label separate each member's block from
 * the rows beneath without needing a heavier rule or border.
 */
.present-awards-group-header {
  background-color: var(--summit-color-bg-muted, #f3f2f1);
}

.present-awards-group-label {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  font-weight: var(--summit-font-weight-semibold, 600);
  margin-left: var(--summit-space-xs, 4px);
}

/* Chevron sits tight against the name rather than carrying v-btn's default icon-button width. */
.present-awards-group-toggle.v-btn {
  width: 20px;
  height: 20px;
  margin: 0;
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
