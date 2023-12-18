import { SummitContext } from "../summitContext";
import { summitLoadPage } from "../summitMenu";
import { fetchUnitMembers } from "../terrainCalls";
import $ from "jquery";

export async function progressReport() {
  const context = SummitContext.getInstance();
  summitLoadPage(
    "SUMMIT REPORTS - PEAK AWARD PROGRESS REPORT", //Breadcrumb header
    //html content is contained within the two backticks ` below
    `
    <h2 id="peakHeader"></h2>
    This report will show the current progress towards the peak award for each member for the section.<br><br>
    <p id="loadingP">Loading Please Wait...</p>
    <table id="progressReportTable" class="display" width="100%"></table>
  `,
  );
  if (!context.currentProfile || !context.token) {
    $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
    $("#peakHeader").text("Milestone Planning Report");
    return;
  }
  $("#peakHeader").text(context.currentProfile.profiles[0].unit.name);

  const unitMembers = await fetchUnitMembers(context);
  if (!unitMembers) {
    $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
    $("#peakHeader").text("Milestone Planning Report");
    return;
  }

  $("#loadingP").remove();
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
  $("#progressReportTable").DataTable({
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
      { title: "Personal<br>Growth" },
      { title: "Community" },
      { title: "SIA<br>In Progress" },
      { title: "SIA<br>Completed" },
      { title: "Progressions" },
      { title: "Bushcraft" },
      { title: "Bushwalking" },
      { title: "Camping" },
      { title: "Scouts" },
      { title: "Section" },
      { title: "Personal<br>Development" },
      { title: "Reflection" },
      { title: "Journey" },
    ],
    columnDefs: [{ targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], className: "dt-body-center" }],
    order: [[1, "desc"]],
  });

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
