/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Vue {
    created?: () => void;
    mounted?: () => void;
    render: (h: (tag: string, data: any) => any) => any;
    data: () => { isLoaded: boolean };
    isLoaded?: boolean;
  }

  interface addRoute {
    path: string;
    component: Vue;
  }

  interface Route {
    fullPath: string;
    path: string;
    query: Record<string, any>;
    params: Record<string, any>;
  }

  interface Window {
    $: any;
    jQuery: any;
    $nuxt: {
      [x: string]: any;
      $router: {
        afterEach: (callback: (to: Route, from: Route) => void) => void;
        onReady: (callback: () => void) => void;
        addRoutes: (routes: Array<{ path: string; component: Vue }>) => void;
        push: (route: { path: string; query?: any }) => void;
        currentRoute: Route;
        back: () => void;
      };
    };
  }
}

export {};
