(function () {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/summit.js");
  (document.head || document.documentElement).appendChild(script);

  const external_data = document.createElement("script");
  external_data.src = chrome.runtime.getURL("external_data/school_term.js");
  (document.head || document.documentElement).appendChild(script);
})();
