<template>
  <div>
    <h2 id="milestoneHeader">Milestone Planning</h2>
    <p v-if="loading" id="loadingP">Loading data from Terrian please wait...</p>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.value">{{ column.text }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.milestone }}</td>
            <td>{{ row.leads }}</td>
            <td>{{ row.assists }}</td>
            <td>{{ row.outdoors }}</td>
            <td>{{ row.creative }}</td>
            <td>{{ row.personalGrowth }}</td>
            <td>{{ row.community }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<!-- The rest of your script and style tags remain the same -->
<script>
import { fetchUnitMembersMetrics } from '../helpers/terrainCalls';


export default {
  data() {
    return {
      loading: true,
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
      tableData: []
    };
  },
  async created() {
    try {
      const unitMembers = await fetchUnitMembersMetrics();
      if (!unitMembers) {
        this.loading = false;
          console.log("No unit members or current profile");
        return;
      }
      this.$set(this, 'tableData', unitMembers.map(r => {
        const maxL = r.milestone.milestone === 1 ? 1 : r.milestone.milestone === 2 ? 2 : 4;
        const maxA = r.milestone.milestone === 1 ? 2 : r.milestone.milestone === 2 ? 3 : 4;
        const maxP = r.milestone.milestone === 1 ? 6 : r.milestone.milestone === 2 ? 5 : 4;
        return {
          name: r.name,
          milestone: r.milestone.milestone,
          leads: Math.max(0, maxL - r.milestone.total_leads),
          assists: Math.max(0, maxA - r.milestone.total_assists),
          outdoors: Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === "outdoors")?.total || 0)),
          creative: Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === "creative")?.total || 0)),
          personalGrowth: Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === "personal_growth")?.total || 0)),
          community: Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === "community")?.total || 0))
        } 
      }));
      console.log(this.tableData);
      this.loading = false;
    } catch (error) {
      console.log(error);
    }
  }
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>