<template>
  <div>
    <h2>Present Awards (legacy)</h2>
    <div class="present-awards-legacy-banner">
      This is the original, retired version of Present Awards, kept as a reference. Use
      <router-link to="/summit/tools/PresentAwards">Present Awards</router-link> for the current version. Both read and write the same saved data, so it is safe to switch between them.
    </div>
    <p>
      Welcome to the Awards Presentation page. Here, you can manage the presentation of awards to youth members. Please
      note that marking an award as 'Presented' here signifies that the award has actually been handed over to the youth
      member. This is different from the 'Awarded' status, which indicates that the member has earned the award but may
      not have received it yet. Remember to <b>save your changes</b> after presenting awards to ensure the information is
      updated correctly.<br>
    </p>
    <div ref="reactRoot"></div>
  </div>
</template>

<script lang="ts" src="./PresentAwards.ts">
</script>

<style scoped>
.present-awards-legacy-banner {
  background-color: #fff4e5;
  border: 1px solid #f0ad4e;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
</style>