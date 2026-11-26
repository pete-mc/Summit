<template>
  <div class="oas-about-tabs">
    <section class="oas-about-tabs-section">
      <h3 class="oas-about-tabs-heading">The Tabs</h3>
      <dl class="oas-about-tabs-list">
        <template v-for="line in lines">
          <dt :key="line.viewMode + '::name'">
            <a href="#" class="oas-about-tabs-link" @click.prevent="onTabClick(line.viewMode)">{{ line.name }}</a>
            <span class="oas-about-tabs-question">{{ line.question }}</span>
          </dt>
          <dd :key="line.viewMode + '::detail'">{{ line.detail }}</dd>
        </template>
      </dl>
    </section>
    <section class="oas-about-tabs-section">
      <h3 class="oas-about-tabs-heading">General</h3>
      <ul class="oas-about-tabs-general">
        <li v-for="point in generalPoints" :key="point">{{ point }}</li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" src="./OASAboutTabsVue.ts"></script>

<style scoped>
.oas-about-tabs {
  padding: 12px 4px;
  max-width: 900px;
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
  line-height: 1.5;
  color: var(--summit-color-text-primary, #2a2a2a);
}

/* Gotcha: Terrain sets font-family, margin and padding on every element, so each one here sets its own. */
.oas-about-tabs h3,
.oas-about-tabs dl,
.oas-about-tabs dt,
.oas-about-tabs dd,
.oas-about-tabs ul,
.oas-about-tabs li,
.oas-about-tabs a,
.oas-about-tabs span {
  font-family: var(--oas-vue-font-family);
  font-size: var(--oas-vue-font-size-body);
  font-style: normal;
  line-height: 1.5;
}

.oas-about-tabs h3.oas-about-tabs-heading {
  margin: 0 0 6px;
  font-size: var(--oas-vue-font-size-heading);
  font-weight: var(--summit-font-weight-semibold, 600);
  color: var(--color-scouts-medium-blue, #00348d);
}

/* Gotcha: on the live page something zeroes the h3's top margin, so the gap sits on the section. */
.oas-about-tabs-section + .oas-about-tabs-section {
  margin-top: 28px;
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
  font-weight: var(--summit-font-weight-semibold, 600);
  color: var(--color-scouts-medium-blue, #00348d);
  margin-right: 6px;
}

.oas-about-tabs-list dd {
  margin: 2px 0 0;
}

.oas-about-tabs ul.oas-about-tabs-general {
  margin: 0;
  padding-left: 20px;
}

.oas-about-tabs-general li {
  margin-top: 4px;
}
</style>
