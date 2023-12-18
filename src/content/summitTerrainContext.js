"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceURL=TerrainSummit/TerrainContext.js
function onloadTerrain() {
    var _this = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.terrainSummitContext = TerrainSummitContext;
    var context = TerrainSummitContext.getInstance();
    context.listen("changeRoute", function (data) {
        window.$nuxt.$router.push({ path: data.newRoute });
    });
    context.listen("addScreens", function (data) { return __awaiter(_this, void 0, void 0, function () {
        var _i, _a, id, page;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = data.ids;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    id = _a[_i];
                    return [4 /*yield*/, context.getPageFromDB(id)];
                case 2:
                    page = _b.sent();
                    window.$nuxt.$router.addRoutes(context.getRoutes([page]));
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    }); });
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
