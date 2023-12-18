import { SummitAddSreensMessage, SummitScreen } from "../typings/summitTypes";
import { bulkCalendar } from "./forms/bulkCalendar";
import { clearCache } from "./helpers";
import { unitReport } from "./reports/milestonePlanningReport";
import { oasReport } from "./reports/oasReport";
import { progressReport } from "./reports/progressReport";
import { SummitContext } from "./summitContext";
import $ from "jquery";
import homeHtml from "raw-loader!./pages/home/home.html";

export class SummitPage {
  public pageid: string;
  public title: string;
  public breadcrumb: string;
  public path: string;
  public html: string;
  public onload: { name: string, func: () => void};
  constructor(pageid: string, title: string, breadcrumb: string, path: string, html: string, onloadSummit: { name: string, func: () => void}) {
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

export function summitMenu() {
  const context = SummitContext.getInstance();
  context.summitPages.push(
    new SummitPage("fa52775b-b30c-4e56-83ce-918411303373", "Home", "Home", "/summit", homeHtml, { name: "HomeOnLoad", func: () => {} })
  );
  context.submitAllPages();
  context.sendMessage({
    type: "addScreens",
    ids: context.summitPages.map((page) => page.pageid),
  } as SummitAddSreensMessage);

  $(".v-navigation-drawer__content").css("background-color", "#004C00");

  createSummitReportMenuItem(
    true,
    () => {
      context.changePage("/summit");
    },
    "Home",
    "home",
  );
  createSummitReportMenuItem(false, () => unitReport(), "Milestone Planning Report", "msReport");
  createSummitReportMenuItem(false, () => progressReport(), "Peak Award Progress Report", "progressReport");
  createSummitReportMenuItem(false, () => oasReport(), "OAS Report", "oasReport");
  createSummitReportMenuItem(false, () => bulkCalendar(), "Bulk Calendar Entry", "bulkEntry");
  createSummitReportMenuItem(false, () => clearCache(), "Clear Cached Data", "clearCache");
  //createSummitReportMenuItem(false, () => testReport(), "TEST", "tester");
  createSummitReportMenuItem(false, () => context.changePage("/basecamp"), "Back to SCOUTS | TERRAIN", "back");

  $(".NavMenu__logo").click(() => (location.href = "https://terrain.scouts.com.au/"));
}

export function createSummitReportMenuItem(replaceMenu: boolean, func: () => unknown, menuText: string, menuId: string) {
  const mainMenu = $("div.NavMenu__menu-container").first()[0];
  const navMenuGroup = $("<div>").addClass("NavMenu__menu-group summit-menu");
  const menuListGroup = $("<div>").addClass("v-list-group NavMenu__list-group v-list-group--no-action summit-menu");
  const menuGroupHeader = $("<div>").addClass("v-list-group__header v-list-item v-list-item--link theme--light summit-menu").attr("role", "button");
  const menuLink = $("<a>").addClass("NavMenu__item v-list-item v-list-item--link theme--light");
  const menuItemContent = $("<div>").addClass("v-list-item__content");
  const menuItemTitle = $("<div>").addClass("v-list-item__title").attr("id", `summitReportsMenu-${menuId}`).text(menuText).on("click", func);
  menuListGroup.append(menuGroupHeader.append(menuLink.append(menuItemContent.append(menuItemTitle))));
  navMenuGroup.append(menuListGroup);

  if (replaceMenu) {
    $(mainMenu).empty().append(navMenuGroup);
  } else {
    $(mainMenu).append(navMenuGroup);
  }
}

export function summitLoadPage(breadcrumbText: string, content: string | Element | Comment | Document | DocumentFragment | JQuery<JQuery.Node> | (JQuery.Node | JQuery<JQuery.Node>)[]) {
  $(".v-list-item--active").removeClass("v-list-item--active");

  const breadcrumb = $("<li>").append($("<a>").addClass("v-breadcrumbs__item--disabled v-breadcrumbs__item").text(breadcrumbText));
  $("header.AppBar ul.AppBar__breadcrumbs").empty().append(breadcrumb);

  const mainArea = $("main.v-main div.app-container").first()[0];
  $(mainArea).empty().append(content);
}
