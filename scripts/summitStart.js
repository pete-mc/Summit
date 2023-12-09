// Variables
let loc = "";
let auth = "";
let summitMessageHandlers = [];
let bcChannel = new BroadcastChannel('TerrainSummit');
const LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');
let currentProfile = {};
initCache();
fetchUnitMembers();
// Broadcast channel event
$(bcChannel).on("message", (event) => {
  summitMessageHandlers.forEach(entry => {
    if (entry.type === event.originalEvent.data.type) {
      entry.handler(event.originalEvent);
    }
  });
});

// Throttled version of checkLocation
const throttledCheckLocation = throttle(checkLocation, 100);

// Window event Listeners
$(window).on("click hashchange popstate load", throttledCheckLocation);
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
  const pathname = $(location).attr("pathname");
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
    createSummitReportMenuItem(false, summitMenu, "Terrain | Summit", "summitMenu");
  }
}

function checkPage(query, id, delay) {
  if ($(document).xpath(query).length > 0)
    return !$("#" + id).length;
  setTimeout(() => { startSummitChecks(); }, delay);
  return false;
}

// Fetch profile data
$.ajax({
  url: "https://members.terrain.scouts.com.au/profiles",
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem(`CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.${LastAuthUser}.idToken`)
  },
  success: function(data) {
    currentProfile = data;
  },
  error: function(error) {
    currentProfile = {'Error:': error};
  }
});
