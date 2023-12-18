import { SummitContext } from "../summitContext";
import { summitLoadPage } from "../summitMenu";
import { fetchUnitMembers } from "../terrainCalls";
import $ from "jquery";

export async function unitReport() {
  const context = SummitContext.getInstance();
  summitLoadPage(
    "SUMMIT REPORTS - MILESTONE PLANNING REPORT", //Breadcrumb header
    //html content is contained within the two backticks ` below
    `
    <h2 id="milestoneHeader"></h2>
    The milestones planning report is useful to see how many participates, leads and assists each member requires to complete their current milestone. Note that the numbers displayed are the <b>remaining requrement</b> not the current total.<br>
    <p id="loadingP">Loading Please Wait...</p>
    <table id="unitReportTable" class="display" width="100%"></table>
    <canvas id="myChart"></canvas>
  `,
  );
  if (!context.currentProfile || !context.token) {
    $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
    $("#milestoneHeader").text("Milestone Planning Report");
    return;
  }
  $("#milestoneHeader").text(context.currentProfile.profiles[0].unit.name);

  const unitMembers = await fetchUnitMembers(context);
  if (!unitMembers) {
    $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
    $("#milestoneHeader").text("Milestone Planning Report");
    return;
  }
  $("#loadingP").text("");

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

  $("#unitReportTable").DataTable({
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
