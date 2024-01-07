import { SummitContext } from "../../summitContext";
import { fetchUnitMembersMetrics } from "../../terrainCalls";
import $ from "jquery";
import "jszip";
import "pdfmake";
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

export async function oasReport() {
  const context = SummitContext.getInstance();
  $("#oasReportTable").hide();
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
      oasReport();
    });
    return;
  }
  $("#peakHeader").text(context.currentProfile.unit.name);
  $("#loadingP").remove();
  $("#retry").remove();
  $("#guthub").remove();
  $("#oasReportTable").show();
  const tableData = unitMembers.map((r) => {
    return [
      r.name,

      r.oas.highest
        .filter((o) => o.stream == "bushwalking")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "bushcraft")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "camping")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",

      r.oas.highest
        .filter((o) => o.stream == "apline")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "cycling")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "vertical")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",

      r.oas.highest
        .filter((o) => o.stream == "aquatics")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "boating")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
      r.oas.highest
        .filter((o) => o.stream == "paddling")
        .map((b) => "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace("-", " ").replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) + "</span></center>")
        .join("<br>") ?? "-",
    ];
  });
  const table = $("#oasReportTable").DataTable({
    destroy: true,
    data: tableData,
    pageLength: 25,
    order: [[1, "desc"]],
    dom: "rt",
    buttons: [
      {
        extend: "csv",
        text: "Export CSV",
        exportOptions: {
          format: {
            body: function (data: string | JQuery.Node | ((this: HTMLElement, index: number, oldhtml: string) => string | JQuery.Node)) {
              // Strip HTML and extract text
              let text = $("<div>").html(data).text();

              // Replace numbers followed by text with a space in between
              text = text.replace(/(\d+)([^\d\s]+)/g, "$1 $2"); // Number followed by text
              text = text.replace(/([^\d\s]+)(\d+)/g, "$1 $2"); // Text followed by number

              return text;
            },
          },
        },
      },
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
                    text-align: center;
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
                .custom-cell {
                    text-align: center;
                    line-height: 0.7;
                }
                .custom-cell b {
                    font-weight: bold;
                }
                .custom-cell span {
                    font-size: small;
                }
            `;

          // Create and append the style element
          const style = document.createElement("style");
          style.type = "text/css";
          style.appendChild(document.createTextNode(css));
          (win as Window).document.head.appendChild(style);

          // Iterate over each cell to apply custom classes
          $((win as Window).document.body)
            .find("table tr")
            .each(function () {
              $(this)
                .find("td")
                .each(function () {
                  if (this.innerHTML.includes("<center")) {
                    this.innerHTML = this.innerHTML.replace(/<center[^>]*>/g, '<div class="custom-cell">').replace(/<\/center>/g, "</div>");
                  }
                });
            });
          // Apply changes to each table row in the print view
          $((win as Window).document.body)
            .find("table tr")
            .each(function () {
              // Iterate over each cell except the first one
              $(this)
                .find("td:not(:first-child)")
                .each(function () {
                  // Check if the cell contains numbers
                  const text = $(this).text();
                  if (/\d/.test(text)) {
                    // Split the text by numbers
                    const parts = text.split(/(\d+)/).filter(Boolean);
                    let newText = "";

                    // Format each part
                    parts.forEach(function (part, index) {
                      if (/\d/.test(part)) {
                        // If it's a number, wrap in <b> and possibly prefix with <br>
                        newText += (index > 0 ? "<br>" : "") + "<b>" + part + "</b><br>";
                      } else {
                        newText += part;
                      }
                    });

                    // Update the HTML of the cell
                    $(this).html(newText);
                  }
                });
            });
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
}
