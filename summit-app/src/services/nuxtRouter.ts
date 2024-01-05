import { NuxtAppOptions } from "@nuxt/types/app";
import VueRouter from "vue-router";

export class NuxtRouter {
  public currentRoute: string = "";

  private constructor() {}

  private static instance: NuxtRouter;
  private static router: VueRouter = (window.$nuxt as NuxtAppOptions).$router;
  public static getInstance(): NuxtRouter {
    return NuxtRouter.instance ? NuxtRouter.instance : (NuxtRouter.instance = new NuxtRouter());
  }

  navigateTo(route: string | { path: string; name?: string; query?: never; params?: never; hash?: string }) {
    if (typeof route === "string") {
      NuxtRouter.router.push(route);
    } else {
      // route is an object with additional options
      NuxtRouter.router.$router.push({
        path: route.path,
        name: route.name,
        query: route.query, // Object representing the URL query parameters
        params: route.params, // Object representing dynamic segments of the path
        hash: route.hash, // URL hash fragment (e.g., #section-name)
        // Additional options like `replace` or `append` can also be included
      });
    }
  }
}

export default NuxtRouter;
