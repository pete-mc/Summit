import { SummitAddSreensMessage, SummitOnLoadMessage, SummitRouteChangeMessage, SummitScreen } from "../typings/summitTypes";
import { clearCache } from "./helpers";
import { SummitContext } from "./summitContext";
import summitMenuGroupHtml from "raw-loader!./content/navBarListGroup.html";
import logo from "raw-loader!./content/logo.txt";
import homeHtml from "raw-loader!./pages/home/home.html";
import { fetchUnitMembers } from "./terrainCalls";
import { initLogbookRead, initLogbookWrite } from "./terrainButtons/copyLogbook";
import { initProgrammingExportBtn } from "./terrainButtons/exportiCal";
import $ from "jquery";
import { homePageLoaded } from "./pages/home/home";
import { MileStonePlanningReport, msPlanningReportHtml } from "./pages/reports/milestonePlanning";
import { bulkCalendar, bulkCalendarHtml } from "./pages/tools/bulkCalendar";
import { oasReport, oasReportHtml } from "./pages/reports/oasReport";
import { progressReport, progressReportHtml } from "./pages/reports/progressReport";

export class SummitPageManager {
  private static instance: SummitPageManager;
  public pages: SummitPage[] = [
    new SummitPage("fa52775b-b30c-4e56-83ce-918411303373", "Summit Home", "Summit Home", "/summit", homeHtml, homePageLoaded),
    new SummitPage("7a806481-4360-4ecc-aa00-89095156696a", "Milestone Planning Report", "Milestone Planning", "/summit/reports/msplanreport", msPlanningReportHtml, MileStonePlanningReport),
    new SummitPage("7c61d365-35f1-4913-96f2-a95df14f0ab6", "OAS Summary Report", "OAS Summary Report", "/summit/reports/oasreport", oasReportHtml, oasReport),
    new SummitPage("421a1b85-bcf7-4cf0-a03a-1405b96ad5a9", "Peak Award Progress Report", "Peak Award Progress Report", "/summit/reports/oasreport", progressReportHtml, progressReport),
    new SummitPage("717466bd-3c85-41c8-9212-dc1c295cf7c0", "Bulk Calendar", "Bulk Calendar", "/summit/tools/bulkcal", bulkCalendarHtml, bulkCalendar),
  ];
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
    this.context.summitMessageHandlers.push({ type: "terrainLoaded", handler: () => this.submitAllPages() });
    this.context.summitMessageHandlers.push({ type: "onloadSummit", handler: (data) => this.onPageLoad(data as SummitOnLoadMessage) });
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
    const database = indexedDB.open("TerrainSummit", 1);
    database.onsuccess = () => {
      database.result.transaction([store], "readwrite").objectStore(store).put(item).onsuccess = () => {
        database.result.close();
      };
    };
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

    if ($("#SummitMainMenu").length === 0 && $("nav").length > 0) this.setupMenu();

