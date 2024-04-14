import { HasPropAtPath } from "@/helpers";
import { fetchAchievements } from "@/services";
import { TerrainAchievements } from "@/types/terrainTypes";
import moment from "moment";
import { Route } from "vue-router";

export async function CheckAward(params: { name: string; path?: string; value?: string | number | boolean; parent?: JQuery<HTMLElement>; awardsPrefetched?: TerrainAchievements[] }) {
  const awards = params.awardsPrefetched ?? (await fetchAchievements(params.name));
  let presented = false;
  let presentedDateString = "";
  if (!awards) return;
  for (const award of awards) {
    if (params.path && HasPropAtPath(award, params.path, params.value)) continue;
    if (!(window.$nuxt.$store.state.Summit.presentedAwards as { guid: string; date: Date }[] | { guid: string; date: null }[]).find((g) => g.guid === award.id)) continue;
    presented = true;
    const presentedDate = (window.$nuxt.$store.state.Summit.presentedAwards as { guid: string; date: Date }[] | { guid: string; date: null }[]).find((g) => g.guid === award.id)?.date;
    presentedDateString = presentedDate ? moment(presentedDate).format("DD/MM/YYYY") : "✅";
    break;
  }
  if (presented) {
    const ListItemStatus = params.parent ? params.parent.find(".ListItem__status-col").first() : $("span.v-chip__content:contains(Awarded)").parent().parent();
    const PresentedListItemStatus = ListItemStatus.clone();
    PresentedListItemStatus.addClass("presentedAwardListItem");
    ListItemStatus.after(PresentedListItemStatus);
    PresentedListItemStatus.find("span.v-chip__content")
      .addClass("presentedAward")
      .text("Presented - " + presentedDateString)
      .css("color", "white")
      .parent()
      .css("background", "green");
    ListItemStatus.siblings(".ListItem__action-btn-col").remove();
  }
}

export function AwardObserverRouter(watchElement: JQuery<HTMLElement>, removeElement: string, currentRoute: Route, pageChecks: (to: Route) => void) {
  if (watchElement.length === 0 || watchElement[0].id === "awardObserver") return;
  watchElement[0].id = "awardObserver";
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      $(removeElement).remove();
      pageChecks(currentRoute);
    });
  });
  observer.observe(watchElement[0], { attributes: true, childList: true, subtree: true });
}
