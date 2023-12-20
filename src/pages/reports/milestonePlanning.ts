import DataTable from "datatables.net-dt";
import { SummitContext } from "../../summitContext";
import { fetchUnitMembers } from "../../terrainCalls";
import $ from "jquery";
import msPlanningReportHTML from "raw-loader!./milestonePlanning.html";

export const msPlanningReportHtml = msPlanningReportHTML;

export async function MileStonePlanningReport() {
  const context = SummitContext.getInstance();
  const unitMembers = await fetchUnitMembers();
  if (!unitMembers || !context.currentProfile) {
    $("#loadingP").text(
      "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
    );
    $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
    // button to access github issues list
    $("#loadingP").after(
      '<a id="guthub" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
    );
    $("#retry").on("click", async function () {
      !context.currentProfile ? await context.getData() : undefined;
      MileStonePlanningReport();
    });
    return;
  }
  $("#milestoneHeader").text(context.currentProfile.profiles[0].unit.name);
  $("#loadingP").remove();
  $("#retry").remove();
  $("#guthub").remove();

  // Get the milestone for each member
  const tableData = unitMembers.map((r) => {
    const maxP = r.milestone.milestone === 1 ? 6 : r.milestone.milestone === 2 ? 5 : 4;
    const maxL = r.milestone.milestone === 1 ? 2 : r.milestone.milestone === 2 ? 3 : 4;
    const maxA = r.milestone.milestone === 1 ? 1 : r.milestone.milestone === 2 ? 2 : 4;
    return [
      r.name,
      r.milestone.milestone,
      Math.max(0, maxL - r.milestone.total_leads),
      Math.max(0, maxA - r.milestone.total_assists),
      Math.max(0, maxP - (r.milestone.participates.find((p) => p.challenge_area === "outdoors")?.total || 0)),
      Math.max(0, maxP - (r.milestone.participates.find((p) => p.challenge_area === "creative")?.total || 0)),
      Math.max(0, maxP - (r.milestone.participates.find((p) => p.challenge_area === "personal_growth")?.total || 0)),
      Math.max(0, maxP - (r.milestone.participates.find((p) => p.challenge_area === "community")?.total || 0)),
    ];
  });

  new DataTable("#unitReportTable", {
    destroy: true,
    data: tableData,
    pageLength: 25,
    columns: [{ title: "Name" }, { title: "Milestone" }, { title: "Leads" }, { title: "Assists" }, { title: "Outdoors" }, { title: "Creative" }, { title: "Personal Growth" }, { title: "Community" }],
    columnDefs: [{ targets: [1, 2, 3, 4, 5, 6, 7], className: "dt-body-center" }],
    dom: "Bfrtip",
    buttons: ["excel", "pdf"],
  });

  // Prepare data for the stacked bar chart
  // const chartLabels = ["Outdoors", "Creative", "Personal Growth", "Community"];

  // const chartData = {
  //   labels: chartLabels,
  //   datasets: tableData.map((p) => {
  //     const bgColor = getRandomColor();
  //     return {
  //       label: p[0].toString(),
  //       data: [p[4], p[5], p[6], p[7]] as number[],
  //       backgroundColor: bgColor,
  //     };
  //   }),
  // };

  // const chartCanvas = document.getElementById('myChart') as HTMLCanvasElement;
  // Chart.register(ChartDataLabels, BarController, CategoryScale, LinearScale, BarElement);
  // const myChart = new Chart(chartCanvas, {
  //   type: 'bar',
  //   data: chartData,
  //   options: {
  //     responsive: true,
  //     plugins: {
  //       title: {
  //         display: true,
  //         text: 'Milestone areas to complete for the unit by member'
  //       },
  //       legend: {
  //         display: true,
  //       },
  //       datalabels: {
  //         color: '#000000',
  //         // display: function(context) {
  //         //   return context.datasetIndex === 0; // display labels only for the first dataset
  //         // },
  //         formatter: function(value, context) {
  //           return context.dataset.label;
  //         }
  //       }
  //     },
  //     scales: {
  //       x: {
  //         beginAtZero: true,
  //         stacked: true,
  //       },
  //       y: {
  //         beginAtZero: true,
  //         stacked: true
  //       }
  //     }
  //   }
  // });
}
