import { SummitContext } from "./summitContext";
import summitTerrainContext from "raw-loader!./content/summitTerrainContext.js";
import $ from "jquery";
import { SummitPageManager } from "./summitPages";
import { initCache } from "./helpers";

if (SummitContext.getInstance().buildMode === "dev") {
  SummitContext.getInstance().log("Dev Mode");
  console.log(SummitContext.getInstance());
}

async function initSummit() {
  $(`<button style="display: none;" onclick="var exports = {};function loadSummit(){${summitTerrainContext.replaceAll('"', "'")}};window.loadSummit = loadSummit; window.loadSummit();"/>`) //.replaceAll('"', "'").replace(/^(.*\n){2}/, "")
    .appendTo("body")
    .trigger("click")
    .remove();
  const context = SummitContext.getInstance();
  context.log("Start");
  // Setup Terrain Context
  SummitPageManager.getInstance();
  initCache(); // initiate cache
}

window.onload = function () {
  initSummit();
};
