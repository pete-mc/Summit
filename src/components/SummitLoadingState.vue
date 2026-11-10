<template>
  <div class="summit-loading-state">
    <v-progress-linear
      v-if="state === 'loading'"
      :indeterminate="!hasCounts"
      :value="percent"
      color="primary"
      class="summit-loading-bar"
    ></v-progress-linear>

    <div v-else-if="state === 'error'" class="summit-loading-error">
      <p>{{ errorMessage }}</p>
      <v-btn v-if="onRetry" outlined color="primary" class="summit-loading-retry" @click="onRetry">Retry</v-btn>
    </div>
  </div>
</template>

<script lang="ts" src="./SummitLoadingState.ts">
</script>

<style scoped>
/* Scoped on purpose: a shared component's styles can't be copied and drift the way a shared class did. */
.summit-loading-state {
  font-family: var(--oas-vue-font-family, NunitoSans-regular, arial, sans-serif);
  font-size: var(--oas-vue-font-size-body, 14px);
}

.summit-loading-bar {
  margin: var(--summit-space-sm, 8px) 0;
}

.summit-loading-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--summit-space-sm, 8px);
  padding: var(--summit-space-sm, 8px) 0;
  color: var(--summit-color-text-danger);
}

.summit-loading-error p {
  margin: 0;
}

.summit-loading-retry.v-btn {
  font-size: 14px;
  font-weight: 600;
  height: 35px !important;
  min-width: 80px;
  padding: 0 18px;
  border-radius: 25px;
  text-transform: none;
  letter-spacing: normal;
}
</style>
