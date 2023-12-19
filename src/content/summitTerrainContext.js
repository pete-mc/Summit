"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceURL=TerrainSummit/TerrainContext.js
function onloadTerrain() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.terrainSummitContext = TerrainSummitContext;
    var context = TerrainSummitContext.getInstance();
    context.listen("changeRoute", function (data) {
        window.$nuxt.$router.push({ path: data.newRoute });
    });
    context.listen("addScreens", function (data) {
        if (!Array.isArray(data.ids))
            return;
        for (var index = 0; index < data.ids.length; index++) {
            context.getPageFromDB(data.ids[index]).then(function (page) {
                window.$nuxt.$router.addRoutes(context.getRoutes([page]));
            });
        }
    });
    context.bcChannel.postMessage({
        type: "terrainLoaded",
    });
}
var TerrainSummitContext = /** @class */ (function () {
    function TerrainSummitContext() {
        var _this = this;
        this.bcChannel = new BroadcastChannel("TerrainSummit");
        this.database = indexedDB.open("TerrainSummit", 1);
        this.currentRoute = window.$nuxt.$router.currentRoute;
        this.observationTimer = null;
        this.observationDuration = 3000; // Duration in milliseconds
        this.sendInterval = 100; // Interval in milliseconds
        this.isObserving = false;
        this.bodyObserver = new MutationObserver(function () {
            var nuxtDiv = document.getElementById("__nuxt");
            if (nuxtDiv && !nuxtDiv.getAttribute("summit-observed")) {
                _this.nuxtObserver.disconnect();
                _this.nuxtObserver.observe(nuxtDiv, { childList: true });
                nuxtDiv.setAttribute("summit-observed", "true");
            }
        });
        this.nuxtObserver = new MutationObserver(function () {
            _this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
            if (!_this.isObserving)
                return;
            var layoutDiv = document.getElementById("__layout");
            if (layoutDiv && layoutDiv.getAttribute("summit-observed")) {
                _this.layoutObserver.disconnect();
                _this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });
                layoutDiv.setAttribute("summit-observed", "true");
            }
        });
        this.layoutObserver = new MutationObserver(function () {
            _this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
        });
        this.bodyObserver.observe(document.body, { childList: true });
        var nuxtDiv = document.getElementById("__nuxt");
        if (nuxtDiv && !nuxtDiv.getAttribute("summit-observed")) {
            this.nuxtObserver.observe(document.body, { childList: true });
            nuxtDiv.setAttribute("summit-observed", "true");
        }
        window.$nuxt.$router.afterEach(function (to, from) {
            _this.currentRoute = to;
            _this.sendToSummit(to, from); //immediately send route change to Summit
            _this.resetObservationTimer(); //start observing for changes to update Summit if needed
        });
        this.sendToSummit(this.currentRoute);
        this.sendToSummitDebounced = this.debounce(this.sendToSummit.bind(this), this.sendInterval);
        return TerrainSummitContext.instance;
    }
    TerrainSummitContext.prototype.resetObservationTimer = function () {
        var _this = this;
        if (this.observationTimer) {
            clearTimeout(this.observationTimer);
        }
        this.isObserving = true;
        this.observationTimer = setTimeout(function () {
            _this.stopAndClearObservers();
        }, this.observationDuration);
        this.startObserving();
    };
    TerrainSummitContext.prototype.startObserving = function () {
        console.debug("Starting route observation for " + this.currentRoute.path);
        var layoutDiv = document.getElementById("__layout");
        if (layoutDiv)
            this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });
        else
            this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);
    };
    TerrainSummitContext.prototype.stopAndClearObservers = function () {
        this.layoutObserver.disconnect();
        this.isObserving = false;
        console.debug("Stopping route observation for " + this.currentRoute.path);
    };
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
        try {
            this.bcChannel.postMessage({
                type: "routeChange",
                newRoute: to.fullPath,
                oldRoute: from ? from.fullPath : undefined,
            });
        }
        catch (error) {
            console.error("Error sending message to BroadcastChannel:", error);
        }
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
                self.bcChannel.postMessage({
                    type: "onloadSummit",
                    id: screen.id,
                });
            },
            render: function (h) {
                return h("div", { domProps: { innerHTML: screen.html } });
            },
        };
    };
    TerrainSummitContext.prototype.getRoutes = function (pages) {
        var _this = this;
        return pages.map(function (page) {
            return {
                path: page.path,
                component: _this.createComponent(page),
            };
        });
    };
    TerrainSummitContext.prototype.addPageToDB = function (item, store) {
        var transaction = this.database.result.transaction([store], "readwrite");
        var objectStore = transaction.objectStore(store);
        objectStore.add(item);
    };
    TerrainSummitContext.prototype.getPageFromDB = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var transaction = _this.database.result.transaction(["SummitPages"], "readonly");
            var objectStore = transaction.objectStore("SummitPages");
            var request = objectStore.get(key);
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    };
    return TerrainSummitContext;
}());
if (window.$nuxt) {
    window.$nuxt.$router.onReady(function () {
        onloadTerrain();
    });
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
