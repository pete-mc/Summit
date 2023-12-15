"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceURL=TerrainSummit/TerrainContext.js
var bcChannel = new BroadcastChannel('TerrainSummit');
function SendtoSummit() {
    //BroadcastChannel route changes to Summit  
    window.$nuxt.$router.afterEach(function (to, from) {
        bcChannel.postMessage({
            type: 'routeChange',
            data: { newRoute: to.fullPath }
        });
    });
    //Wait for first page load and send default route
    new MutationObserver(function (mutationsList, observer) {
        for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
            var mutation = mutationsList_1[_i];
            if (mutation.type === 'childList') {
                bcChannel.postMessage({
                    type: 'routeChange',
                    data: { newRoute: window.$nuxt.$router.currentRoute.fullPath }
                });
                observer.disconnect();
                break;
            }
        }
    }).observe(document.getElementById('__layout'), { childList: true });
}
function ReceiveFromSummit() {
    // Receive messages from Summit
    bcChannel.addEventListener("message", function (event) {
        switch (event.data.type) {
            case "changeRoute":
                window.$nuxt.$router.push({ path: event.data.newRoute });
                break;
            case "addScreens":
                event.data.screens.forEach(function (screen) {
                    window.$nuxt.$router.addRoutes([{
                            path: screen.path,
                            component: {
                                created: function () {
                                    screen.onload();
                                },
                                render: function (h) {
                                    return h('div', { domProps: { innerHTML: screen.html } });
                                }
                            }
                        }]);
                });
                break;
        }
    });
}
if (window.$nuxt) {
    window.$nuxt.$router.onReady(function () {
        ReceiveFromSummit();
        SendtoSummit();
    });
}
