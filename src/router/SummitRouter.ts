import { FindComponent } from "@/helpers";
import { Home, DisplayOptions, MilestoneReport, OasReport, Topo, PresentAwards, SummitCalendar } from "@/pages";
import { NavMenuComponent, NavMenuItem } from "@/types/NavMenu";
import VueRouter from "vue-router";
import Vue from "vue";

export default class SummitRouter {
  private static instance: SummitRouter;

  private router: VueRouter;

  private summitNavMenuItems: NavMenuItem[];

  private static terrainNavMenuItems: NavMenuItem[];

  constructor() {
    this.router = window.$nuxt.$router;
    this.summitNavMenuItems = [];
    SummitRouter.terrainNavMenuItems = SummitRouter.getTerrainNavMenuItems();
    this.initRoutes();
    this.initNavMenu();
  }

  public static getInstance(): SummitRouter {
    if (!SummitRouter.instance) {
      SummitRouter.instance = new SummitRouter();
    }
    return SummitRouter.instance;
  }

  private async initRoutes(): Promise<void> {
    this.router.addRoute({
      path: "/terrain",
      redirect: "/basecamp",
    });
    this.router.addRoute({
      path: "/summit/home",
      component: Home,
    });
    this.router.addRoute({
      path: "/summit/tools/SummitCalendar",
      component: SummitCalendar,
    });
    this.router.addRoute({
      path: "/summit/tools/DisplayOptions",
      component: DisplayOptions,
    });
    this.router.addRoute({
      path: "/summit/tools/PresentAwards",
      component: PresentAwards,
    });
    this.router.addRoute({
      path: "/summit/reports/milestone",
      component: MilestoneReport,
    });
    this.router.addRoute({
      path: "/summit/reports/oas",
      component: OasReport,
    });
    this.router.addRoute({
      path: "/summit/reports/Topo",
      component: Topo,
    });
    this.router.beforeEach((to, from, next) => {
      if (to.path.includes("summit")) {
        SummitRouter.switchMenu(this.summitNavMenuItems);
      } else {
        SummitRouter.switchMenu(SummitRouter.terrainNavMenuItems);
      }
      next();
    });
    this.router.afterEach(() => {
      if (this.summitNavMenuItems.length === 0 || SummitRouter.terrainNavMenuItems.length === 0) {
        setTimeout(() => {
          this.initNavMenu();
        }, 1000);
      }
    });
  }

  private async initNavMenu(): Promise<void> {
    this.summitNavMenuItems = [
      {
        title: "Basecamp",
        to: "/terrain",
        items: [],
        locked: false,
        roles: [true, false],
      },
      {
        title: "Reports",
        items: [
          {
            title: "Milestone Progress",
            to: "/summit/reports/milestone",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "OAS Summary",
            to: "/summit/reports/oas",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "Topo Reports",
            to: "/summit/reports/Topo",
            items: [],
            locked: false,
            roles: [true, false],
          },
        ],
        locked: false,
        roles: [true, false],
      },
      {
        title: "Tools",
        items: [
          {
            title: "Summit Calendar",
            to: "/summit/tools/SummitCalendar",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "Present Awards",
            to: "/summit/tools/PresentAwards",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "Display Options",
            to: "/summit/tools/DisplayOptions",
            items: [],
            locked: false,
            roles: [true, false],
          },
        ],
        locked: false,
        roles: [true, false],
      },
    ];
    const SummitNavMenuItem: NavMenuItem = {
      title: "Summit",
      to: "/summit/home",
      items: [],
      locked: false,
      roles: [true, false],
    };
    SummitRouter.addMenuItems([SummitNavMenuItem]);
  }

  private static getTerrainNavMenuItems(): NavMenuItem[] {
    const navMenuComponent: NavMenuComponent = FindComponent("NavMenu", window.$nuxt.$root as Vue) as NavMenuComponent;
    if (navMenuComponent != null) {
      return Array.from(navMenuComponent.items);
    }

    return [];
  }

  private static addMenuItems(items: NavMenuItem[]): void {
    window.$nuxt.$nextTick(() => {
      const navMenuComponent: NavMenuComponent = FindComponent("NavMenu", window.$nuxt.$root as Vue) as NavMenuComponent;
      if (navMenuComponent != null) {
        for (let i = 0; i < items.length; i += 1) {
          navMenuComponent.items.push(items[i]);
          this.terrainNavMenuItems = Array.from(navMenuComponent.items);
        }
        navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
        navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
      }
    });
  }

  private static switchMenu(items: NavMenuItem[]): void {
    window.$nuxt.$nextTick(() => {
      const navMenuComponent: NavMenuComponent = FindComponent("NavMenu", window.$nuxt.$root as Vue) as NavMenuComponent;
      if (navMenuComponent != null) {
        navMenuComponent.items.splice(0, navMenuComponent.items.length);
        for (let i = 0; i < items.length; i += 1) {
          navMenuComponent.items.push(items[i]);
        }
        navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
        navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
      }
    });
  }
}
