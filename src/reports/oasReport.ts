import { TerrainUnitMember } from "../../typings/terrainTypes";
import { SummitContext } from "../summitContext";
import { summitLoadPage } from "../summitMenu";
import { fetchUnitMembers } from "../terrainCalls";
import $ from 'jquery';

export async function oasReport(retry: number = 1, context: SummitContext){
  //load the inital html content into the container
  if(context.currentProfile.Error){
    summitLoadPage("ERROR","This is a summit error. Please do not contact Terrain support for this issue. <br><br>Details:<br>" + JSON.stringify(context.currentProfile.Error));
    return;
  }
  summitLoadPage(
    "SUMMIT REPORTS - OAS REPORT", //Breadcrumb header
  //html content is contained within the two backticks ` below
  `
    <h2>${context.currentProfile.profiles[0].unit.name}</h2>
    This report will show all of the currently held OAS levels for each member of the section.<br><br>
    <p id="loadingP">Loading Please Wait...</p>
    <table id="oasReportTable" class="display" width="100%">
      <thead>
            <tr>
                <th rowspan="2">Name</th>
                <th colspan="3">Core Skills</th>
                <th colspan="3">Land Specialist</th>
                <th colspan="3">Water Specialist</th>
            </tr>
            <tr>
                <th>Bushwalking</th>
                <th>Bushcraft</th>
                <th>Camping</th>
                <th>Alpine</th>
                <th>Cycling</th>
                <th>Vertical</th>
                <th>Aquatics</th>
                <th>Boating</th>
                <th>Paddling</th>
            </tr>
        </thead>
    </table>
  `);
  $("#oasReportTable").hide();
  let unitMembers = [] as TerrainUnitMember[];
  try{
    unitMembers = await fetchUnitMembers(context);
  }catch(error){
    retry = retry ?? 1;
    if (retry > 3) {
      console.debug("Data load failed retry attempt: " + retry)
      oasReport(retry++, context);
      return;
    }
    else $("#loadingP").text("An error has occured please try again later. This is a Summit error. Please do not contact Terrain support for this issue.");
  }
  $("#loadingP").remove();
  $("#oasReportTable").show();
  const tableData = unitMembers.map(r=>{
    return [
    r.name,

    r.oas.highest.filter(o=>o.stream == "bushwalking").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "bushcraft").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "camping").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",

    r.oas.highest.filter(o=>o.stream == "apline").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "cycling").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "vertical").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",

    r.oas.highest.filter(o=>o.stream == "aquatics").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "boating").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
    r.oas.highest.filter(o=>o.stream == "paddling").map(b=> "<center style='line-height: 0.7'><b>" + b.stage + "</b><br><span style='font-size:small'>" + b.branch.replace('-',' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) + "</span></center>").join("<br>") ?? "-",
  ]});
  $('#oasReportTable').DataTable( {
    data: tableData,
    pageLength: 25,
    "order":[[1,"desc"]],
    dom: 'Bfrtip',
    buttons: [
      'excel', 'pdf'
    ]
  });
}
