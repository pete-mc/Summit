import { Home, MilestoneReport, Topo, UiEnhancements } from "../components";
import { AddMenuItems } from "../helpers";
import { NavMenuItem } from "../types/NavMenu";

export async function initPages() {
  const router = window.$nuxt.$router;
  const navMenuItems: NavMenuItem[] = [];

  router.addRoute({ path: "/summit/home", component: Home });
  router.addRoute({ path: "/summit/uiEnhancements", component: UiEnhancements });
  router.addRoute({ path: "/summit/MilestoneReport", component: MilestoneReport });
  router.addRoute({ path: "/summit/Topo", component: Topo });
  navMenuItems.push({
    title: "Summit",
    to: "/summit/home",
    items: [
      {
        title: "Reports",
        items: [
          { title: "Milestones", to: "/summit/MilestoneReport", items: [], locked: false, roles: [true, false] },
          { title: "Topo Reports", to: "/summit/Topo", items: [], locked: false, roles: [true, false] },
        ],
        locked: true,
        roles: [true, false],
      },
      { title: "Tools", items: [{ title: "UiEnchancements", to: "/summit/uiEnhancements", items: [], locked: false, roles: [true, false] }], locked: true, roles: [true, false] },
    ],
    locked: false,
    roles: [true, false],
  });

  AddMenuItems(
    navMenuItems.map((page) => {
      return { title: page.title, to: page.to, items: page.items, locked: page.locked, roles: page.roles };
    }) as NavMenuItem[],
  );
}
