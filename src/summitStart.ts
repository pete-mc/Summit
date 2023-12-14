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
    await summitContext.getData();
    let loc: string = "";

    // Initialise the cache
    initCache();
    // Start loading unit members into cache
    fetchUnitMembers(summitContext);

    // Throttled version of checkLocation
    const throttledCheckLocation = throttle(checkLocation, 100);

    // Window event Listeners
    window.addEventListener("click", throttledCheckLocation);
    window.addEventListener("hashchange", throttledCheckLocation);
    window.addEventListener("popstate", throttledCheckLocation);
    window.addEventListener("load", throttledCheckLocation);
    setInterval(throttledCheckLocation, 100);

    // Initial call
    startSummitChecks();

    // Function Definitions
    function checkLocation() {
    if (location.href !== loc) {
        loc = location.href;
        startSummitChecks();
    }
    }

    function startSummitChecks() {
    const pathname = location.pathname;
    switch (pathname) {
        case "/logbook/view-record":
        if (checkPage(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, "copyClipboardBtn", 100))
            initLogbookRead();
        break;
        case "/logbook":
        if (checkPage(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, "writeClipboardBtn", 20))
            initLogbookWrite();
        break;
        case "/programming/view-activity":
        if (checkPage(`//button[@data-cy='PRINT']`, "exportiCalBtn", 20))
            initProgrammingExportBtn();
        break;
    }
    if (checkPage(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'NavMenu__menu-container')]`, "summitReportsMenu-summitMenu", 20)) {
        createSummitReportMenuItem(false, () => summitMenu(summitContext), "Terrain | Summit", "summitMenu");
    }
    }

    function checkPage(query: string, id: string, delay: number): boolean {
    if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext())
        return !document.getElementById(id);
    setTimeout(() => { startSummitChecks(); }, delay);
    return false;
    }
}

initSummit();
