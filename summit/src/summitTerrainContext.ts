import { SummitMessage, SummitOnLoadMessage, SummitRouteChangeMessage, SummitScreen } from "../typings/summitTypes";

//# sourceURL=TerrainSummit/TerrainContext.js
export function loadTerrainContext() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).terrainSummitContext = TerrainSummitContext;
  const context = TerrainSummitContext.getInstance();
  context.listen("changeRoute", (data) => {
    window.$nuxt.$router.push({ path: (data as SummitRouteChangeMessage).newRoute });
  });
  context.listen("addScreens", (data) => {
    if (!Array.isArray(data.ids)) return;
    // context.loadPagesFromDB(data.ids);
    window.$nuxt.$router.addRoutes(context.getRoutes(data.pages as SummitScreen[]));
  });
  context.bcChannel.postMessage({ type: "terrainLoaded" });
}

export class TerrainSummitContext {
  private static instance: TerrainSummitContext;
  public bcChannel: BroadcastChannel = new BroadcastChannel("TerrainSummit");
  public currentRoute: Route = window.$nuxt.$router.currentRoute;
  public sendToSummitDebounced: (to: Route, from?: Route) => void;
  private observationTimer: NodeJS.Timeout | null = null;
  private readonly observationDuration = 3000; // Duration in milliseconds
  private readonly sendInterval = 100; // Interval in milliseconds
  private isObserving = false;
  private bodyObserver = new MutationObserver(() => {
    const nuxtDiv = document.getElementById("__nuxt");
    if (nuxtDiv && !nuxtDiv.getAttribute("summit-observed")) {
      this.nuxtObserver.disconnect();
      this.nuxtObserver.observe(nuxtDiv, { childList: true });
      nuxtDiv.setAttribute("summit-observed", "true");
    }
  });
  private nuxtObserver = new MutationObserver(() => {
    this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
    if (!this.isObserving) return;
    const layoutDiv = document.getElementById("__layout");
    if (layoutDiv && layoutDiv.getAttribute("summit-observed")) {
      this.layoutObserver.disconnect();
      this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });
      layoutDiv.setAttribute("summit-observed", "true");
    }
  });
  private layoutObserver = new MutationObserver(() => {
    this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
  });

  constructor() {
    this.bodyObserver.observe(document.body, { childList: true });
    const nuxtDiv = document.getElementById("__nuxt");
    if (nuxtDiv && !nuxtDiv.getAttribute("summit-observed")) {
      this.nuxtObserver.observe(document.body, { childList: true });
      nuxtDiv.setAttribute("summit-observed", "true");
    }
    window.$nuxt.$router.afterEach((to, from) => {
      this.currentRoute = to;
      this.sendToSummit(to, from); //immediately send route change to Summit
      this.resetObservationTimer(); //start observing for changes to update Summit if needed
    });
    this.sendToSummit(this.currentRoute);
    this.sendToSummitDebounced = this.debounce(this.sendToSummit.bind(this), this.sendInterval) as (to: Route, from?: Route) => void;
    return TerrainSummitContext.instance;
  }

  private resetObservationTimer() {
    if (this.observationTimer) {
      clearTimeout(this.observationTimer);
    }
    this.isObserving = true;
    this.observationTimer = setTimeout(() => {
      this.stopAndClearObservers();
    }, this.observationDuration);
    this.startObserving();
  }

  private startObserving() {
    console.debug("Starting route observation for " + this.currentRoute.path);
    const layoutDiv = document.getElementById("__layout");
    if (layoutDiv) this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });
    else this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
  }

  private stopAndClearObservers() {
    this.layoutObserver.disconnect();
    this.isObserving = false;
    console.debug("Stopping route observation for " + this.currentRoute.path);
  }

  public waitForNuxtTicks(callback: (...args: unknown[]) => void, ticks: number, args: unknown[] = []) {
    if (ticks <= 0) {
      callback.apply(this, args);
      return;
    }
    window.$nuxt.$nextTick(() => this.waitForNuxtTicks(callback, --ticks, args));
  }

  public static getInstance() {
    if (!TerrainSummitContext.instance) {
      TerrainSummitContext.instance = new TerrainSummitContext();
    }
    return TerrainSummitContext.instance;
  }

  public sendToSummit(to: Route, from?: Route) {
    try {
      this.bcChannel.postMessage({
        type: "routeChange",
        newRoute: to.fullPath,
        oldRoute: from ? from.fullPath : undefined,
      });
    } catch (error) {
      console.error("Error sending message to BroadcastChannel:", error);
    }
  }

  private debounce(func: (...args: never[]) => void, wait: number) {
    let timeout: string | number | NodeJS.Timeout | undefined;
    return function (...args: never[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  public listen(type: string, callback: (event: SummitMessage) => void) {
    this.bcChannel.addEventListener("message", (event) => {
      if (event.data.type === type) {
        callback(event.data);
      }
    });
  }

  public createComponent(screen: SummitScreen): Vue {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this; // Capture the context for use in callbacks in nuxt
    return {
      mounted() {
        if (!this.isLoaded) {
          this.isLoaded = true;
          self.bcChannel.postMessage({
            type: "onloadSummit",
            id: screen.id,
          } as SummitOnLoadMessage);
        }
      },
      render(h: (el: string, {}) => void) {
        return h("div", { domProps: { innerHTML: screen.html } });
      },
      data() {
        return {
          isLoaded: false,
        };
      },
    };
  }

  public getRoutes(pages: SummitScreen[]): addRoute[] {
    return pages.map((page) => {
      return {
        path: page.path,
        component: this.createComponent(page),
      };
    });
  }
}

// $nuxt.$router: This is the Vue Router instance. You can use it to programmatically navigate to different routes, add new routes, or listen for route changes.
// $nuxt.$store: If the application uses Vuex for state management, this is the Vuex store. You can use it to read state, commit mutations, or dispatch actions.
// State: Access the state (data) of your application. For example, $nuxt.$store.state.myModule.myData would access the myData state in myModule.
// Getters: Access computed state that's derived from the base state. For example, $nuxt.$store.getters['myModule/myGetter'] would access the myGetter getter in myModule.
// Mutations: Commit mutations to change the state. Mutations are synchronous functions. For example, $nuxt.$store.commit('myModule/myMutation', payload) would commit the myMutation mutation in myModule with a certain payload.
// Actions: Dispatch actions to perform asynchronous operations and then commit mutations. For example, $nuxt.$store.dispatch('myModule/myAction', payload) would dispatch the myAction action in myModule with a certain payload.
// $nuxt.$route: This is the current route. It contains information about the current URL, query parameters, route parameters, and more.
// $nuxt.$options: This is the options object that the current Vue instance was created with. It contains all the options that were passed to new Vue().
// $nuxt.refresh(): This method can be used to manually refresh the current page. This can be useful if you've made changes that need to be reflected in the UI.
// $nuxt.error(params): This method can be used to display an error page.
// $nuxt.context: This is the context object that's passed to asyncData, fetch, plugins, middleware, and nuxtServerInit. It provides access to various aspects of the Nuxt.js application.
// $nuxt.$children: This is an array that contains all direct child components of the current instance. This can be useful if you need to access methods or data on child components from a parent component.
// $nuxt.$el: This is the root DOM element of the current instance. This can be useful if you need to access the DOM element directly.
