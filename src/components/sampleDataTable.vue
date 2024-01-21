<template>
  <table ref="table"></table>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { text: "Name", value: "name" },
        { text: "Milestone", value: "milestone" },
        { text: "Leads", value: "leads" },
        { text: "Assists", value: "assists" },
        { text: "Outdoors", value: "outdoors" },
        { text: "Creative", value: "creative" },
        { text: "Personal Growth", value: "personalGrowth" },
        { text: "Community", value: "community" }
      ],
    };
  },
  computed: {
    achievements() {
      return this.$store.getters.getAchievements;
    },
  },
  watch: {
    achievements(newData) {
      if (this.table) {
        this.table.clear();
        this.table.rows.add(newData);
        this.table.draw();
      }
    },
  },
  created() {
    this.$store.dispatch('getAchievements');
  },
  mounted() {
    this.$nextTick(() => {
      this.table = $(this.$refs.table).DataTable(
        {
          columns: this.columns,
          paging: false,
          searching: false,
        }
      );
    });
  },
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>
