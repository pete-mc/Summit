<template>
  <!-- Gotcha: stops the click reaching a sortable header, which would sort as well as open the menu. -->
  <span v-if="jumps.length" class="oas-tab-jump-menu" @click.stop>
    <v-menu offset-y>
      <template #activator="{ on, attrs }">
        <v-btn icon x-small :title="label" :aria-label="label" v-bind="attrs" v-on="on"><v-icon small>mdi-chevron-down</v-icon></v-btn>
      </template>
      <v-list dense>
        <v-list-item v-for="jump in jumps" :key="jump.viewMode" @click="onSelect(jump)">
          <v-list-item-title>{{ jump.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script lang="ts" src="./OASTabJumpMenu.ts"></script>

<style scoped>
/* Space is always kept, so names and headers don't shift when the button appears. */
.oas-tab-jump-menu {
  display: inline-block;
  visibility: hidden;
  margin-left: 4px;
}

th:hover .oas-tab-jump-menu,
tr:hover .oas-tab-jump-menu,
.oas-tab-jump-menu:focus-within,
.oas-tab-jump-menu:has([aria-expanded="true"]) {
  visibility: visible;
}
</style>
