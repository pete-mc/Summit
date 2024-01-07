import { BulkCalendarHtml, HomeHtml, HomePage, InitUIEnhancements, MileStonePlanningReport, MileStonePlanningReportHtml, OasReport, OasReportHtml, SummitUIEnhancements, UICaller } from "./pages";
import { PeakReport, PeakReportHtml, PresentAward, PresentAwardsHtml, TopoHtml, TopoLoaded, UiEnhancementsHtml, bulkCalendar } from "./pages";
import { SummitAddSreensMessage, SummitOnLoadMessage, SummitRouteChangeMessage, SummitScreen } from "../typings/summitTypes";
import { clearCache } from "./helpers";
import { SummitContext } from "./summitContext";
import $ from "jquery";
import { fetchAchievements } from "./terrainCalls";
import { AwardObserverRouter, CheckAward, InitLogbookRead, InitLogbookWrite, InitProgrammingExportBtn } from "./terrainButtons";
import { Logo, SummitMenuGroupHtml } from "./content";

export class SummitPageManager {
  private static instance: SummitPageManager;
  public pages: SummitPage[] = [
    new SummitPage("fa52775b-b30c-4e56-83ce-918411303373", "Summit Home", "Summit Home", "/summit", "", HomeHtml, HomePage),
    new SummitPage("7a806481-4360-4ecc-aa00-89095156696a", "Milestone Planning Report", "Milestone Planning", "/summit/reports/msplanreport", "unit:unit-council", MileStonePlanningReportHtml, MileStonePlanningReport),
    new SummitPage("7c61d365-35f1-4913-96f2-a95df14f0ab6", "OAS Summary Report", "OAS Summary Report", "/summit/reports/oasreport", "unit:unit-council", OasReportHtml, OasReport),
    new SummitPage("421a1b85-bcf7-4cf0-a03a-1405b96ad5a9", "Peak Award Progress Report", "Peak Award Progress Report", "/summit/reports/peakreport", "unit:unit-council", PeakReportHtml, PeakReport),
    new SummitPage("6a822ea7-34db-40cd-a180-9b1aa276b786", "Advanced Reports (Topo)", "Topo Blazor App", "/summit/reports/topo", "", TopoHtml, TopoLoaded),
    new SummitPage("717466bd-3c85-41c8-9212-dc1c295cf7c0", "Bulk Calendar", "Bulk Calendar", "/summit/tools/bulkcal", "unit:unit-council", BulkCalendarHtml, bulkCalendar),
    new SummitPage("1bfd34e1-59ed-4220-8d30-79a70dca2581", "Present Awards", "Present Awards", "/summit/tools/presentAward", "unit:unit-council", PresentAwardsHtml, PresentAward),
    new SummitPage("457f618b-4d0f-460a-83f9-1d40d7015fa1", "Display Options", "Display Options", "/summit/tools/uiEnhancements", "", UiEnhancementsHtml, InitUIEnhancements),
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
        this.context.setupNuxtWatchers();
        window.$nuxt.$router.push({ path: window.$nuxt.$route.fullPath, query: { Summit: true } });
        SummitUIEnhancements.getInstance().HelpButton(UICaller.Init);
      } else {
        if (window.$nuxt.$route.query.Summit) window.$nuxt.$router.back();
      }
      if (this.context.loggedin && this.context.currentProfile?.member === undefined) {
        await this.context.getData();
      }
      this.onRouteChange(newRoute);
      //check if class .ProfileSwitcherManageUser exists and save as boolean
      const isAssisting = $(".ProfileSwitcherManageUser").length === 0 ? false : true;
      if (isAssisting != this.context.isAssisting) {
        this.context.isAssisting = isAssisting;
        await this.context.getData();
      }
      if (message.oldRoute == "/") {
        setTimeout(() => {
          this.onRouteChange(newRoute);
        }, 250);
      }
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
    this.context.sendMessage({
      type: "addScreens",
      ids: this.pages.map((page) => page.pageid),
      pages: this.pages.map((page) => page.screen),
    } as SummitAddSreensMessage);
  }

  public onRouteChange(route: string) {
    route = route.replace("?Summit=true", "");
    switch (route) {
      case "/logbook/view-record":
        if (this.checkElements(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, "copyClipboardBtn")) InitLogbookRead();
        break;
      case "/logbook":
        if (this.checkElements(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, "writeClipboardBtn")) InitLogbookWrite();
        break;
      case "/programming/view-activity":
        if (this.checkElements(`//button[@data-cy='PRINT']`, "exportiCalBtn")) InitProgrammingExportBtn();
        break;
      case "/milestones":
        if (!window.$nuxt.$route.query.Summit) window.$nuxt.$router.push({ path: window.$nuxt.$route.fullPath, query: { Summit: true } });
        else {
          if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 1)").length > 0)
            CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 1 }).then(() => {
              AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", route);
            });
          if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 2)").length > 0)
            CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 2 }).then(() => {
              AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", route);
            });
          if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 3)").length > 0)
            CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 3 }).then(() => {
              AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", route);
            });
        }
        break;
      case "/intro-scouting":
      case "/intro-section":
      case "/adventurous-journey":
      case "/personal-reflection":
      case "/personal-development":
      case "/oas":
      case "/sia":
        if (!window.$nuxt.$route.query.Summit && !window.$nuxt.$store.state.global.routePrev.includes("Summit=true")) window.$nuxt.$router.push({ path: window.$nuxt.$route.fullPath, query: { Summit: true } });
        //if (window.$nuxt.$route.query.Summit) window.$nuxt.$router.back();
        else if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0) {
          const type =
            [
              { route: "/oas", type: "outdoor_adventure_skill" },
              { route: "/sia", type: "special_interest_area" },
              { route: "/personal-development", type: "course_reflection" },
              { route: "/intro-scouting", type: "intro_scouting" },
              { route: "/intro-section", type: "intro_section" },
              { route: "/adventurous-journey", type: "adventurous_journey" },
              { route: "/personal-reflection", type: "personal_reflection" },
            ].find((type) => type.route === route)?.type ?? "outdoor_adventure_skill";
          route === "/oas" ? "outdoor_adventure_skill" : "special_interest_area";
          const header = route.startsWith("/intro-") ? $("hr.BaseList__divider").first() : $("div.AchievementOverview__awarded").first();
          const list = header.next().children("div.List").first();
          list.addClass("AwardedList");
          list.children().each((_index, element) => {
            fetchAchievements(type).then((awards) => {
              CheckAward({ name: type, parent: $(element), awardsPrefetched: awards });
            });
          });
        }
        break;
    }
    if ($("#SummitMainMenu").length === 0 && $("nav").length > 0) this.setupMenu();
    if (route.startsWith("/summit")) {
      $("#SummitMainMenu").show();
      $("#TerrainMainMenu").hide();
      $("#SummitBreadcrumbs").show();
      $("#TerrainBreadcrumbs").hide();
      this.summitPermissionCheck();
    } else {
      $("#SummitMainMenu").hide();
      $("#TerrainMainMenu").show();
      $("#SummitBreadcrumbs").hide();
      $("#TerrainBreadcrumbs").show();
    }
  }
  summitPermissionCheck() {
    this.pages.forEach((page) => {
      if (page.permission === "") return;
      if ( this.context.currentProfile?.branch && this.context.currentProfile?.branch?.roles.includes("support-leader") ){
        $(`#SummitMenuItem-${page.pageid}`).css("color", "").css("pointer-events", "auto").children().css("color", "").css("pointer-events", "auto");
        return;
      }
      const level = page.permission.split(":")[0];
      const role = page.permission.split(":")[1];
      switch (level) {
        case "group":
          if (this.context.currentProfile?.group?.roles.includes(role)) {
            // re-enable clicking and remove grey text
            $(`#SummitMenuItem-${page.pageid}`).css("color", "").css("pointer-events", "auto").children().css("color", "").css("pointer-events", "auto");
          } else {
            $(`#SummitMenuItem-${page.pageid}`).css("color", "grey").css("pointer-events", "none").children().css("color", "grey").css("pointer-events", "none");
          }
          break;
        case "unit":
          if (this.context.currentProfile?.unit?.roles.includes(role)) {
            $(`#SummitMenuItem-${page.pageid}`).css("color", "").css("pointer-events", "auto").children().css("color", "").css("pointer-events", "auto");
          } else {
            $(`#SummitMenuItem-${page.pageid}`).css("color", "grey").css("pointer-events", "none").children().css("color", "grey").css("pointer-events", "none");
          }
          break;
      }
    });
  }

  public checkElements(query: string, id: string): boolean {
    if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext()) return !document.getElementById(id);
    return false;
  }

  private setupMenu() {
    $(TerrainClass.MainMenuClass).first().attr("id", "TerrainMainMenu").clone().attr("id", "SummitMainMenu").css("background-color", "#004C00").appendTo("nav").first();
    $("#SummitMainMenu").show();
    $("#TerrainMainMenu").hide();
    $("#SummitMainMenu").find(".NavMenu__logout").remove();
    $("#SummitMainMenu")
      .find(TerrainClass.MenuItemHeader)
      .first()
      .html(
        `<div style="color:white; display: grid; place-items: center; height:100px !important">
          <img width="40px" src ="${Logo}">
          <b>Summit &nbsp|&nbsp Terrain</b>
          <div id="summitVerson" style="font-size: small;">
            V${this.context.summitVersion}${this.context.upgradeAvailable ? '<span style="color: red">&nbsp⭮</span>' : ""}
          </div>
        </div>`,
      )
      .css("height", "100px");
    $("#summitVerson").on("click", () => {
      this.context.updateSummit();
    });
    $("#summitVerson")
      .on("mouseenter", () => {
        if (this.context.upgradeAvailable) {
          $("#summitVerson").css("cursor", "pointer");
        }
      })
      .on("mouseleave", () => {
        $("#summitVerson").css("cursor", "default");
      });
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
        SummitMenuGroupHtml.replace("SummitMenuGroup-", "SummitMenuGroup-" + key)
          .replace("SummitMenuGroupTitle-", "SummitMenuGroupTitle-" + key)
          .replace("SummitMenuGroupItems-", "SummitMenuGroupItems-" + key)
          .replace("GROUPTITLE", key.charAt(0).toUpperCase() + key.slice(1)),
      ).appendTo(menuItem.parent());
      $("#SummitMenuGroupItems-" + key).hide();
      $("#SummitMenuGroupTitle-" + key).on("click", () => {
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
        const groupItem = $(menuGroupItems.replace("PAGEROUTE", page.path).replace("PAGETITLE", page.title)).attr("id", `SummitMenuItem-${page.pageid}`);
        groupItem.on("click", () => this.context.changePage(page.path));
        $("#SummitMenuGroupItems-" + key).append(groupItem);
      });
    });
    this.createMenuItem(menuItem, "summitMenu", "Terrain | Summit", "/summit", $("#TerrainMainMenu").find(TerrainClass.MenuItemClass).first().parent());
    this.createMenuItem(menuItem.css("background-color", "#071e57").children().removeClass("summit-menu").children().removeClass("summit-menu").parent().parent(), "terrainMenu", "Back to Scouts | Terrain", "/basecamp", menuItem.parent());
    const footer = $("footer").find("a").first().clone().prependTo($("footer").find("a").first().parent()).attr({ href: "https://github.com/pete-mc/Summit/issues", target: "_blank" });
    footer.find(".Icon__label").text("Summit Support").attr("style", "color: green;");
    footer.find(".Icon__image").attr("src", Logo);
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
  public permission: string;
  public onload: () => void;
  public executeOnLoad: () => void;
  constructor(pageid: string, title: string, breadcrumb: string, path: string, permission: string, html: string, onloadSummit: () => void) {
    this.pageid = pageid;
    this.title = title;
    this.breadcrumb = breadcrumb;
    this.path = path;
    this.html = html;
    this.permission = permission;
    this.onload = onloadSummit;
    this.executeOnLoad = this.debounce(this.callOnload.bind(this), 250);
  }
  public callOnload() {
    if (this.onload) {
      this.onload();
    }
  }

  private debounce(func: (...args: never[]) => void, wait: number) {
    let timeout: string | number | NodeJS.Timeout | undefined;
    return function (...args: never[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
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
