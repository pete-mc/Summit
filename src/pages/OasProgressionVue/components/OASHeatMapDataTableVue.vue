<template>
  <div class="oas-heatmap-scroll">
    <!--
      SPIKE: heat map rendered through v-data-table instead of a hand-built <table>.
      See .claude/OASProgression/SPIKE_HEATMAP_DATATABLE.md for findings.

      Every one of these props exists to switch OFF a v-data-table feature the heat map cannot
      use, which is itself the headline finding:
        :items-per-page="-1"   pagination is meaningless for a heat map
        disable-sort           row order comes from sortMembers (patrol grouping, codenames)
        disable-filtering      the stage columns have no per-column semantics
        hide-default-footer    nothing left to show once pagination is off
    -->
    <v-data-table
      ref="exportTable"
      :headers="dataTableHeaders"
      :items="flatRows"
      :items-per-page="-1"
      disable-sort
      disable-filtering
      disable-pagination
      hide-default-footer
      dense
      class="oas-heatmap-data-table"
    >
      <!--
        The entire body is hand-rendered. v-data-table emits ONE <tbody>
        (VDataTable.js:558), but the heat map needs one per skill section — that grouping is what
        the PDF export paginates on. So the body slot takes over completely, and what is inside it
        is the original markup essentially unchanged.
      -->
      <template #body="{ items }">
        <tbody v-for="section in sectionsFrom(items)" :key="section.key" :data-oas-skill="section.skill">
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

<script lang="ts" src="./OASHeatMapDataTableVue.ts">
</script>

<style scoped>
.oas-heatmap-data-table {
  font-size: var(--oas-vue-font-size-body);
  font-family: var(--oas-vue-font-family);
}

/*
 * v-data-table sets its own background and wrapper styling; the heat map's table is
 * width: max-content inside a horizontal scroller, so the wrapper must not constrain it.
 */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: collapse;
}

/* Terrain's own v-data-table frame: white, thin border, small radius. */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: #fff;
  border: 1px solid #e5e9ec;
  border-radius: 4px;
}
</style>
