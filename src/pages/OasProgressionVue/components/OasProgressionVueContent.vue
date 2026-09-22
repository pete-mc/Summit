<template>
  <v-app>
    <div class="oas-vue-content">
      <v-progress-circular v-if="loadingStreams.size > 0" indeterminate color="primary"></v-progress-circular>
      <span v-if="loadingStreams.size > 0">Loading {{ loadingStreams.size }} stream(s)...</span>

      <v-simple-table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Skill</th>
            <th>Stream</th>
            <th>Stage</th>
            <th>Group</th>
            <th>I-Statement</th>
            <th>Answered</th>
            <th>Awarded</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in items" :key="index">
            <td>{{ row.memberName }}</td>
            <td>{{ row.stream }}</td>
            <td>{{ row.branch }}</td>
            <td>{{ row.stage }}</td>
            <td>{{ row.inputGroup }}</td>
            <td>{{ row.iStatement }}</td>
            <td>{{ row.answered ? "Yes" : "No" }}</td>
            <td>{{ row.awarded ? "Yes" : "No" }}</td>
            <td>{{ row.date }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  </v-app>
</template>

<script lang="ts" src="./OasProgressionVueContent.ts">
</script>

<style scoped>
.oas-vue-content {
  padding: 8px 0;
}
</style>
