import { initCache } from "./helpers";
import { SummitContext } from "./summitContext";
import { createSummitReportMenuItem, summitMenu } from "./summitMenu";
import { initLogbookRead, initLogbookWrite } from "./terrainButtons/copyLogbook";
import { initProgrammingExportBtn } from "./terrainButtons/exportiCal";
import { fetchUnitMembers } from "./terrainCalls";
import summitTerrainContext from 'raw-loader!./content/summitTerrainContext.js';
import $ from 'jquery';

if (SummitContext.getInstance().buildMode === "dev") debugger;

async function initSummit(){
    let context = SummitContext.getInstance();
    context.log("Start");

    // Setup Terrain Context
    $(`<button style="display: none;" onclick="${summitTerrainContext.replaceAll('"', "'").replace(/^(.*\n){2}/, '')}"/>`).appendTo('body').trigger('click').remove();

    // Setup Summit Context
    

    initCache();
    context.addTerrainRouteChangeHandler(async (newRoute: string) =>{
        if (newRoute === "/"){
            context.loggedin = false;
            return;
        }
        else if (!context.loggedin) {
            context.loggedin = true;
            await context.getData();
            fetchUnitMembers(context);
        }
        startSummitChecks(newRoute);
    });

    function startSummitChecks(route: string) {
        switch (route) {
            case "/logbook/view-record":
            if (checkPage(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, "copyClipboardBtn"))
                initLogbookRead();
            break;
            case "/logbook":
            if (checkPage(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, "writeClipboardBtn"))
                initLogbookWrite();
            break;
            case "/programming/view-activity":
            if (checkPage(`//button[@data-cy='PRINT']`, "exportiCalBtn"))
                initProgrammingExportBtn();
            break;
        }
        if (checkPage(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'NavMenu__menu-container')]`, "summitReportsMenu-summitMenu")) {
            createSummitReportMenuItem(false, () => summitMenu(context), "Terrain | Summit", "summitMenu");
        }
    }

    function checkPage(query: string, id: string): boolean {
        if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext())
            return !document.getElementById(id);
        return false;
    }

}

window.onload = function() {
   initSummit();
};
