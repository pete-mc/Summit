function summitMenu(){
  $(".v-navigation-drawer__content").css("background-color", "#004C00");
  //Menu items in summit page:
  createSummitReportMenuItem(true, summitHomePage, "Home", "home"); //first one should be true to clear other menu items
  createSummitReportMenuItem(false, unitReport, "Milestone Planning Report", "msReport");
  createSummitReportMenuItem(false, ()=>progressReport(0), "Peak Award Progress Report", "progressReport");
  createSummitReportMenuItem(false, ()=>oasReport(0), "OAS Report", "oasReport");
  //createSummitReportMenuItem(false, testReport, "Test Report - HIDE", "testReport"); //example report with table and chart !!!COMMENT OUT BEFORE RELEASE!!!
  createSummitReportMenuItem(false, () => location.href = "https://terrain.scouts.com.au/", "Back to SCOUTS | TERRAIN", "back");
  $(".NavMenu__logo").click(() => location.href = "https://terrain.scouts.com.au/");
  summitHomePage();
  //load home page content
    $(`<div id='auth' onclick='document.getElementById("auth").innerHTML = window.$nuxt.$store._vm["auth/getIdToken"]'></div>`).insertAfter("#__nuxt");
  $("#auth").click();
  auth = $("#auth").text();
  $("#auth").remove();
 
}

//add menu items above, below in the menu code which should not need updates

function createSummitReportMenuItem(replaceMenu, func, menuText, menuId){

  var dataTablesStyleSheet = document.createElement('link');
  dataTablesStyleSheet.rel = 'stylesheet';  
  dataTablesStyleSheet.type = 'text/css';
  dataTablesStyleSheet.href = 'https://cdn.datatables.net/v/dt/jq-3.6.0/dt-1.11.3/datatables.min.css';    
  document.head.appendChild(dataTablesStyleSheet);
  const mainMenu = document.evaluate(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'NavMenu__menu-container')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  const navMenuGroup = document.createElement("div");
  navMenuGroup.classList = "NavMenu__menu-group summit-menu";

  const menuListGroup = document.createElement("div");
  menuListGroup.classList = "v-list-group NavMenu__list-group v-list-group--no-action summit-menu";
  navMenuGroup.appendChild(menuListGroup);

  const menuGroupHeader = document.createElement("div");
  menuGroupHeader.classList = "v-list-group__header v-list-item v-list-item--link theme--light summit-menu";
  menuGroupHeader.setAttribute("role","button")
  menuListGroup.appendChild(menuGroupHeader);

  const menuLink = document.createElement("a");
  menuLink.classList = "NavMenu__item v-list-item v-list-item--link theme--light";
  menuGroupHeader.appendChild(menuLink);

  const menuItemContent = document.createElement("div");
  menuItemContent.classList = "v-list-item__content";
  menuLink.appendChild(menuItemContent);

  const menuItemTitle = document.createElement("div");
  menuItemTitle.classList = "v-list-item__title";
  menuItemTitle.id = "summitReportsMenu";
  menuItemContent.appendChild(menuItemTitle);

  menuItemTitle.onclick = func;
  menuItemTitle.id = "summitReportsMenu-" + menuId;
  menuItemTitle.innerHTML = menuText;

  if (replaceMenu) mainMenu.replaceChildren(navMenuGroup);
  else mainMenu.appendChild(navMenuGroup);
}

function summitHomePage(){
  summitLoadPage("SUMMIT",`
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


function summitLoadPage(breadcrumbText, content){
  if (document.evaluate(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'v-list-item--active')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue)
    document.evaluate(`//div[ancestor::nav[contains(@class, 'NavMenu')] and contains(@class, 'v-list-item--active')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.classList.remove("v-list-item--active");  
    const breadcrumb =document.evaluate(`//ul[ancestor::header[contains(@class, 'AppBar')] and contains(@class, 'AppBar__breadcrumbs')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    const breadcrumbLi = document.createElement("li");
    const breadcrumbA = document.createElement("a");
    breadcrumbA.classList = "v-breadcrumbs__item--disabled v-breadcrumbs__item v-breadcrumbs__item--disabled";
    breadcrumbA.text = breadcrumbText;
    breadcrumbLi.appendChild(breadcrumbA);
    breadcrumb.replaceChildren(breadcrumbLi);

    const mainArea =document.evaluate(`//div[ancestor::main[contains(@class, 'v-main')] and contains(@class, 'app-container')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const contentArea = document.createElement("div");
    contentArea.innerHTML = content;
    mainArea.replaceChildren(contentArea);
}