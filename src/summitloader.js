(function () {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/summit.js");
  (document.head || document.documentElement).appendChild(script);
})();
