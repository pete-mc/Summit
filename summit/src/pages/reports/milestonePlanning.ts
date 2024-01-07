import { SummitContext } from "../../summitContext";
import { fetchUnitMembersMetrics } from "../../terrainCalls";
import msPlanningReportHTML from "raw-loader!./milestonePlanning.html";
import $ from "jquery";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import jszip from "jszip";
//import DataTable from "datatables.net-se";
//import Editor from "@datatables.net/editor-se";
import "datatables.net-se";
import "datatables.net-buttons-se";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
//import DateTime from "datatables.net-datetime";
import "datatables.net-fixedheader-se";
import "datatables.net-responsive-se";
import "datatables.net-rowgroup-se";
import "datatables.net-select-se";

export async function mileStonePlanningReport() {
  const context = SummitContext.getInstance();
  const unitMembers = await fetchUnitMembersMetrics();
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
      mileStonePlanningReport();
    });
    return;
  }
  $("#milestoneHeader").text(context.currentProfile.unit.name);
  if ($("#milestoneHeader").data("loaded")) return;
  $("#milestoneHeader").data("loaded", true);
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

  const table = $("#unitReportTable").DataTable({
    destroy: true,
    data: tableData,
    pageLength: 250,
    columns: [{ title: "Name" }, { title: "Milestone" }, { title: "Leads" }, { title: "Assists" }, { title: "Outdoors" }, { title: "Creative" }, { title: "Personal Growth" }, { title: "Community" }],
    columnDefs: [{ targets: [1, 2, 3, 4, 5, 6, 7], className: "dt-body-center" }],
    dom: "rt",
    buttons: [
      "csv",
      {
        extend: "print",
        customize: function (win) {
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
          $((win as Window).document.head).append(style);

          $((win as Window).document.body)
            .css("font-family", "Arial, sans-serif")
            .css("font-size", "12pt");
          $((win as Window).document.body)
            .find("table")
            .addClass("compact")
            .css("font-size", "inherit");
          $((win as Window).document.body)
            .find("h1")
            .css("text-align", "center");
          $((win as Window).document.body)
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
  $("<button/>", {
    text: "Print",
    id: "printButton",
    class: buttonClasses,
    click: function () {
      table.button(".buttons-print").trigger();
    },
  }).appendTo($buttonsDiv);

  // Create CSV Button
  $("<button/>", {
    text: "Export to CSV",
    id: "csvButton",
    class: buttonClasses,
    click: function () {
      table.button(".buttons-csv").trigger();
    },
  }).appendTo($buttonsDiv);

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
