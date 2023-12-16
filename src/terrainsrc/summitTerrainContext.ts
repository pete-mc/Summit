import { SummitAddSreensMessage, SummitRouteChangeMessage } from "../../typings/summitTypes";
import {  } from "../../typings/terrainContext";

//# sourceURL=TerrainSummit/TerrainContext.js
let bcChannel = new BroadcastChannel('TerrainSummit');

function SendtoSummit() {
    //BroadcastChannel route changes to Summit  
    window.$nuxt.$router.afterEach((to, from) => {
      bcChannel.postMessage({
        type: 'routeChange',
        data: { newRoute: to.fullPath }
      });
    });
    
    //Wait for first page load and send default route
    new MutationObserver((mutationsList, observer) => {
      for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          bcChannel.postMessage({
            type: 'routeChange',
            data: { newRoute: window.$nuxt.$router.currentRoute.fullPath }
          });
          observer.disconnect();
          break;
        }
      }
    }).observe(document.getElementById('__layout') as HTMLElement, { childList: true });

}

function ReceiveFromSummit() {
    // Receive messages from Summit
    bcChannel.addEventListener("message", (event: MessageEvent<SummitAddSreensMessage | SummitRouteChangeMessage>) => {
        switch (event.data.type) {
            case "changeRoute":
                window.$nuxt.$router.push({ path: event.data.newRoute });
                break;
            case "addScreens": 
                event.data.screens.forEach(screen => {
                    window.$nuxt.$router.addRoutes([{
                        path: screen.path,
                        component: {
                            created() {
                                if(screen.onloadTerrain) screen.onloadTerrain();
                                if(screen.onloadSummit) {
                                  //Send message to Summit
                                  bcChannel.postMessage({
                                    type: 'onloadSummit',
                                    data: { onloadSummit: screen.onloadSummit }
                                  });
                                }
                            },
                            render(h) {
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
    window.$nuxt.$router.onReady(() => {
        ReceiveFromSummit();
        SendtoSummit();
    });
}
