import { SummitAddSreensMessage, SummitRouteChangeMessage, SummitScreen } from "../typings/summitTypes";
import { clearCache } from "./helpers";
import { SummitContext } from "./summitContext";
import homeHtml from "raw-loader!./pages/home/home.html";
import { fetchUnitMembers } from "./terrainCalls";
import { initLogbookRead, initLogbookWrite } from "./terrainButtons/copyLogbook";
import { initProgrammingExportBtn } from "./terrainButtons/exportiCal";
import { createSummitReportMenuItem, summitMenu } from "./summitMenu";

export class SummitPageManager {
  private static instance: SummitPageManager;
  public pages: SummitPage[] = [new SummitPage("fa52775b-b30c-4e56-83ce-918411303373", "Home", "Home", "/summit", homeHtml, { name: "HomeOnLoad", func: () => {} })];
  private context: SummitContext = SummitContext.getInstance();
  constructor() {
    this.context.addTerrainRouteChangeHandler(async (message: SummitRouteChangeMessage) => {
      const newRoute = message.newRoute;
      if (newRoute === "/") {
        this.context.loggedin = false;
        this.context.currentProfile = undefined;
        clearCache();
        return;
      } else if (!this.context.loggedin) {
        this.context.loggedin = true;
        await this.context.getData();
        fetchUnitMembers();
      }
      this.onRouteChange(newRoute);
    });
  }

  public static getInstance(): SummitPageManager {
    if (!SummitPageManager.instance) {
      SummitPageManager.instance = new SummitPageManager();
    }
    return SummitPageManager.instance;
  }

  public submitAllPages() {
    this.pages.forEach((page) => {
      this.addPageToDB(page.screen, "SummitPages");
    });
    this.context.sendMessage({
      type: "addScreens",
      ids: this.pages.map((page) => page.pageid),
    } as SummitAddSreensMessage);
  }

  public addPageToDB(item: SummitScreen, store: string) {
    const transaction = this.context.database.result.transaction([store], "readwrite");
    const objectStore = transaction.objectStore(store);
    objectStore.put(item);
  }

  public getPageFromDB(key: string): Promise<SummitScreen> {
    return new Promise((resolve, reject) => {
      const transaction = this.context.database.result.transaction(["SummitPages"], "readonly");
      const objectStore = transaction.objectStore("SummitPages");
      const request = objectStore.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  public onRouteChange(route: string) {
    switch (route) {
      case "/logbook/view-record":
        if (this.checkElements(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, "copyClipboardBtn")) initLogbookRead();
        break;
      case "/logbook":
        if (this.checkElements(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, "writeClipboardBtn")) initLogbookWrite();
        break;
      case "/programming/view-activity":
        if (this.checkElements(`//button[@data-cy='PRINT']`, "exportiCalBtn")) initProgrammingExportBtn();
        break;
    }
    if (this.checkElements(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'NavMenu__menu-container')]`, "summitReportsMenu-summitMenu")) {
      createSummitReportMenuItem(false, () => summitMenu(), "Terrain | Summit", "summitMenu");
    }
  }

  public checkElements(query: string, id: string): boolean {
    if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext()) return !document.getElementById(id);
    return false;
  }
}

class SummitPage {
  public pageid: string;
  public title: string;
  public breadcrumb: string;
  public path: string;
  public html: string;
  public onload: { name: string; func: () => void };
  constructor(pageid: string, title: string, breadcrumb: string, path: string, html: string, onloadSummit: { name: string; func: () => void }) {
    this.pageid = pageid;
    this.title = title;
    this.breadcrumb = breadcrumb;
    this.path = path;
    this.html = html;
    this.onload = onloadSummit;
  }
  public executeOnLoad() {
    if (this.onload) {
      this.onload.func();
    }
  }
  public get screen(): SummitScreen {
    return {
      id: this.pageid,
      path: this.path,
      html: this.html,
    };
  }
}
