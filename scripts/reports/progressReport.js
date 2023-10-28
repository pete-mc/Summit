async function progressReport(retry){
  //load the inital html content into the container
  if(currentProfile.Error){
    summitLoadPage("ERROR","This is a summit error. Please do not contact Terrain support for this issue. <br><br>Details:<br>" + JSON.stringify(currentProfile.Error));
    return;
  }
  summitLoadPage(
    "SUMMIT REPORTS - PEAK AWARD PROGRESS REPORT", //Breadcrumb header
  //html content is contained within the two backticks ` below
  `
    <h2>${currentProfile.profiles[0].unit.name}</h2>
    This report will show the current progress towards the peak award for each member for the section.<br><br>
    <p id="loadingP">Loading Please Wait...</p>
    <table id="progressReportTable" class="display" width="100%"></table>
  `)
  ;

  var dataSet = [];
  fetch("https://metrics.terrain.scouts.com.au/units/"+currentProfile.profiles[0].unit.id+"/members?limit=999", { //?limit=999
  method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
    },
    redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
  }).then(response => response.json())
  .then(data => {
    $("#loadingP").remove();
    console.debug(data.results);
    const tableData = data.results.map(r=>{
      maxP = r.milestone.milestone == 1 ? 6 : r.milestone.milestone == 2 ? 5 : 4;
      maxL = r.milestone.milestone == 1 ? 2 : r.milestone.milestone == 2 ? 3 : 4;
      maxA = r.milestone.milestone == 1 ? 1 : r.milestone.milestone == 2 ? 2 : 4;
      return [
      r.name,
      r.peak_award.total + "%",
      r.milestone.milestone == 3 && r.milestone.awarded ? "✓": r.milestone.milestone == 3 ? "...": "-", 
      r.milestone.milestone == 3 ? maxL - r.milestone.total_leads : "-", 
      r.milestone.milestone == 3 ? maxA - r.milestone.total_assists: "-",
      r.milestone.milestone == 3 ? maxP - r.milestone.participates.find(p=>p.challenge_area == 'outdoors').total : "-",
      r.milestone.milestone == 3 ? maxP - r.milestone.participates.find(p=>p.challenge_area == 'creative').total : "-",
      r.milestone.milestone == 3 ? maxP - r.milestone.participates.find(p=>p.challenge_area == 'personal_growth').total : "-",
      r.milestone.milestone == 3 ? maxP - r.milestone.participates.find(p=>p.challenge_area == 'community').total : "-",
      r.sia.in_progress,
      r.sia.completed_projects,
      r.oas.total_progressions,
      r.oas.highest.filter(o=>o.stream == "bushcraft")[0]?.stage.toString() ?? "-",
      r.oas.highest.filter(o=>o.stream == "bushwalking")[0]?.stage.toString() ?? "-",
      r.oas.highest.filter(o=>o.stream == "camping")[0]?.stage.toString() ?? "-",
      r.intro_to_scouts ? "✓" : "-",
      r.intro_to_section ? "✓" : "-",
      r.personal_development ? "✓" : "-",
      r.personal_reflection ? "✓" : "-",
      r.adventurous_journey ? "✓" : "-",
    ]});
    console.debug(tableData);
    $('#progressReportTable').DataTable( {
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
      columnDefs: [
        {targets: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], className: 'dt-body-center'}
      ],
      "order":[[1,"desc"]]
    });

    //add styles
    $("head").append(`
    <style type="text/css">
      th:nth-of-type(n+2) {
      writing-mode: vertical-rl;
      }
      .sorting
      {
        background-image:none !important;
      }
      table.dataTable thead th, table.dataTable thead td {
        padding: 0px 0px !important;
      }
    </style>
  }`);
  })
  .catch((error) => {
    if (retry < 3) {
      console.debug("Data load failed retry attempt: " + retry)
      unitReport(retry++);
    }
    else $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
  });

}
