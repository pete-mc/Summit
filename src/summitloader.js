(function () {
  const summitVersion = chrome.runtime.getManifest?.().version;
  if (summitVersion) {
    document.documentElement?.setAttribute("data-summit-version", summitVersion);
  }

  // Gotcha: summit.js runs in the page's MAIN world, which has no chrome.runtime. Resolve extension URLs here
  // and pass them on a DOM attribute; JS globals set here aren't visible to the page.
  document.documentElement?.setAttribute("data-summit-extension-url", chrome.runtime.getURL(""));

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/summit.js");
  (document.head || document.documentElement).appendChild(script);
})();
