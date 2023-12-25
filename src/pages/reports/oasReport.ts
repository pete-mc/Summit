import { SummitContext } from "../../summitContext";
import { fetchUnitMembers } from "../../terrainCalls";
import $ from "jquery";
import oasReportHTML from "raw-loader!./oasReport.html";

export const oasReportHtml = oasReportHTML;

export async function oasReport() {
  const context = SummitContext.getInstance();
  $("#oasReportTable").hide();
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
      oasReport();
    });
    return;
  }
  $("#peakHeader").text(context.currentProfile.profiles[0].unit.name);
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
  $("#oasReportTable").DataTable({
    destroy: true,
    data: tableData,
    pageLength: 25,
    order: [[1, "desc"]],
    dom: "Bfrtip",
    // buttons: ["excel", "pdf"],
    searching: false,
    paging: false,
  });
}
