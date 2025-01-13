import FindComponent from "../helpers/FindComponent";
import { Home, DisplayOptions, MilestoneReport, OasReport, Topo, PresentAwards, SummitCalendar, PeakAward } from "@/pages";
import { NavMenuComponent, NavMenuItem } from "@/types/NavMenu";
import VueRouter, { Route } from "vue-router";
import Vue from "vue";
import { InitLogbookRead, InitLogbookWrite, InitProgrammingExportBtn, CheckAward, AwardObserverRouter } from "@/components";
import { fetchAchievements } from "@/services";

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

  public finaliseSetup(): void {
    if (SummitRouter.terrainNavMenuItems.length === 0 && window.$nuxt.$store.state.user.username.length != 0) {
      setTimeout(() => {
        this.resetMenu();
        this.finaliseSetup();
      }, 100);
    }
  }

  public resetMenu(): void {
    SummitRouter.terrainNavMenuItems = SummitRouter.getTerrainNavMenuItems();
    this.initNavMenu();
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
    // this.router.addRoute({
    //   path: "/summit/tools/PresentAwards",
    //   component: PresentAwards,
    // });
    this.router.addRoute({
      path: "/summit/reports/milestone",
      component: MilestoneReport,
    });
    this.router.addRoute({
      path: "/summit/reports/oas",
      component: OasReport,
    });
    this.router.addRoute({
      path: "/summit/reports/peakaward",
      component: PeakAward,
    });
    this.router.addRoute({
      path: "/summit/reports/Topo",
      component: Topo,
    });
    this.router.beforeEach((to, from, next) => {
      if (to.path.includes("summit")) {
        SummitRouter.switchMenu(this.summitNavMenuItems);
      } else {
        if (SummitRouter.terrainNavMenuItems.length === 0) {
          this.resetMenu();
        }
        SummitRouter.switchMenu(SummitRouter.terrainNavMenuItems);
      }
      next();
    });
    this.router.afterEach((to) => {
      console.log("After each");
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
          // {
          //   title: "Present Awards",
          //   to: "/summit/tools/PresentAwards",
          //   items: [],
          //   locked: false,
          //   roles: [true, false],
          // },
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
    //check if SummitRouter.terrainNavMenuItems has a item with the title "Terrain | Summit"
    if (!SummitRouter.terrainNavMenuItems.some((item) => item.title === "Terrain | Summit")) SummitRouter.addMenuItems([SummitNavMenuItem]);
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
      case "/milestones":
        if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 1)").length > 0)
          CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 1 }).then(() => {
            AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", to, this.pageChecks);
          });
        if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 2)").length > 0)
          CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 2 }).then(() => {
            AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", to, this.pageChecks);
          });
        if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0 && $("div.ListItem__title:contains(Milestone 3)").length > 0)
          CheckAward({ name: "milestone", path: "achievement_meta.stage", value: 3 }).then(() => {
            AwardObserverRouter($(".Milestones__carousel-image"), "div.presentedAwardListItem", to, this.pageChecks);
          });
        break;
      case "/intro-scouting":
      case "/intro-section":
      case "/adventurous-journey":
      case "/personal-reflection":
      case "/personal-development":
      case "/oas":
      case "/sia":
        if ($("span.v-chip__content:contains(Awarded)").length > 0 && $("span.presentedAward").length === 0) {
          console.log("Fetching achievements");
          const type =
            [
              { route: "/oas", type: "outdoor_adventure_skill" },
              { route: "/sia", type: "special_interest_area" },
              { route: "/personal-development", type: "course_reflection" },
              { route: "/intro-scouting", type: "intro_scouting" },
              { route: "/intro-section", type: "intro_section" },
              { route: "/adventurous-journey", type: "adventurous_journey" },
              { route: "/personal-reflection", type: "personal_reflection" },
            ].find((type) => type.route === to.path)?.type ?? "outdoor_adventure_skill";
          to.path === "/oas" ? "outdoor_adventure_skill" : "special_interest_area";
          const header = to.path.startsWith("/intro-") ? $("hr.BaseList__divider").first() : $("div.AchievementOverview__awarded").first();
          const list = header.next().children("div.List").first();
          list.addClass("AwardedList");
          list.children().each((_index, element) => {
            fetchAchievements(type).then((awards) => {
              CheckAward({ name: type, parent: $(element), awardsPrefetched: awards });
            });
          });
        } else setTimeout(() => SummitRouter.pageChecks(to), 100);
        break;
    }
  }
}
