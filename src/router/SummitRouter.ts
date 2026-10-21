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

  // Gotcha: Terrain's NavMenu appears only after its async login check. Poll for ~30s; afterEach covers a later login.
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
    // On a full page load of a Summit URL no navigation follows, so switch the menu here.
    this.applyMenuForRoute(this.router.currentRoute.path);
  }

  // Gotcha: only snapshot while Terrain's menu is on screen, or Summit's items get saved as Terrain's.
  private captureTerrainMenu(): void {
    const current = SummitRouter.getTerrainNavMenuItems();
    if (current.length > 0 && !SummitRouter.isSummitMenu(current)) {
      SummitRouter.terrainNavMenuItems = current;
    }
  }

  private applyMenuForRoute(path: string): void {
    SummitRouter.switchMenu(path.includes("summit") ? this.summitNavMenuItems : SummitRouter.terrainNavMenuItems);
  }

  private static isSummitMenu(items: NavMenuItem[]): boolean {
    return items.some((item) => (item.items ?? []).some((sub) => typeof sub.to === "string" && sub.to.startsWith("/summit/")));
  }

  private async initRoutes(): Promise<void> {
    // Gotcha: register hooks BEFORE addRoute(). Each addRoute() re-runs navigation, and on a Summit URL page load those are the only navigations.
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
    // Added to the saved Terrain menu, not whichever menu is on screen.
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
