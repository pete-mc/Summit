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
              <OASTabJumpMenu :jumps="section.menu" @jump="onJump" />
            </td>
          </tr>
          <tr v-for="row in section.skillRows" :key="row.key" :data-oas-skill="row.key">
            <td class="oas-heatmap-member-name">
              <img v-if="row.iconUrl" :src="row.iconUrl" alt="" class="oas-heatmap-skill-icon" :data-oas-skill-icon="row.key" />
              {{ row.title }}<OASTabJumpMenu :jumps="row.menu" @jump="onJump" />
            </td>
            <td
              :class="['oas-heatmap-highest-stage', { 'oas-heatmap-stage-link': row.stageJump }]"
              :title="row.stageJump ? row.stageJump.title : null"
              :role="row.stageJump ? 'link' : null"
              :tabindex="row.stageJump ? 0 : null"
              @click="onLinkClick(row.stageJump)"
              @keydown.enter="onLinkClick(row.stageJump)"
            >
              {{ row.stageDisplay }}<span v-if="row.nextStageProgress" class="oas-heatmap-stage-progress">.{{ row.nextStageProgress }}</span>
            </td>
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="allStages[cellIndex]"
              :class="['oas-heatmap-stage-cell', { 'oas-heatmap-cell-link': row.cellJumps[cellIndex] }]"
              :title="row.cellJumps[cellIndex] ? row.cellJumps[cellIndex].title : null"
              :role="row.cellJumps[cellIndex] ? 'link' : null"
              :tabindex="row.cellJumps[cellIndex] ? 0 : null"
              @click="onLinkClick(row.cellJumps[cellIndex])"
              @keydown.enter="onLinkClick(row.cellJumps[cellIndex])"
            >
              <div v-if="cell.kind === 'bar-complete'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" :title="cell.title"></div>
              <div v-else-if="cell.kind === 'bar-unstarted'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-unstarted" :title="withJumpTitle(cell.title, row.cellJumps[cellIndex])"></div>
              <div v-else-if="cell.kind === 'squares'" class="oas-heatmap-squares">
                <div v-for="square in cell.squares" :key="square.inputId" :class="['oas-heatmap-square', square.stateClass, square.groupClass]" :title="withJumpTitle(square.title, row.cellJumps[cellIndex])"></div>
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
              {{ section.title }}<OASTabJumpMenu :jumps="section.menu" @jump="onJump" />
            </td>
          </tr>
          <template v-for="group in section.patrolGroups">
            <tr v-if="group.patrolName" :key="'patrol::' + group.patrolName" class="oas-heatmap-patrol-title-row" :data-oas-patrol-title="group.patrolName">
              <td class="oas-heatmap-patrol-title" :colspan="allStages.length + 2">{{ group.patrolName }}</td>
            </tr>
            <tr v-for="member in group.members" :key="member.memberId" :data-oas-member="member.memberId">
              <td class="oas-heatmap-member-name">
                {{ member.displayName }}<OASTabJumpMenu :jumps="member.menu" @jump="onJump" />
              </td>
              <td
                :class="['oas-heatmap-highest-stage', { 'oas-heatmap-stage-link': member.stageJump }]"
                :title="member.stageJump ? member.stageJump.title : null"
                :role="member.stageJump ? 'link' : null"
                :tabindex="member.stageJump ? 0 : null"
                @click="onLinkClick(member.stageJump)"
                @keydown.enter="onLinkClick(member.stageJump)"
              >
                {{ member.stageDisplay }}<span v-if="member.nextStageProgress" class="oas-heatmap-stage-progress">.{{ member.nextStageProgress }}</span>
              </td>
              <td
                v-for="(cell, cellIndex) in member.cells"
                :key="allStages[cellIndex]"
                :class="['oas-heatmap-stage-cell', { 'oas-heatmap-cell-link': member.cellJumps[cellIndex] }]"
                :title="member.cellJumps[cellIndex] ? member.cellJumps[cellIndex].title : null"
                :role="member.cellJumps[cellIndex] ? 'link' : null"
                :tabindex="member.cellJumps[cellIndex] ? 0 : null"
                @click="onLinkClick(member.cellJumps[cellIndex])"
                @keydown.enter="onLinkClick(member.cellJumps[cellIndex])"
              >
                <div v-if="cell.kind === 'bar-complete'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" :title="cell.title"></div>
                <div v-else-if="cell.kind === 'bar-unstarted'" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-unstarted" :title="withJumpTitle(cell.title, member.cellJumps[cellIndex])"></div>
                <div v-else-if="cell.kind === 'squares'" class="oas-heatmap-squares">
                  <div v-for="square in cell.squares" :key="square.inputId" :class="['oas-heatmap-square', square.stateClass, square.groupClass]" :title="withJumpTitle(square.title, member.cellJumps[cellIndex])"></div>
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

.oas-heatmap-stage-link,
.oas-heatmap-cell-link {
  cursor: pointer;
}

.oas-heatmap-stage-link:hover,
.oas-heatmap-stage-link:focus-visible {
  color: var(--color-scouts-medium-blue, #00348d);
  text-decoration: underline;
}

.oas-heatmap-cell-link:hover,
.oas-heatmap-cell-link:focus-visible {
  outline: 2px solid var(--color-scouts-medium-blue, #00348d);
  outline-offset: -2px;
}

.oas-heatmap-member-patrol {
  font-weight: normal;
  color: var(--color-neutral-charcoal, #748494);
}

/* Size to content inside the scroller. The border duplicated on the <table> is a leftover from the old PDF export; removing it is a visual change to check live. */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: collapse;
  border: none;
  background: var(--color-white, #fff);
}

.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible !important;
  padding-bottom: 0 !important;
  margin-bottom: 12px;
}
</style>
