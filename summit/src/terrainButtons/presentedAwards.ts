import { TerrainAchievements } from "../../typings/terrainTypes";
import { hasPropAtPath } from "../helpers";
import { SummitContext } from "../summitContext";
import { SummitPageManager } from "../summitPages";
import { fetchAchievements } from "../terrainCalls";
import $ from "jquery";

export async function checkAward(params: { name: string; path?: string; value?: string | number | boolean; parent?: JQuery<HTMLElement>; awardsPrefetched?: TerrainAchievements[] }) {
  SummitContext.getInstance().log("Checking award:" + params.name);
  const summitContext = SummitContext.getInstance();
  const awards = params.awardsPrefetched ?? (await fetchAchievements(params.name));
  let presented = false;
  let awardId = "";
  if (!awards) return;
  for (const award of awards) {
    if (params.path && hasPropAtPath(award, params.path, params.value)) continue;
    if (!summitContext.presentedAwards.includes(award.id)) continue;
    presented = true;
    awardId = award.id;
    break;
  }
  if (presented) {
    const ListItemStatus = params.parent ? params.parent.find(".ListItem__status-col").first() : $("span.v-chip__content:contains(Awarded)").parent().parent();
    const PresentedListItemStatus = ListItemStatus.clone();
    PresentedListItemStatus.addClass("presentedAwardListItem");
    ListItemStatus.after(PresentedListItemStatus);
    PresentedListItemStatus.find("span.v-chip__content").addClass("presentedAward").text("Presented ✅").css("color", "white").parent().css("background", "green");
    ListItemStatus.siblings(".ListItem__action-btn-col").remove();
    SummitContext.getInstance().log(`Award ${name} with id ${awardId} has value ${params.value} at path ${params.path} has been presented`);
  }
}

export function awardObserverRouter(watchElement: JQuery<HTMLElement>, removeElement: string, currentRoute: string) {
  if (watchElement.length === 0 || watchElement[0].id === "awardObserver") return;
  watchElement[0].id = "awardObserver";
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      $(removeElement).remove();
      SummitContext.getInstance().log("Award observer triggered");
      SummitPageManager.getInstance().onRouteChange(currentRoute);
    });
  });
  observer.observe(watchElement[0], { attributes: true, childList: true, subtree: true });
}
