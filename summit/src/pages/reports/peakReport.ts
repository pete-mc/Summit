import { SummitContext } from "../../summitContext";
import { fetchUnitMembersMetrics } from "../../terrainCalls";
import $ from "jquery";
//import jszip from "jszip";
//import pdfmake from "pdfmake";
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
import { PeakReportHtml } from "../pageIndex";

export async function peakReport() {
  const context = SummitContext.getInstance();
  const unitMembers = await fetchUnitMembersMetrics();
  if (!unitMembers || !context.currentProfile) {
    $("#loadingP").text(
      "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
    );
    $("#retry").remove();
    $("#guthub").remove();
    $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
    // button to access github issues list
    $("#loadingP").after(
      '<a id="guthub" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
    );
    $("#retry").on("click", async function () {
      !context.currentProfile ? await context.getData() : undefined;
      $("#summitContentDiv").replaceWith(PeakReportHtml);
      peakReport();
    });
    return;
  }
  $("#peakHeader").text(context.currentProfile.unit.name);
  $("#loadingP").remove();
  $("#retry").remove();
  $("#guthub").remove();
  const tableData = unitMembers.map((r) => {
    const maxP = r.milestone.milestone == 1 ? 6 : r.milestone.milestone == 2 ? 5 : 4;
    const maxL = r.milestone.milestone == 1 ? 2 : r.milestone.milestone == 2 ? 3 : 4;
    const maxA = r.milestone.milestone == 1 ? 1 : r.milestone.milestone == 2 ? 2 : 4;
    return [
      r.name,
      r.peak_award.total + "%",
      r.milestone.milestone == 3 && r.milestone.awarded ? "✓" : r.milestone.milestone == 3 ? "..." : "-",
      r.milestone.milestone == 3 ? maxL - r.milestone.total_leads : "-",
      r.milestone.milestone == 3 ? maxA - r.milestone.total_assists : "-",
      r.milestone.milestone == 3 ? maxP - (r.milestone.participates.find((p) => p.challenge_area == "outdoors")?.total ?? 0) : "-",
      r.milestone.milestone == 3 ? maxP - (r.milestone.participates.find((p) => p.challenge_area == "creative")?.total ?? 0) : "-",
      r.milestone.milestone == 3 ? maxP - (r.milestone.participates.find((p) => p.challenge_area == "personal_growth")?.total ?? 0) : "-",
      r.milestone.milestone == 3 ? maxP - (r.milestone.participates.find((p) => p.challenge_area == "community")?.total ?? 0) : "-",
      r.sia.in_progress,
      r.sia.completed_projects,
      r.oas.total_progressions,
      r.oas.highest.filter((o) => o.stream == "bushcraft")[0]?.stage.toString() ?? "-",
      r.oas.highest.filter((o) => o.stream == "bushwalking")[0]?.stage.toString() ?? "-",
      r.oas.highest.filter((o) => o.stream == "camping")[0]?.stage.toString() ?? "-",
      r.intro_to_scouts ? "✓" : "-",
      r.intro_to_section ? "✓" : "-",
      r.personal_development ? "✓" : "-",
      r.personal_reflection ? "✓" : "-",
      r.adventurous_journey ? "✓" : "-",
    ];
  });
  const table = $("#progressReportTable").DataTable({
    destroy: true,
    data: tableData,
    pageLength: 25,
    columns: [
      { title: "Name" },
      { title: "Progress" },
      { title: "Milestone 3" },
      { title: "Leads" },
      { title: "Assists" },
      { title: "Outdoors" },
      { title: "Creative" },
      { title: "Personal <br>Growth" },
      { title: "Community" },
      { title: "SIA <br>In Progress" },
      { title: "SIA <br>Completed" },
      { title: "Progressions" },
      { title: "Bushcraft" },
      { title: "Bushwalking" },
      { title: "Camping" },
      { title: "Scouts" },
      { title: "Section" },
      { title: "Personal <br>Development" },
      { title: "Reflection" },
      { title: "Journey" },
    ],
    columnDefs: [{ targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], className: "dt-body-center" }],
    order: [[1, "desc"]],
    dom: "rt",
    buttons: [
      "csv",
      {
        extend: "print",
        customize: function (win) {
          const css = `
          @page { size: A3 landscape; }
          * { -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          color-adjust: exact !important; }
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
  $("#printButton").remove();
  $("<button/>", {
    text: "Print",
    id: "printButton",
    class: buttonClasses,
    click: function () {
      table.button(".buttons-print").trigger();
    },
  }).appendTo($buttonsDiv);

  // Create CSV Button
  $("#csvButton").remove();
  $("<button/>", {
    text: "Export to CSV",
    id: "csvButton",
    class: buttonClasses,
    click: function () {
      table.button(".buttons-csv").trigger();
    },
  }).appendTo($buttonsDiv);

  $("head").append(`
    <style type="text/css" id="myStyle">
      #progressReportTable th:nth-of-type(n+2) {
        writing-mode: vertical-rl;
      }
      #progressReportTable .sorting {
        background-image:none !important;
      }
      #progressReportTable.dataTable thead th, #progressReportTable.dataTable thead td {
        padding: 0px 0px !important;
      }
    </style>
    `);
}
