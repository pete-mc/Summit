import FindComponent from "../helpers/FindComponent";
import { Home, DisplayOptions, MilestoneReport, OasReport, OasProgressionVue, Topo, SummitCalendar, PeakAward, PresentAwardsVue, IStatements } from "@/pages";
import { NavMenuComponent, NavMenuItem } from "@/types/NavMenu";
import VueRouter, { Route } from "vue-router";
import Vue from "vue";
import { InitLogbookRead, InitLogbookWrite, InitProgrammingExportBtn } from "@/components";
import { createLogger } from "@/helpers";

const logger = createLogger("SummitRouter");

export default class SummitRouter {
  private static instance: SummitRouter;

  private router: VueRouter;

  private summitNavMenuItems: NavMenuItem[];

  private static terrainNavMenuItems: NavMenuItem[];

  constructor() {
    this.router = window.$nuxt.$router;
    this.summitNavMenuItems = [];
    SummitRouter.terrainNavMenuItems = SummitRouter.getTerrainNavMenuItems();
    this.initNavMenu();
    this.initRoutes();
  }

  public static getInstance(): SummitRouter {
    if (!SummitRouter.instance) {
      SummitRouter.instance = new SummitRouter();
    }
    return SummitRouter.instance;
  }

  // Terrain's NavMenu only appears once its async login check finishes, which is usually after
  // Summit has started. Keep polling until it's there (giving up after ~30s, e.g. on the login
  // page — the afterEach fallback below picks it up on the first navigation after logging in).
  public finaliseSetup(attempt = 0): void {
    if (SummitRouter.terrainNavMenuItems.length === 0 && attempt < 300) {
      setTimeout(() => {
        this.resetMenu();
        this.finaliseSetup(attempt + 1);
      }, 100);
    }
  }

  public resetMenu(): void {
    this.captureTerrainMenu();
    this.initNavMenu();
    // Show the right menu for the page we're on — on a full page load of a Summit URL no
    // navigation happens after the menu appears, so nothing else would switch it.
    this.applyMenuForRoute(this.router.currentRoute.path);
  }

  // Snapshot Terrain's own menu items — but only while Terrain's menu is the one on screen.
  // Snapshotting while the Summit menu is showing would save Summit's items as Terrain's.
  private captureTerrainMenu(): void {
    const current = SummitRouter.getTerrainNavMenuItems();
    if (current.length > 0 && !SummitRouter.isSummitMenu(current)) {
      SummitRouter.terrainNavMenuItems = current;
    }
  }

  private applyMenuForRoute(path: string): void {
    SummitRouter.switchMenu(path.includes("summit") ? this.summitNavMenuItems : SummitRouter.terrainNavMenuItems);
  }

  // The Summit menu is the only one with sub-items pointing at Summit pages.
  private static isSummitMenu(items: NavMenuItem[]): boolean {
    return items.some((item) => (item.items ?? []).some((sub) => typeof sub.to === "string" && sub.to.startsWith("/summit/")));
  }

  private async initRoutes(): Promise<void> {
    // Register the navigation hooks BEFORE adding routes: each addRoute() makes vue-router
    // re-run navigation to the current URL, and on a page load of a Summit URL those
    // re-runs are the only navigations that happen.
    this.router.beforeEach((to, from, next) => {
      if (SummitRouter.terrainNavMenuItems.length === 0) {
        this.captureTerrainMenu();
        this.initNavMenu();
      }
      this.applyMenuForRoute(to.path);
      next();
    });
    this.router.afterEach((to) => {
      logger.debug("After each");
      if (this.summitNavMenuItems.length === 0 || SummitRouter.terrainNavMenuItems.length === 0) {
        setTimeout(() => {
          this.resetMenu();
        }, 1000);
      }
      window.$nuxt.$nextTick(() => {
        setTimeout(() => {
          SummitRouter.pageChecks(to);
        }, 100);
      });
    });
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
      component: PresentAwardsVue,
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
      path: "/summit/reports/oasprogression",
      component: OasProgressionVue,
    });
    this.router.addRoute({
      path: "/summit/reports/istatements",
      component: IStatements,
    });
    this.router.addRoute({
      path: "/summit/reports/peakaward",
      component: PeakAward,
    });
    this.router.addRoute({
      path: "/summit/reports/Topo",
      component: Topo,
    });
  }

  private initNavMenu(): void {
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
            title: "OAS Progression",
            to: "/summit/reports/oasprogression",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "I Statements",
            to: "/summit/reports/istatements",
            items: [],
            locked: false,
            roles: [true, false],
          },
          {
            title: "Peak Award Report",
            to: "/summit/reports/peakaward",
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
      title: "Terrain | Summit",
      to: "/summit/home",
      items: [],
      locked: false,
      roles: [true, false],
    };
    // Add the "Terrain | Summit" link to our saved copy of Terrain's menu (not to whatever
    // menu is on screen, which may be the Summit one); applyMenuForRoute puts it on screen.
    if (SummitRouter.terrainNavMenuItems.length > 0 && !SummitRouter.terrainNavMenuItems.some((item) => item.title === "Terrain | Summit")) {
      SummitRouter.terrainNavMenuItems = SummitRouter.terrainNavMenuItems.concat([SummitNavMenuItem]);
    }
  }

  private static getTerrainNavMenuItems(): NavMenuItem[] {
    const navMenuComponent: NavMenuComponent = FindComponent("NavMenu", window.$nuxt.$root as Vue) as NavMenuComponent;
    if (navMenuComponent != null) {
      return Array.from(navMenuComponent.items);
    }

    return [];
  }

  private static switchMenu(items: NavMenuItem[]): void {
    // An empty list means we haven't captured it yet — leave the menu alone rather than blank it.
    if (items.length === 0) return;
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

  private static checkElements(query: string, id: string): boolean {
    if (document.evaluate(query, document, null, XPathResult.ANY_TYPE, null).iterateNext()) return !document.getElementById(id);
    return false;
  }

  private static pageChecks(to: Route): void {
    switch (to.path) {
      case "/logbook/view-record":
        if (this.checkElements(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, "copyClipboardBtn")) InitLogbookRead();
        else setTimeout(() => SummitRouter.pageChecks(to), 100);
        break;
      case "/logbook":
        if (this.checkElements(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, "writeClipboardBtn")) InitLogbookWrite();
        else setTimeout(() => SummitRouter.pageChecks(to), 100);
        break;
      case "/programming/view-activity":
        if (this.checkElements(`//button[@data-cy='PRINT']`, "exportiCalBtn")) InitProgrammingExportBtn();
        else setTimeout(() => SummitRouter.pageChecks(to), 100);
        break;
    }
  }
}
