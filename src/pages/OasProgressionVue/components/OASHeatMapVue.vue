<template>
  <div class="oas-heatmap-scroll">
    <!--
      Heat map rendered through Vuetify's own v-data-table, so it inherits Terrain's table
      styling rather than reimplementing it. See .claude/OASProgression/SPIKE_HEATMAP_DATATABLE.md.

      The disabled props are features the heat map never used in the first place — it is one
      continuous grid whose order comes from sortMembers() and whose filtering is the filter bar
      above. They are switched off so Vuetify does not add UI for them, not because anything was
      given up.
    -->
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
      <!--
        Hand-written thead: the stage-group row uses colspan to span several stage columns under
        one label, which Vuetify's own header renderer (one <th> per header entry) cannot express.

        Deliberately WITHOUT a thead class that paints the header Summit green: Terrain does not
        style table headers at all — confirmed from its own Computed panel. Leaving it unstyled
        lets Vuetify's default show through (12px, 60% black, 32px tall in dense mode), which is
        what "match Terrain" actually means here. (The legacy React page's .oas-heatmap-thead rule
        did this; it was removed from index.css along with that page's other dead CSS.)
      -->
      <template #header>
        <thead>
          <tr>
            <!-- The first column holds whatever is NOT the section heading: member names under a
                 skill heading, skill names under a member heading. -->
            <th class="oas-heatmap-member-header">{{ isGroupedByMember ? "Skill" : "Member" }}</th>
            <th class="oas-heatmap-highest-stage-header">Stage</th>
            <th v-for="stage in allStages" :key="stage" class="oas-heatmap-stage-group-header">
              {{ stage }}
            </th>
          </tr>
        </thead>
      </template>

      <!--
        Hand-written tbody: v-data-table emits a single <tbody>, but each skill section needs its
        own so the PDF export can paginate on section boundaries.
      -->
      <!--
        Grouped by member: the heading is the person, the rows are their skills, and the skill
        icon moves from the heading onto each row. No patrol sub-grouping — a member belongs to
        one patrol, so it is shown beside their name rather than dividing anything.
      -->
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

/*
 * Patrol beside a member's name when grouped by member. Lighter than the name it follows, since
 * it qualifies rather than identifies — the member is what the row is about.
 */
.oas-heatmap-member-patrol {
  font-weight: normal;
  color: var(--color-neutral-charcoal, #748494);
}

/*
 * Vuetify's table defaults to width: 100%. The heat map is a wide grid inside a horizontal
 * scroller, so it must size to its content instead.
 */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper > table {
  width: max-content;
  border-collapse: collapse;
}

/*
 * Terrain's own v-data-table frame, via its tokens rather than literals so it tracks any
 * retheme — see .claude/DESIGN.md. Terrain does not style thead at all, so the heat map's own
 * green header styling is removed rather than replaced.
 */
.oas-heatmap-data-table ::v-deep > .v-data-table__wrapper {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-light-charcoal, #e5e9ec);
  border-radius: 4px;
}
</style>
