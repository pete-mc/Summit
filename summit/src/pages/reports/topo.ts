import { SummitContext } from "../../summitContext";

export function topoLoaded() {
  const context = SummitContext.getInstance();
  context.log("Topo page Loaded");
}
