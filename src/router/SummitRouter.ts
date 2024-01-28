import { AddMenuItems, FindComponent } from "@/helpers";
import { Home, DisplayOptions, MilestoneReport, OasReport, Topo } from "@/pages";
import { NavMenuComponent, NavMenuItem } from "@/types/NavMenu";
import { get } from "http";
import { VueRouter } from "vue-router/types/router";

export default class SummitRouter {
  private static instance: SummitRouter;
  private router: VueRouter;
  private summitNavMenuItems: NavMenuItem[];
  private terrainNavMenuItems: NavMenuItem[];

  constructor() {
    this.router = window.$nuxt.$router;
    this.summitNavMenuItems = [];
    this.terrainNavMenuItems = this.getTerrainNavMenuItems();
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
    this.router.addRoute({ path: '/terrain', redirect: '/basecamp'});
    this.router.addRoute({ path: '/summit/home', component: Home });
    this.router.addRoute({ path: '/summit/tools/DisplayOptions', component: DisplayOptions });
    this.router.addRoute({ path: '/summit/reports/milestone', component: MilestoneReport });
    this.router.addRoute({ path: '/summit/reports/oas', component: OasReport });
    this.router.addRoute({ path: '/summit/reports/Topo', component: Topo });
    this.router.beforeEach((to, from, next) => {
      if (to.path.includes('summit')) {
        this.switchMenu(this.summitNavMenuItems);
      }
      else {
        this.switchMenu(this.terrainNavMenuItems);
      }
      next();
    });
  }

  private async initNavMenu(): Promise<void> {
    this.summitNavMenuItems = [{
      title: "Basecamp",
      to: '/terrain',
      items: [],
      locked: this.terrainNavMenuItems[0].locked,
      roles: this.terrainNavMenuItems[0].roles
    },
    {
      title: 'Reports',
      items: [
        { title: 'Milestone Progress', to: '/summit/reports/milestone', items: [], locked: false, roles: [true, false] },
        { title: 'OAS Summary', to: '/summit/reports/oas', items: [], locked: false, roles: [true, false] },
        { title: 'Topo Reports', to: '/summit/reports/Topo', items: [], locked: false, roles: [true, false] }
      ],
      locked: false,
      roles: [true, false]
    },
    {
      title: 'Tools',
      items: [
        { title: 'Present Awards', to: '/summit/PresentAwards', items: [], locked: false, roles: [true, false] },
        { title: 'Display Options', to: '/summit/tools/DisplayOptions', items: [], locked: false, roles: [true, false] }
      ],
      locked: false,
      roles: [true, false]
    }];
    const SummitNavMenuItem: NavMenuItem = {
      title: 'Summit',
      to: '/summit/home',
      items: [],
      locked: false,
      roles: [true, false]
    }
    this.addMenuItems([SummitNavMenuItem]);
  }

  private getTerrainNavMenuItems(): NavMenuItem[] {
    const navMenuComponent: NavMenuComponent = FindComponent('NavMenu', window.$nuxt.$root as Vue) as NavMenuComponent
    if (navMenuComponent != null) {
      return  Array.from(navMenuComponent.items);
    }
    else {
      return [];
    }
  }

  private addMenuItems(items: NavMenuItem[]): void {
    window.$nuxt.$nextTick(() => {
      const navMenuComponent: NavMenuComponent = FindComponent('NavMenu', window.$nuxt.$root as Vue) as NavMenuComponent
      if (navMenuComponent != null) {
        for (let i = 0; i < items.length; i++) {
          navMenuComponent.items.push(items[i])
          this.terrainNavMenuItems = Array.from(navMenuComponent.items);
        }
        navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
        navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
      }
    });
  }

  private switchMenu(items: NavMenuItem[]): void {
    window.$nuxt.$nextTick(() => {
      const navMenuComponent: NavMenuComponent = FindComponent('NavMenu', window.$nuxt.$root as Vue) as NavMenuComponent
      if (navMenuComponent != null) {
        console.log("splice");
        navMenuComponent.items.splice(0, navMenuComponent.items.length);
        console.log(navMenuComponent.items);
        console.log("for loop");
        for (let i = 0; i < items.length; i++) {
          console.log("adding item" + items[i].title);
          navMenuComponent.items.push(items[i]);
        }
        console.log(navMenuComponent.items);
        navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
        navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
      }
    });
  }

}