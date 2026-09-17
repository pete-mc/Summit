(function () {
  const summitVersion = chrome.runtime.getManifest?.().version;
  if (summitVersion) {
    document.documentElement?.setAttribute("data-summit-version", summitVersion);
  }

  // summit.js is injected into and runs in the page's own JS context (the "main world"), which
  // has no access to chrome.runtime (MV3 does not expose it there) — so any extension-relative
  // URL the page-world code needs (e.g. bundled images) must be resolved here, in the isolated
  // content-script world where chrome.runtime IS available, and handed to the page via a DOM
  // attribute rather than a JS global (globals set here are not visible to the injected script).
  document.documentElement?.setAttribute("data-summit-extension-url", chrome.runtime.getURL(""));

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/summit.js");
  (document.head || document.documentElement).appendChild(script);
})();
