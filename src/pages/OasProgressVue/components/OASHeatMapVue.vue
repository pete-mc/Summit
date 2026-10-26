<template>
  <div class="oas-heatmap-scroll">
    <!-- v-data-table for Terrain's table styling. Sort/filter/paging are off because the filter bar handles them. -->
    <v-data-table
      :headers="dataTableHeaders"
      :items="flatRows"
      :items-per-page="-1"
      disable-sort
      disable-filtering
      disable-pagination
      hide-default-header
      hide-default-footer
      dense
      class="oas-heatmap-data-table"
    >
      <!-- Hand-written thead for colspan. Learning: Terrain doesn't style table headers, so they're deliberately left unstyled. -->
      <template #header>
        <thead>
          <tr>
            <th class="oas-heatmap-member-header">{{ isGroupedByMember ? "Skill" : "Member" }}</th>
            <th class="oas-heatmap-highest-stage-header">Stage</th>
            <th v-for="stage in allStages" :key="stage" class="oas-heatmap-stage-group-header">
              {{ stage }}
            </th>
          </tr>
        </thead>
      </template>

      <!-- One <tbody> per section, so print keeps each title with its rows. -->
      <template v-if="isGroupedByMember" #body>
        <tbody v-for="section in memberSections" :key="section.memberId" :data-oas-member-section="section.memberId">
          <tr class="oas-heatmap-skill-title-row">
            <td class="oas-heatmap-skill-title" :colspan="allStages.length + 2">
              {{ section.title }}<span v-if="section.patrolName" class="oas-heatmap-member-patrol"> — {{ section.patrolName }}</span>
            </td>
          </tr>
          <tr v-for="row in section.skillRows" :key="row.key" :data-oas-skill="row.key">
            <td class="oas-heatmap-member-name">
              <img v-if="row.iconUrl" :src="row.iconUrl" alt="" class="oas-heatmap-skill-icon" :data-oas-skill-icon="row.key" />
              {{ row.title }}
            </td>
            <td class="oas-heatmap-highest-stage">
              {{ row.stageDisplay }}<span v-if="row.nextStageProgress" class="oas-heatmap-stage-progress">.{{ row.nextStageProgress }}</span>
            </td>
            <td v-for="(cell, cellIndex) in row.cells" :key="allStages[cellIndex]" class="oas-heatmap-stage-cell">
              <div v-if="cell.kind === 'bar-complete'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" :title="cell.title"></div>
              <div v-else-if="cell.kind === 'bar-unstarted'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-unstarted" :title="cell.title"></div>
              <div v-else-if="cell.kind === 'squares'" class="oas-heatmap-squares">
                <div v-for="square in cell.squares" :key="square.inputId" :class="['oas-heatmap-square', square.stateClass, square.groupClass]" :title="square.title"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </template>

      <template v-else #body>
        <tbody v-for="section in sections" :key="section.key" :data-oas-skill="section.skill">
          <tr class="oas-heatmap-skill-title-row">
            <td class="oas-heatmap-skill-title" :colspan="allStages.length + 2">
              <img v-if="section.iconUrl" :src="section.iconUrl" alt="" class="oas-heatmap-skill-icon" :data-oas-skill-icon="section.skill" />
              {{ section.title }}
            </td>
          </tr>
          <template v-for="group in section.patrolGroups">
            <tr v-if="group.patrolName" :key="'patrol::' + group.patrolName" class="oas-heatmap-patrol-title-row" :data-oas-patrol-title="group.patrolName">
              <td class="oas-heatmap-patrol-title" :colspan="allStages.length + 2">{{ group.patrolName }}</td>
            </tr>
            <tr v-for="member in group.members" :key="member.memberId" :data-oas-member="member.memberId">
              <td class="oas-heatmap-member-name">{{ member.displayName }}</td>
              <td class="oas-heatmap-highest-stage">
                {{ member.stageDisplay }}<span v-if="member.nextStageProgress" class="oas-heatmap-stage-progress">.{{ member.nextStageProgress }}</span>
              </td>
              <td v-for="(cell, cellIndex) in member.cells" :key="allStages[cellIndex]" class="oas-heatmap-stage-cell">
                <div v-if="cell.kind === 'bar-complete'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" :title="cell.title"></div>
                <div v-else-if="cell.kind === 'bar-unstarted'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-unstarted" :title="cell.title"></div>
                <div v-else-if="cell.kind === 'squares'" class="oas-heatmap-squares">
                  <div v-for="square in cell.squares" :key="square.inputId" :class="['oas-heatmap-square', square.stateClass, square.groupClass]" :title="square.title"></div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" src="./OASHeatMapVue.ts">
</script>

<style scoped>
.oas-heatmap-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

.oas-heatmap-member-patrol {
  font-weight: normal;
  color: var(--color-neutral-charcoal, #748494);
}

/* Size to content inside the scroller. The border duplicated on the <table> is a leftover from the old PDF export; removing it is a visual change to check live. */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: collapse;
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
}

.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}
</style>
