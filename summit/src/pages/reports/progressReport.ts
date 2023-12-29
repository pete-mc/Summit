import { SummitContext } from "../../summitContext";
import { fetchUnitMembersMetrics } from "../../terrainCalls";
import $ from "jquery";
import progressReportHTML from "raw-loader!./progressReport.html";
export const progressReportHtml = progressReportHTML;

export async function progressReport() {
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
      progressReport();
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
    searching: false,
    paging: false,
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
