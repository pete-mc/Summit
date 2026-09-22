<template>
  <div class="oas-heatmap-scroll">
    <table ref="exportTable" class="oas-heatmap-table">
      <thead class="oas-heatmap-thead">
        <tr>
          <th class="oas-heatmap-member-header">Member</th>
          <th class="oas-heatmap-highest-stage-header">Stage</th>
          <th v-for="stage in allStages" :key="stage" class="oas-heatmap-stage-group-header">
            {{ stage }}
          </th>
        </tr>
      </thead>
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
                <div
                  v-for="square in cell.squares"
                  :key="square.inputId"
                  :class="['oas-heatmap-square', square.stateClass, square.groupClass]"
                  :title="square.title"
                ></div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" src="./OASHeatMapVue.ts">
</script>
