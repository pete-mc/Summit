<template>
  <div class="present-awards-table-panel">
    <v-data-table :headers="headers" :items="items" dense :items-per-page="25" :footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }" class="present-awards-data-table">
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
