
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
    The milestones planning report is useful to see how many participates, leads and assists each member requires to complete their current milestone. Note that the numbers displayed are the <b>remaining requrement</b> not the current total.<br>
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
    const tableData = data.results.map(r => {
      const maxP = r.milestone.milestone === 1 ? 6 : r.milestone.milestone === 2 ? 5 : 4;
      const maxL = r.milestone.milestone === 1 ? 2 : r.milestone.milestone === 2 ? 3 : 4;
      const maxA = r.milestone.milestone === 1 ? 1 : r.milestone.milestone === 2 ? 2 : 4;
    
      return [
        r.name,
        r.milestone.milestone,
        Math.max(0, maxL - r.milestone.total_leads),
        Math.max(0, maxA - r.milestone.total_assists),
        Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === 'outdoors')?.total || 0)),
        Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === 'creative')?.total || 0)),
        Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === 'personal_growth')?.total || 0)),
        Math.max(0, maxP - (r.milestone.participates.find(p => p.challenge_area === 'community')?.total || 0))
      ];
    });
    
    $('#unitReportTable').DataTable({
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
        { title: "Community" }
      ],
      columnDefs: [
        { targets: [1, 2, 3, 4, 5, 6, 7], className: 'dt-body-center' }
      ],
      dom: 'Bfrtip',
      buttons: [
        'excel', 'pdf'
      ]
    });
    
    // Prepare data for the stacked bar chart
    const chartLabels = ["Outdoors", "Creative", "Personal Growth", "Community"];
    const chartData = {
      labels: chartLabels,
      datasets: tableData.map((p, index) => {
        const bgColor = getRandomColor();
        return {
          label: p[0],
          data: [p[4], p[5], p[6], p[7]],
          backgroundColor: bgColor
        };
      })
    };

    const myChart = new Chart(document.getElementById('myChart'), {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Milestone areas to complete for the unit by member'
          }
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            beginAtZero: true,
            stacked: true
          }
        }
      }
    });

    $("#loadingP").text("");

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