    if (route.startsWith("/summit")) {
      $("#SummitMainMenu").show();
      $("#TerrainMainMenu").hide();
      $("#SummitBreadcrumbs").show();
      $("#TerrainBreadcrumbs").hide();
    } else {
      $("#SummitMainMenu").hide();
      $("#TerrainMainMenu").show();
      $("#SummitBreadcrumbs").hide();
      $("#TerrainBreadcrumbs").show();
    }
  }

  public checkElements(query: string, id: string): boolean {
    if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext()) return !document.getElementById(id);
    return false;
  }

  private setupMenu() {
    $(TerrainClass.MainMenuClass).first().attr("id", "TerrainMainMenu").clone().attr("id", "SummitMainMenu").css("background-color", "#004C00").appendTo("nav").first();
    $("#SummitMainMenu").show();
    $("#TerrainMainMenu").hide();
    $("#SummitMainMenu")
      .find(TerrainClass.MenuItemHeader)
      .first()
      .html(`<div style="color:white; display: grid; place-items: center;"><img width="40px" src ="data:image/webp;base64,` + logo + `"><b>Summit &nbsp|&nbsp Terrain</b></div>`);
    const menuItem = $("#SummitMainMenu").find(TerrainClass.MenuItemClass).first().attr("id", "SummitMenuItem").hide();
    menuItem.find("a").each((index, element) => {
      $(element).replaceWith($(element).children());
    });
    menuItem.children().addClass("summit-menu").children().addClass("summit-menu");
    menuItem.find(TerrainClass.MenuItemTextClass).attr("id", "SummitMenuItemValue").text("MENU ITEM");
    menuItem.siblings().remove();
    const groupedPages: { [key: string]: SummitPage[] } = {};
    const topLevelPages: SummitPage[] = [];
    this.pages.forEach((page) => {
      const path = page.path.replace("/summit/", "/").split("/").slice(1);
      if (path.length === 1) {
        topLevelPages.push(page);
      } else {
        const group = path[0];
        if (!groupedPages[group]) groupedPages[group] = [];
        groupedPages[group].push(page);
      }
    });
    topLevelPages.forEach((page) => {
      this.createMenuItem(menuItem, page.pageid, page.title, page.path, menuItem.parent());
    });
    const menuGroupItems = `<div class="v-list-item__content NavMenu__subitem-content summit-menu"><div class="v-list-item__title">PAGETITLE</div></div>`;
    Object.keys(groupedPages).forEach((key) => {
      $(
        summitMenuGroupHtml
          .replace("SummitMenuGroup-", "SummitMenuGroup-" + key)
          .replace("SummitMenuGroupItems-", "SummitMenuGroupItems-" + key)
          .replace("GROUPTITLE", key.charAt(0).toUpperCase() + key.slice(1)),
      ).appendTo(menuItem.parent());
      $("#SummitMenuGroupItems-" + key).hide();
      $("#SummitMenuGroup-" + key).on("click", () => {
        $("#SummitMenuGroup-" + key)
          .children()
          .hasClass("v-list-group--active");
        $("#SummitMenuGroup-" + key)
          .children()
          .toggleClass("v-list-group--active")
          .children()
          .toggleClass("v-list-group__header--active")
          .attr("aria-expanded", function (index, attr) {
            return attr === "true" ? "false" : "true";
          })
          .find("i");
        //.toggleClass("mdi-chevron-down mdi-chevron-up");
        $("#SummitMenuGroupItems-" + key).toggle();
      });
      groupedPages[key].forEach((page) => {
        const groupItem = $(menuGroupItems.replace("PAGEROUTE", page.path).replace("PAGETITLE", page.title)).attr("id", `SummitGroupItem-${page.pageid}`);
        groupItem.on("click", () => this.context.changePage(page.path));
        $("#SummitMenuGroupItems-" + key).append(groupItem);
      });
    });
    this.createMenuItem(menuItem, "summitMenu", "Terrain | Summit", "/summit", $("#TerrainMainMenu").find(TerrainClass.MenuItemClass).first().parent());
    this.createMenuItem(menuItem.css("background-color", "#071e57").children().removeClass("summit-menu").children().removeClass("summit-menu").parent().parent(), "terrainMenu", "Back to Scouts | Terrain", "/basecamp", menuItem.parent());
    const footer = $("footer").find("a").first().clone().prependTo($("footer").find("a").first().parent()).attr({ href: "https://github.com/pete-mc/Summit/issues", target: "_blank" });
    footer.find(".Icon__label").text("Summit Support").attr("style", "color: green;");
    footer.find(".Icon__image").attr("src", "data:image/webp;base64," + logo);
  }

  private createMenuItem(menuItem: JQuery<HTMLElement>, id: string, title: string, path: string, parent: JQuery<HTMLElement>): void {
    const newMenuItem = menuItem.clone().show();
    newMenuItem.attr("id", `SummitMenuItem-${id}`);
    newMenuItem.find(TerrainClass.MenuItemTextClass).attr("id", `SummitMenuItemValue-${id}`).text(title);
    newMenuItem.on("click", () => {
      this.context.changePage(path);
    });
    parent.append(newMenuItem);
  }

  private onPageLoad(message: SummitOnLoadMessage) {
    const page = this.pages.find((page) => page.pageid === message.id);
    if (page) {
      this.setBreadCrumb(page);
      page.executeOnLoad();
    }
  }

  private setBreadCrumb(page: SummitPage) {
    if ($("#SummitBreadcrumbs").length === 0) {
      $(".AppBar__breadcrumbs").attr("id", "TerrainBreadcrumbs").first().clone().attr("id", "SummitBreadcrumbs").hide().appendTo($("#TerrainBreadcrumbs").parent());
    }
    const appbar = $("#SummitBreadcrumbs");
    const firstItem = appbar.find(".v-breadcrumbs__item").first().parent();
    firstItem.siblings().remove();
    const divider = $(`<li class="v-breadcrumbs__divider">•</li>`);
    page.path
      .slice(1)
      .split("/")
      .forEach((path, index, array) => {
        if (path === "summit") path = "/summit";
        if (path === "") return;
        if (array.length === 1) {
          appbar.find(".v-breadcrumbs__item").text(page.breadcrumb).addClass("v-breadcrumbs__item--disabled v-breadcrumbs__item--disabled").removeAttr("href");
          return;
        }
        let clonedItem = undefined;
        if (index > 0) {
          appbar.append(divider.clone());
          clonedItem = firstItem.clone();
        } else {
          clonedItem = firstItem;
        }
        let clonedA = clonedItem.find("a").first();
        clonedA.removeAttr("href");
        if (clonedA.length === 0) {
          clonedA = $(`<a class="v-breadcrumbs__item v-breadcrumbs__item--disabled v-breadcrumbs__item--disabled"></a>`);
          clonedItem.append(clonedA);
        }
        if (index === array.length - 1) {
          clonedA.text(page.breadcrumb);
          clonedA.addClass("v-breadcrumbs__item v-breadcrumbs__item--disabled v-breadcrumbs__item--disabled");
          appbar.append(clonedItem);
          return;
        }
        const parentPage = this.pages.find((page) => page.path === path);
        clonedA.text(parentPage ? parentPage.breadcrumb : path.charAt(0).toUpperCase() + path.slice(1));
        if (parentPage) {
          clonedA.on("click", () => this.context.changePage(parentPage.path));
          clonedA.removeClass("v-breadcrumbs__item--disabled v-breadcrumbs__item--disabled");
        } else {
          clonedA.addClass("v-breadcrumbs__item--disabled v-breadcrumbs__item--disabled");
        }
        appbar.append(clonedItem);
      });
  }
}

class SummitPage {
  public pageid: string;
  public title: string;
  public breadcrumb: string;
  public path: string;
  public html: string;
  public onload: () => void;
  constructor(pageid: string, title: string, breadcrumb: string, path: string, html: string, onloadSummit: () => void) {
    this.pageid = pageid;
    this.title = title;
    this.breadcrumb = breadcrumb;
    this.path = path;
    this.html = html;
    this.onload = onloadSummit;
  }
  public executeOnLoad() {
    if (this.onload) {
      this.onload();
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

enum TerrainClass {
  MainMenuClass = ".v-navigation-drawer__content",
  MenuItemClass = ".NavMenu__menu-group",
  MenuItemTextClass = ".v-list-item__title",
  MenuItemHeader = ".NavMenu__header",
}
