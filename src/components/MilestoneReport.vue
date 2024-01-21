<template>
  <div id="SummitContentDiv">
    <h2 id="milestoneHeader">Milestone Planning</h2>
    The milestones planning report is useful to see how many participates, leads and assists each member requires to
    complete their current milestone. Note that the numbers displayed are the <b>remaining requrement</b> not the current
    total.<br>
    <p id="loadingP">Loading data from Terrian please wait...</p>
    <div id="Buttons"></div>
    <table id="unitReportTable" class="display" width="100%"></table>
    <canvas id="myChart"></canvas>
  </div>
</template>

<!-- The rest of your script and style tags remain the same -->
<script lang="ts">
import { defineComponent } from 'vue';
import { fetchUnitAchievementsFilterd, fetchUnitMembersMetrics } from '../helpers/terrainCalls';
import 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.js'; // HTML 5 file export
import 'datatables.net-buttons/js/buttons.print.js'; // Print view button
import { TerrainAchievements } from '@/types/terrainTypes';
export default defineComponent({
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
      const achievements = await fetchUnitAchievementsFilterd("type=milestone&section=venturer") as TerrainAchievements[];
      const unitMembers = await fetchUnitMembersMetrics();
      if (!unitMembers || !achievements) {
        $("#loadingP").text(
          "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
        );
        $("#retry").remove();
        $("#github").remove();
        $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
        // button to access github issues list
        $("#loadingP").after(
          '<a id="github" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
        );
        $("#retry").on("click", async function () {
          // $("#summitContentDiv").replaceWith(MileStonePlanningReportHtml);
          // mileStonePlanningReport();
        });
        return;
      }
      $("#milestoneHeader").text("Milestone Planning - " + window.$nuxt.$store.state.me.currentUnit.name);
      if ($("#milestoneHeader").data("loaded")) return;
      $("#milestoneHeader").data("loaded", true);
      $("#loadingP").remove();
      $("#retry").remove();
      $("#github").remove();

      const filteredAchievements = achievements.sort((a, b) => (a.achievement_meta?.stage ?? 0) - (b.achievement_meta?.stage ?? 0)).filter((a) => a.milestone_requirement_status === "incomplete" && a.status !== "awarded",)
      const milestoneData = window.$nuxt.$store.state.me.unitMembersData
      .filter((m: { unit: { duty: string;} }) => m.unit.duty != "adult_leader")
      .map((m: { id: string; first_name: string; last_name: string; }) => {
        const currentMilestone = filteredAchievements.find(a => a.member_id === m.id);
        const maxL = !currentMilestone ? 0 : currentMilestone.achievement_meta?.stage === 1 ? 1 : currentMilestone.achievement_meta?.stage === 2 ? 2 : 4;
        const maxA = !currentMilestone ? 0 : currentMilestone.achievement_meta?.stage === 1 ? 2 : currentMilestone.achievement_meta?.stage === 2 ? 3 : 4;
        const maxP = !currentMilestone ? 0 : currentMilestone.achievement_meta?.stage === 1 ? 6 : currentMilestone.achievement_meta?.stage === 2 ? 5 : 4;  
        return {
          name: m.first_name + " " + m.last_name,
          milestone: !currentMilestone ? 0 : currentMilestone.achievement_meta?.stage,
          total_leads: !currentMilestone ? 0 : Math.max(0, maxL - (currentMilestone.event_count?.leader ? currentMilestone.event_count?.leader.community + currentMilestone.event_count?.leader.creative + currentMilestone.event_count?.leader.outdoors + currentMilestone.event_count?.leader.personal_growth : 0)),
          total_assists: !currentMilestone ? 0 : Math.max(0, maxA - (currentMilestone.event_count?.assistant ? currentMilestone.event_count?.assistant.community + currentMilestone.event_count?.assistant.creative + currentMilestone.event_count?.assistant.outdoors + currentMilestone.event_count?.leader.personal_growth : 0)),
          outdoors: !currentMilestone ? 0 : Math.max(0, maxP - (currentMilestone.event_count?.participant ? currentMilestone.event_count?.participant.outdoors : 0)),
          creative: !currentMilestone ? 0 : Math.max(0, maxP - (currentMilestone.event_count?.participant ? currentMilestone.event_count?.participant.creative : 0)),
          personalGrowth: !currentMilestone ? 0 : Math.max(0, maxP - (currentMilestone.event_count?.participant ? currentMilestone.event_count?.participant.personal_growth : 0)),
          community: !currentMilestone ? 0 : Math.max(0, maxP - (currentMilestone.event_count?.participant ? currentMilestone.event_count?.participant.community : 0)),
        }
      });
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
      this.$nextTick(() => {
        const table = $('#unitReportTable').DataTable({
          destroy: true,
          data: this.tableData,
          pageLength: 250,
          columns: [
            { title: "Name", data: 'name' },
            { title: "Milestone", data: 'milestone' },
            { title: "Leads", data: 'leads' },
            { title: "Assists", data: 'assists' },
            { title: "Outdoors", data: 'outdoors' },
            { title: "Creative", data: 'creative' },
            { title: "Personal Growth", data: 'personalGrowth' },
            { title: "Community", data: 'community' }
          ],
          columnDefs: [{ targets: [1, 2, 3, 4, 5, 6, 7], className: "dt-body-center" }],
          dom: "rt",
          buttons: [
            "csv",
            {
              extend: "print",
              customize: function (win: Window|string): any {
                win = win as Window;
                const css = `
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    background-color: #4CAF50;
                    color: white;
                }
            `;

                // Create a style element
                const style = document.createElement("style");
                style.type = "text/css";
                style.appendChild(document.createTextNode(css));

                // Append the style element to the head of the print window
                $((win).document.head).append(style);

                $((win).document.body)
                  .css("font-family", "Arial, sans-serif")
                  .css("font-size", "12pt");
                $((win).document.body)
                  .find("table")
                  .addClass("compact")
                  .css("font-size", "inherit");
                $((win).document.body)
                  .find("h1")
                  .css("text-align", "center");
                $((win).document.body)
                  .find("hr")
                  .css("border-top", "1px solid #bbb");
              },
            },
          ],
          searching: false,
          paging: false,
        });
        const $buttonsDiv = $("#Buttons");
        const buttonClasses = "mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn";

        // Create Print Button
        $("#printButton").remove();
        $("<button/>", {
          text: "Print",
          id: "printButton",
          class: buttonClasses,
          click: ()=> {
            table.button(".buttons-print").trigger();
          },
        }).appendTo($buttonsDiv);

        // Create CSV Button
        $("#csvButton").remove();
        $("<button/>", {
          text: "Export to CSV",
          id: "csvButton",
          class: buttonClasses,
          click: ()=> {
            table.button(".buttons-csv").trigger();
          },
        }).appendTo($buttonsDiv);
      });
    } catch (error) {
      console.log(error);
    }
  },
  mounted() {

  },
  beforeDestroy() {
    $(this.$el).find('table').DataTable().destroy(true);
  },
});
</script>

<style scoped>

</style>