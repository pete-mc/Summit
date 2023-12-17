import { SummitAddSreensMessage, SummitMessageEvent, SummitRouteChangeMessage, SummitScreen } from "../../typings/summitTypes";
import {  } from "../../typings/terrainContext";
//# sourceURL=TerrainSummit/TerrainContext.js
function onloadTerrain() {
  (window as any).terrainSummitContext = TerrainSummitContext;
  let context = TerrainSummitContext.getInstance();
  context.listen("changeRoute", (event: MessageEvent<SummitRouteChangeMessage>)=>{
    window.$nuxt.$router.push({ path: event.data.newRoute });
  });
  context.listen("addScreens", (event: MessageEvent<SummitAddSreensMessage>)=>{
    event.data.screens.forEach(screen => {
      window.$nuxt.$router.addRoutes([{
          path: screen.path,
          component: context.createComponent(screen)
      }]);
    });
  });
}

class TerrainSummitContext {
  private static instance: any;
  private bcChannel: BroadcastChannel = new BroadcastChannel('TerrainSummit');
  public currentRoute: Route = window.$nuxt.$router.currentRoute;
  public sendToSummitDebounced: (...args: any[]) => void;

  constructor() {
    window.$nuxt.$router.afterEach((to, from) => {
      this.sendToSummit(to, from);
    });
    this.domWatcher("body");
    this.sendToSummit(this.currentRoute, this.currentRoute);
    this.sendToSummitDebounced = this.debounce(this.sendToSummit.bind(this), 250);
    return TerrainSummitContext.instance;
  }

  public static getInstance() {
    if (!TerrainSummitContext.instance) {
      TerrainSummitContext.instance = new TerrainSummitContext();
    }
    return TerrainSummitContext.instance;
  }

  public sendToSummit(to: Route, from: Route) {
    this.bcChannel.postMessage({
      type: 'routeChange',
      data: { newRoute: to.fullPath, oldRoute: from.fullPath }
    });
  }

  private debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: string | number | NodeJS.Timeout | undefined;
    return function(...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
  }

  public listen(type: string, callback: (event:MessageEvent<SummitAddSreensMessage | SummitRouteChangeMessage>)=>void ) {
    this.bcChannel.addEventListener("message", (event: MessageEvent) => {
      if (event.data.type === type) {
        callback(event.data);
      }
    });
  }

  public createComponent(screen: SummitScreen) {
    const self = this; // Capture the context for use in callbacks
    return {
        created() {
            if (screen.onloadTerrain) screen.onloadTerrain();
            if (screen.onloadSummit) {
                self.bcChannel.postMessage({
                    type: 'onloadSummit',
                    data: { onloadSummit: screen.onloadSummit }
                });
            }
        },
        render(h: any) {
            return h('div', { domProps: { innerHTML: screen.html } });
        }
    };
  }

  private domWatcher(element: string) {
      let el = element === "body" ? document.body : document.getElementById(element);
      if (!el || el.getAttribute('summit-observed')) return;
      new MutationObserver((mutationsList) => {
          for (let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  if (element != "body") this.sendToSummitDebounced(window.$nuxt.$router.currentRoute, window.$nuxt.$router.currentRoute);
                  switch (element) {
                      case "body":
                          this.domWatcher("__nuxt");
                          break;
                      case "__nuxt":
                          this.domWatcher("__layout");
                          break;
                      case "__layout":
                          this.domWatcher("nuxt");
                          break;
                  }
                  break;
              }
          }
      }).observe(el, { childList: true });
      el.setAttribute('summit-observed', 'true');
  }
}

if (window.$nuxt) {
  window.$nuxt.$router.onReady(() => {
    onloadTerrain();
  });
}



// let bcChannel = new BroadcastChannel('TerrainSummit');

// function InitSender() {
//     //Broadcast route changes to Summit  
//     window.$nuxt.$router.afterEach((to, from) => {
//       SendToSummit(to, from);
//     });

//     //Broadcast an extra route change on __layout change
//     DOMWatcher("body");

//     //run one on load in case the page was already loaded / cached
//     SendToSummit(window.$nuxt.$router.currentRoute,window.$nuxt.$router.currentRoute);
// }

// function DOMWatcher(element: string){
//   let el = element === "body" ? document.body : document.getElementById(element) as HTMLElement;
//   if(!el || el.getAttribute('summit-observed')) return;
//   new MutationObserver((mutationsList, observer) => {
//     for (let mutation of mutationsList) {
//       if (mutation.type === 'childList') {
//         if (element != "body") SendToSummit(window.$nuxt.$router.currentRoute,window.$nuxt.$router.currentRoute);
//         switch (element) {  
//           case "body":
//             DOMWatcher("__nuxt");
//             break;
//           case "__nuxt":
//             DOMWatcher("__layout");
//             break;
//           case "__layout":
//             DOMWatcher("nuxt");
//             break;      
//         }
//         break;
//       }
//     }
//   }).observe(document.getElementById(element) as HTMLElement, { childList: true });
//   el.setAttribute('summit-observed', 'true');
// }

// function SendToSummit(to: Route, from: Route): void {
//   bcChannel.postMessage({
//     type: 'routeChange',
//     data: { newRoute: to.fullPath, oldRoute: from.fullPath }
//   } as SummitMessageEvent<SummitRouteChangeMessage>);
// }

// function InitReciever() {
//     // Receive messages from Summit
//     bcChannel.addEventListener("message", (event: MessageEvent<SummitAddSreensMessage | SummitRouteChangeMessage>) => {
//         switch (event.data.type) {
//             case "changeRoute":
//                 window.$nuxt.$router.push({ path: event.data.newRoute });
//                 break;
//             case "addScreens": 
//                 event.data.screens.forEach(screen => {
//                     window.$nuxt.$router.addRoutes([{
//                         path: screen.path,
//                         component: {
//                             created() {
//                                 if(screen.onloadTerrain) screen.onloadTerrain();
//                                 if(screen.onloadSummit) {
//                                   //Send message to Summit
//                                   bcChannel.postMessage({
//                                     type: 'onloadSummit',
//                                     data: { onloadSummit: screen.onloadSummit }
//                                   });
//                                 }
//                             },
//                             render(h) {
//                                 return h('div', { domProps: { innerHTML: screen.html } });
//                             }
//                         }
//                     }]);
//                 });
//                 break;
//         }
//     });
// }

// if (window.$nuxt) {
//     window.$nuxt.$router.onReady(() => {
//         InitReciever();
//         InitSender();
//     });
// }

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