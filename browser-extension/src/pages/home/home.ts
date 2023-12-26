import { SummitContext } from "../../summitContext";

export function homePageLoaded() {
  const context = SummitContext.getInstance();
  context.log("Home Page Loaded");
}
