
async function unitReport(retry){
  //load the inital html content into the container
  if(currentProfile.Error){
    summitLoadPage("ERROR","This is a summit error. Please do not contact Terrain support for this issue. <br><br>Details:<br>" + JSON.stringify(currentProfile.Error));
    return;
  }
  summitLoadPage(
    "SUMMIT REPORTS - MILESTONE PLANNING REPORT", //Breadcrumb header
  //html content is contained within the two backticks ` below
  `
    <h2>${currentProfile.profiles[0].unit.name}</h2>
    The milestones planning report is useful to see how many participates, leads and assists each member requires to complete their current milestone. Note that the numbers displayed are the remaining requrement not the current total.<br>
    <p id="loadingP">Loading Please Wait...</p>
    <table id="unitReportTable" class="display" width="100%"></table>
    <canvas id="myChart"></canvas>
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
      r.milestone.milestone, 
      maxL - r.milestone.total_leads, 
      maxA - r.milestone.total_assists, 
      maxP - r.milestone.participates.find(p=>p.challenge_area == 'outdoors').total,
      maxP - r.milestone.participates.find(p=>p.challenge_area == 'creative').total,
      maxP - r.milestone.participates.find(p=>p.challenge_area == 'personal_growth').total,
      maxP - r.milestone.participates.find(p=>p.challenge_area == 'community').total,
    ]})
    $('#unitReportTable').DataTable( {
      data: tableData,
      pageLength: 25,
      columns: [
        { title: "Name" },
        { title: "Milestone" },
        { title: "Leads" },
        { title: "Assists" },
        { title: "Outdoors" },
        { title: "Creative" },
        { title: "Personal Growth" },
        { title: "Community" },
      ],
      columnDefs: [
        {targets: [1,2,3,4,5,6,7], className: 'dt-body-center'}
      ]
    });

    //create chart
    const myChart = new Chart(
      document.getElementById('myChart'),
      {
        type: 'radar',
        data: {
          labels: ["Leads","Assists","Outdoors","Creative","Personal Growth", "Community"],
          datasets: tableData.map(p=> {
            const bgColor = getRandomColor(); return {label: p[0], data:[p[2],p[3],p[4],p[5],p[6],p[4]], borderColor: bgColor, backgroundColor: bgColor.replace(',1)',',0.3)')}
          }),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Milestone areas to complete (NB: Click name to remove from chart)'
            }
          }
        },
      }
    );
  })
  .catch((error) => {
    retry = retry ?? 0;
    if (retry > 3) {
      console.debug("Data load failed retry attempt: " + retry)
      unitReport(retry++);
    }
    else $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
  });

}