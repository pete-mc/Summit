
async function testReport(){
  //load the inital html content into the container
  summitLoadPage(
    "SUMMIT REPORTS - TEST REPORT", //Breadcrumb header
  //html content is contained within the two backticks ` below
  `
    <h2>Test Report</h2>
    This is a sample report, note the data is hard coded and the chart and table are using unrelated data. This is just to show how to use the objects.
    <table id="myTable" class="display" width="100%"></table>
    <canvas id="myChart"></canvas>
  `)
  ;

/*--------------------------------------------------------------------
          TABLE EXAMPLE //see other datatables examples here: https://datatables.net/examples/index
  ----------------------------------------------------------------*/
  //load the data you want to report on into an array
  var dataSet = [
    [ "Michelle House", "Integration Specialist", "Sydney", "2769", "2011/06/02", "$95,400" ],
    [ "Suki Burks", "Developer", "London", "6832", "2009/10/22", "$114,500" ],
    [ "Prescott Bartlett", "Technical Author", "London", "3606", "2011/05/07", "$145,000" ],
    [ "Gavin Cortez", "Team Leader", "San Francisco", "2860", "2008/10/26", "$235,500" ],
    [ "Martena Mccray", "Post-Sales support", "Edinburgh", "8240", "2011/03/09", "$324,050" ],
    [ "Unity Butler", "Marketing Designer", "San Francisco", "5384", "2009/12/09", "$85,675" ]
];
 
//call datatables to populate the table NB: You need to ensure the data is fully loaded before calling this.

const editor = new DataTable.Editor({
  fields: [
      {
        label: 'Name',
        name: 'Name'
      },
      {
        label: 'Position',
        name: 'Position'
      },
      {
        label: 'Office',
        name: 'Office'
      },
      {
        label: 'Extn',
        name: 'Extn'
      },
      {
        label: 'Start',
        name: 'Start'
      },
      {
        label: 'Salary',
        name: 'Salary'
      }
  ],
  table: '#myTable'
});

$('#myTable').DataTable( {
    data: dataSet,
    buttons: [
      { extend: 'create', editor },
      { extend: 'edit', editor },
      { extend: 'remove', editor }
  ],
    columns: [
        { title: "Name" },
        { title: "Position" },
        { title: "Office" },
        { title: "Extn" },
        { title: "Start" },
        { title: "Salary" }
    ],
    dom: 'Bfrtip',
    select: true
} );

/*--------------------------------------------------------------------
          CHART EXAMPLE - Sample charts using same library: https://www.chartjs.org/docs/latest/samples/bar/vertical.html
  ----------------------------------------------------------------*/
//setup data object
const chartData = {
  labels: ['January', 'February', 'March', 'April','May','June'],
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45], //add data array
  }]
};

//setup config
const chartConfig = {
  type: 'line',
  data: chartData,
  options: {}
};

//create chart
const myChart = new Chart(
  document.getElementById('myChart'),
  chartConfig
);


}