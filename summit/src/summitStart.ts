import { SummitContext } from "./summitContext";
import $ from "jquery";
(window as any).$ = $;
(window as any).jQuery = $;
import { SummitPageManager } from "./summitPages";
import { initCache } from "./helpers";
import { TerrainSummitContext, loadTerrainContext } from "./summitTerrainContext";
if (SummitContext.getInstance().buildMode === "dev") {
  SummitContext.getInstance().log("Dev Mode");
  console.log(SummitContext.getInstance());
}
async function initSummit() {
  loadTerrainContext();
  TerrainSummitContext.getInstance();
  const context = SummitContext.getInstance();
  context.log("Start");
  SummitPageManager.getInstance();
  initCache(); 
}
initSummit();
