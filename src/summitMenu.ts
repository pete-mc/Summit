import { SummitAddSreensMessage } from "../typings/summitTypes";
import { bulkCalendar } from "./forms/bulkCalendar";
import { clearCache } from "./helpers";
import { unitReport } from "./reports/milestonePlanningReport";
import { oasReport } from "./reports/oasReport";
import { progressReport } from "./reports/progressReport";
import { SummitContext } from "./summitContext";
import $ from 'jquery';

export function summitMenu(context: SummitContext) {

  // Send addRoutes using a SummitAddRoutesMessage to Terrain for Summit loading pages
  context.sendMessage({
    type: 'addScreens',
    screens: [
      {
        path: '/summit',
        html: `  <h1>Welcome to Terrain | Summit</h1>
        Here you will bo able to find the custom Summit reports and request forms.<br>
        <br>
        Please note that these reports run inside the terrain website and do not transmit information to any third party services.<br>
        These reports only show information that you have access to with your account. No additional information can be gathered that you don't already have access to by clicking around Terrain.<br>
        <br>
        The purpose of these reports is simiply to assist in providing a snapshot of your units information in a single screen.<br>
        <br>
        Please select the page you wish to run from the left hand side bar. To go back to the rest of Terrain click "Go Back".<br>
        <br>
        Thanks for using Terrain |Summit!`,
        onloadSummit: "HomeOnLoad" 
      }
    ]
  } as SummitAddSreensMessage);



 
  
  $(".v-navigation-drawer__content").css("background-color", "#004C00");

  createSummitReportMenuItem(true, () => {context.changePage("/summit")}, "Home", "home");
  createSummitReportMenuItem(false, () => unitReport(0,context), "Milestone Planning Report", "msReport");
  createSummitReportMenuItem(false, () => progressReport(0,context), "Peak Award Progress Report", "progressReport");
  createSummitReportMenuItem(false, () => oasReport(0,context), "OAS Report", "oasReport");
  createSummitReportMenuItem(false, () => bulkCalendar(context), "Bulk Calendar Entry", "bulkEntry");
  createSummitReportMenuItem(false, () => clearCache(), "Clear Cached Data", "clearCache");
  //createSummitReportMenuItem(false, () => testReport(), "TEST", "tester");
  createSummitReportMenuItem(false, () => location.href = "https://terrain.scouts.com.au/", "Back to SCOUTS | TERRAIN", "back");

  $(".NavMenu__logo").click(() => location.href = "https://terrain.scouts.com.au/");
}

export function createSummitReportMenuItem(replaceMenu: boolean, func: ()=>any, menuText: string, menuId: string) {
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

function summitHomePage() {
  summitLoadPage("SUMMIT", `
  <h1>Welcome to Terrain | Summit</h1>
  Here you will bo able to find the custom Summit reports and request forms.<br>
  <br>
  Please note that these reports run inside the terrain website and do not transmit information to any third party services.<br>
  These reports only show information that you have access to with your account. No additional information can be gathered that you don't already have access to by clicking around Terrain.<br>
  <br>
  The purpose of these reports is simiply to assist in providing a snapshot of your units information in a single screen.<br>
  <br>
  Please select the page you wish to run from the left hand side bar. To go back to the rest of Terrain click "Go Back".<br>
  <br>
  Thanks for using Terrain |Summit!
`);
}

export function summitLoadPage(breadcrumbText: string, content: string | Element | Comment | Document | DocumentFragment | JQuery<JQuery.Node> | (JQuery.Node | JQuery<JQuery.Node>)[]) {
  $(".v-list-item--active").removeClass("v-list-item--active");

  const breadcrumb = $("<li>").append(
      $("<a>").addClass("v-breadcrumbs__item--disabled v-breadcrumbs__item").text(breadcrumbText)
  );
  $("header.AppBar ul.AppBar__breadcrumbs").empty().append(breadcrumb);

  const mainArea = $("main.v-main div.app-container").first()[0];
  $(mainArea).empty().append(content);
}
