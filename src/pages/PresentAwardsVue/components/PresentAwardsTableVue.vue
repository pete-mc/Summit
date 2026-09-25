<template>
  <div class="present-awards-table-panel">
    <v-data-table :headers="headers" :items="items" dense :items-per-page="25" :footer-props="{ itemsPerPageOptions: [10, 25, 50, 100, -1] }" class="present-awards-data-table"> </v-data-table>
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
</style>
