"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceURL=TerrainSummit/TerrainContext.js
function onloadTerrain() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.terrainSummitContext = TerrainSummitContext;
    var context = TerrainSummitContext.getInstance();
    context.listen("changeRoute", function (event) {
        window.$nuxt.$router.push({ path: event.data.newRoute });
    });
    context.listen("addScreens", function (event) {
        event.data.screens.forEach(function (screen) {
            window.$nuxt.$router.addRoutes([
                {
                    path: screen.path,
                    component: context.createComponent(screen),
                },
            ]);
        });
    });
}
var TerrainSummitContext = /** @class */ (function () {
    function TerrainSummitContext() {
        var _this = this;
        this.bcChannel = new BroadcastChannel("TerrainSummit");
        this.currentRoute = window.$nuxt.$router.currentRoute;
        window.$nuxt.$router.afterEach(function (to, from) {
            var mainElement = document.querySelector("main");
            if (mainElement) {
                _this.waitForNuxtTicks(function (mainElement) {
                    mainElement = document.querySelector("main");
                    new MutationObserver(function () {
                        _this.sendToSummit(to, from);
                    }).observe(mainElement, { attributes: true, childList: true, subtree: false });
                }, 3);
            }
            else {
                _this.waitForNuxtTicks(function () {
                    _this.sendToSummit(to, from);
                }, 3);
            }
        });
        this.domWatcher("body");
        this.sendToSummit(this.currentRoute, this.currentRoute);
        this.sendToSummitDebounced = this.debounce(this.sendToSummit.bind(this), 250);
        return TerrainSummitContext.instance;
    }
    // using window.$nuxt.$nextTick wait for x number of ticks  to complete the callback and pass it args
    TerrainSummitContext.prototype.waitForNuxtTicks = function (callback, ticks, args) {
        var _this = this;
        if (args === void 0) { args = []; }
        if (ticks <= 0) {
            callback.apply(this, args);
            return;
        }
        window.$nuxt.$nextTick(function () { return _this.waitForNuxtTicks(callback, --ticks, args); });
    };
    TerrainSummitContext.getInstance = function () {
        if (!TerrainSummitContext.instance) {
            TerrainSummitContext.instance = new TerrainSummitContext();
        }
        return TerrainSummitContext.instance;
    };
    TerrainSummitContext.prototype.sendToSummit = function (to, from) {
        this.bcChannel.postMessage({
            type: "routeChange",
            data: { newRoute: to.fullPath, oldRoute: from.fullPath },
        });
    };
    TerrainSummitContext.prototype.debounce = function (func, wait) {
        var timeout;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            clearTimeout(timeout);
            timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
        };
    };
    TerrainSummitContext.prototype.listen = function (type, callback) {
        this.bcChannel.addEventListener("message", function (event) {
            if (event.data.type === type) {
                callback(event.data);
            }
        });
    };
    TerrainSummitContext.prototype.createComponent = function (screen) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var self = this; // Capture the context for use in callbacks in nuxt
        return {
            created: function () {
                if (screen.onloadTerrain)
                    screen.onloadTerrain();
                if (screen.onloadSummit) {
                    self.bcChannel.postMessage({
                        type: "onloadSummit",
                        data: { onloadSummit: screen.onloadSummit },
                    });
                }
            },
            render: function (h) {
                return h("div", { domProps: { innerHTML: screen.html } });
            },
        };
    };
    TerrainSummitContext.prototype.domWatcher = function (element) {
        var _this = this;
        var el = element === "body" ? document.body : document.getElementById(element);
        if (!el || el.getAttribute("summit-observed"))
            return;
        new MutationObserver(function (mutationsList) {
            for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
                var mutation = mutationsList_1[_i];
                if (mutation.type === "childList") {
                    if (element != "body")
                        _this.sendToSummitDebounced(window.$nuxt.$router.currentRoute, window.$nuxt.$router.currentRoute);
                    switch (element) {
                        case "body":
                            _this.domWatcher("__nuxt");
                            break;
                        case "__nuxt":
                            _this.domWatcher("__layout");
                            break;
                        case "__layout":
                            _this.domWatcher("nuxt");
                            break;
                    }
                    break;
                }
            }
        }).observe(el, { childList: true });
        el.setAttribute("summit-observed", "true");
    };
    return TerrainSummitContext;
}());
if (window.$nuxt) {
    window.$nuxt.$router.onReady(function () {
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
