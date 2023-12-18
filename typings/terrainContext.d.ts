/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Vue {
    created: () => void;
    render: (h: (tag: string, data: any) => any) => any;
  }

  interface Route {
    fullPath: string;
    path: string;
    query: Record<string, any>;
    params: Record<string, any>;
  }

  interface Window {
    $nuxt: {
      [x: string]: any;
      $router: {
        afterEach: (callback: (to: Route, from: Route) => void) => void;
        onReady: (callback: () => void) => void;
        addRoutes: (routes: Array<{ path: string; component: Vue }>) => void;
        push: (route: { path: string }) => void;
        currentRoute: Route;
      };
    };
  }
}

export {};
