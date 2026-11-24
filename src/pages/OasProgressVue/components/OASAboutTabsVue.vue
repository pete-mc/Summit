<template>
  <div class="oas-about-tabs">
    <dl class="oas-about-tabs-list">
      <template v-for="line in lines">
        <dt :key="line.viewMode + '::name'">
          <a href="#" class="oas-about-tabs-link" @click.prevent="onTabClick(line.viewMode)">{{ line.name }}</a>
          <span class="oas-about-tabs-question">{{ line.question }}</span>
        </dt>
        <dd :key="line.viewMode + '::detail'">{{ line.detail }}</dd>
      </template>
    </dl>
    <p class="oas-about-tabs-footer">Every tab can be printed or exported to Excel, and each tab remembers its own filters.</p>
  </div>
</template>

<script lang="ts" src="./OASAboutTabsVue.ts"></script>

<style scoped>
.oas-about-tabs {
  padding: 12px 4px;
  max-width: 900px;
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  color: var(--summit-color-text-primary, #2a2a2a);
}

.oas-about-tabs-list {
  margin: 0;
}

.oas-about-tabs-list dt {
  margin-top: 12px;
}

.oas-about-tabs-list dt:first-child {
  margin-top: 0;
}

.oas-about-tabs-link {
  font-weight: bold;
  color: var(--color-scouts-medium-blue, #00348d);
  margin-right: 6px;
}

.oas-about-tabs-question {
  font-style: italic;
}

.oas-about-tabs-list dd {
  margin: 2px 0 0;
}

.oas-about-tabs-footer {
  margin: 16px 0 0;
  color: var(--color-neutral-charcoal, #748494);
}
</style>
