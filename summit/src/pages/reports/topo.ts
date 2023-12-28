import { SummitContext } from "../../summitContext";
import topoHTML from "raw-loader!./topo.html";
export const topoHtml = topoHTML;

export function topoLoaded() {
  const context = SummitContext.getInstance();
  context.log("Topo page Loaded");
}
