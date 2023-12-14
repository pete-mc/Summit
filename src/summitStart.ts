import { initCache, throttle } from "./helpers";
import { SummitContext } from "./summitContext";
import { createSummitReportMenuItem, summitMenu } from "./summitMenu";
import { initLogbookRead, initLogbookWrite } from "./terrainButtons/copyLogbook";
import { initProgrammingExportBtn } from "./terrainButtons/exportiCal";
import { fetchUnitMembers } from "./terrainCalls";
import $ from 'jquery';

async function initSummit(){
    console.log("Summit Start");
    const summitContext = new SummitContext();
    initCache();
    summitContext.addTerrainRouteChangeHandler(async (newRoute: string) =>{
        if (newRoute === "/"){
            summitContext.loggedin = false;
            return;
        }
        else if (!summitContext.loggedin) {
            summitContext.loggedin = true;
            await summitContext.getData();
            fetchUnitMembers(summitContext);
        }
        startSummitChecks(newRoute);
    });

    // Initial call
    //startSummitChecks("notusre");


    function startSummitChecks(route: string) {

    /// REMOVE DELAYS IF TEST WORKS!!!

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
            createSummitReportMenuItem(false, () => summitMenu(summitContext), "Terrain | Summit", "summitMenu");
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
