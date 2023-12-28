/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/summitTerrainContext.ts":
/*!*************************************!*\
  !*** ./src/summitTerrainContext.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\nfunction onloadTerrain() {\n    window.terrainSummitContext = TerrainSummitContext;\n    const context = TerrainSummitContext.getInstance();\n    context.listen(\"changeRoute\", (data) => {\n        window.$nuxt.$router.push({ path: data.newRoute });\n    });\n    context.listen(\"addScreens\", (data) => {\n        if (!Array.isArray(data.ids))\n            return;\n        window.$nuxt.$router.addRoutes(context.getRoutes(data.pages));\n    });\n    context.bcChannel.postMessage({ type: \"terrainLoaded\" });\n}\nclass TerrainSummitContext {\n    static instance;\n    bcChannel = new BroadcastChannel(\"TerrainSummit\");\n    currentRoute = window.$nuxt.$router.currentRoute;\n    sendToSummitDebounced;\n    observationTimer = null;\n    observationDuration = 3000;\n    sendInterval = 100;\n    isObserving = false;\n    bodyObserver = new MutationObserver(() => {\n        const nuxtDiv = document.getElementById(\"__nuxt\");\n        if (nuxtDiv && !nuxtDiv.getAttribute(\"summit-observed\")) {\n            this.nuxtObserver.disconnect();\n            this.nuxtObserver.observe(nuxtDiv, { childList: true });\n            nuxtDiv.setAttribute(\"summit-observed\", \"true\");\n        }\n    });\n    nuxtObserver = new MutationObserver(() => {\n        this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);\n        if (!this.isObserving)\n            return;\n        const layoutDiv = document.getElementById(\"__layout\");\n        if (layoutDiv && layoutDiv.getAttribute(\"summit-observed\")) {\n            this.layoutObserver.disconnect();\n            this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });\n            layoutDiv.setAttribute(\"summit-observed\", \"true\");\n        }\n    });\n    layoutObserver = new MutationObserver(() => {\n        this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);\n    });\n    constructor() {\n        this.bodyObserver.observe(document.body, { childList: true });\n        const nuxtDiv = document.getElementById(\"__nuxt\");\n        if (nuxtDiv && !nuxtDiv.getAttribute(\"summit-observed\")) {\n            this.nuxtObserver.observe(document.body, { childList: true });\n            nuxtDiv.setAttribute(\"summit-observed\", \"true\");\n        }\n        window.$nuxt.$router.afterEach((to, from) => {\n            this.currentRoute = to;\n            this.sendToSummit(to, from);\n            this.resetObservationTimer();\n        });\n        this.sendToSummit(this.currentRoute);\n        this.sendToSummitDebounced = this.debounce(this.sendToSummit.bind(this), this.sendInterval);\n        return TerrainSummitContext.instance;\n    }\n    resetObservationTimer() {\n        if (this.observationTimer) {\n            clearTimeout(this.observationTimer);\n        }\n        this.isObserving = true;\n        this.observationTimer = setTimeout(() => {\n            this.stopAndClearObservers();\n        }, this.observationDuration);\n        this.startObserving();\n    }\n    startObserving() {\n        console.debug(\"Starting route observation for \" + this.currentRoute.path);\n        const layoutDiv = document.getElementById(\"__layout\");\n        if (layoutDiv)\n            this.layoutObserver.observe(layoutDiv, { childList: true, subtree: true });\n        else\n            this.sendToSummitDebounced(window.$nuxt.$router.currentRoute);\n    }\n    stopAndClearObservers() {\n        this.layoutObserver.disconnect();\n        this.isObserving = false;\n        console.debug(\"Stopping route observation for \" + this.currentRoute.path);\n    }\n    waitForNuxtTicks(callback, ticks, args = []) {\n        if (ticks <= 0) {\n            callback.apply(this, args);\n            return;\n        }\n        window.$nuxt.$nextTick(() => this.waitForNuxtTicks(callback, --ticks, args));\n    }\n    static getInstance() {\n        if (!TerrainSummitContext.instance) {\n            TerrainSummitContext.instance = new TerrainSummitContext();\n        }\n        return TerrainSummitContext.instance;\n    }\n    sendToSummit(to, from) {\n        try {\n            this.bcChannel.postMessage({\n                type: \"routeChange\",\n                newRoute: to.fullPath,\n                oldRoute: from ? from.fullPath : undefined,\n            });\n        }\n        catch (error) {\n            console.error(\"Error sending message to BroadcastChannel:\", error);\n        }\n    }\n    debounce(func, wait) {\n        let timeout;\n        return function (...args) {\n            clearTimeout(timeout);\n            timeout = setTimeout(() => func(...args), wait);\n        };\n    }\n    listen(type, callback) {\n        this.bcChannel.addEventListener(\"message\", (event) => {\n            if (event.data.type === type) {\n                callback(event.data);\n            }\n        });\n    }\n    createComponent(screen) {\n        const self = this;\n        return {\n            mounted() {\n                if (!this.isLoaded) {\n                    this.isLoaded = true;\n                    self.bcChannel.postMessage({\n                        type: \"onloadSummit\",\n                        id: screen.id,\n                    });\n                }\n            },\n            render(h) {\n                return h(\"div\", { domProps: { innerHTML: screen.html } });\n            },\n            data() {\n                return {\n                    isLoaded: false,\n                };\n            },\n        };\n    }\n    getRoutes(pages) {\n        return pages.map((page) => {\n            return {\n                path: page.path,\n                component: this.createComponent(page),\n            };\n        });\n    }\n}\nif (window.$nuxt) {\n    window.$nuxt.$router.onReady(() => {\n        onloadTerrain();\n    });\n}\n\n\n\n//# sourceURL=webpack:///./src/summitTerrainContext.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/summitTerrainContext.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;