<template>
  <v-select :value="value" :items="options" item-text="text" item-value="value" label="Name" dense hide-details style="max-width: 160px" class="oas-vue-filter-select" @change="$emit('input', $event)"></v-select>
</template>

<script lang="ts" src="./NameFormatSelect.ts"></script>
