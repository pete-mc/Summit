(function () {
  const summitVersion = chrome.runtime.getManifest?.().version;
  if (summitVersion) {
    document.documentElement?.setAttribute("data-summit-version", summitVersion);
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/summit.js");
  (document.head || document.documentElement).appendChild(script);
})();
