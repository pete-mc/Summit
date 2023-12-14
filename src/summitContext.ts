import { loadLogbookData, writeLogbook } from "./terrainButtons/copyLogbook";
import { getCurrentProfile } from "./terrainCalls";

export class SummitContext {
    summitMessageHandlers: any[] = [];
    private bcChannel: BroadcastChannel = new BroadcastChannel('TerrainSummit');
    currentProfile: any;
    terrainRoute: string = "";
    terrainRouteChangeHandlers: ((newRoute: string) => void)[] = [];
    loggedin: boolean = false;

    constructor() {
        this.bcChannel.addEventListener("message", (event: MessageEvent) => {
          this.summitMessageHandlers.forEach(entry => {
            if (entry.type === event.data.type) {
              entry.handler(event.data);
            }
          });
        });
        this.summitMessageHandlers.push({type: "loadLogbookData", handler: (e: MessageEvent) => loadLogbookData(e.data, this)});
        this.summitMessageHandlers.push({type: "writeLogbook", handler: (e: MessageEvent) => writeLogbook(e.data, this)});
        this.summitMessageHandlers.push({type: "routeChange", handler: (e: MessageEvent) => { 
          this.terrainRoute = e.data.newRoute; 
          this.terrainRouteChangeHandlers.forEach(handler => handler(e.data.newRoute));
        }});
        let injectButton = document.createElement('button');
        injectButton.style.display = 'none'; // Hide the button
        injectButton.setAttribute('onclick', `
          if (window.$nuxt) {
            let bcChannel = new BroadcastChannel('TerrainSummit');
            bcChannel.postMessage({
              type: 'routeChange',
              data: { newRoute: window.$nuxt.$router.currentRoute.fullPath }
            });
            window.$nuxt.$router.afterEach((to, from) => {
              bcChannel.postMessage({
                type: 'routeChange',
                data: { newRoute: to.fullPath }
              });
            });
          }
        `);
        document.body.appendChild(injectButton);
        injectButton.click(); // Trigger the onclick event
        document.body.removeChild(injectButton);
    }
    get token(): string {
        const token = localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+this.LastAuthUser+".idToken");
        if (!token) {
            throw new Error("No token found");
        }
        return token;
    }

    get LastAuthUser (): string | null {
      return !this.loggedin ? null : localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');
    } 

    addTerrainRouteChangeHandler(handler: (newRoute: string) => void) {
      this.terrainRouteChangeHandlers.push(handler);
    } 

    async getData (){
      this.currentProfile = await getCurrentProfile(this);
      // check that there is a valid profile and pause here until there is add a delay to prevent spamming the server
      while (!this.currentProfile) {
          await setTimeout(() => { this.currentProfile = getCurrentProfile(this); }, 100);
      }
    }
    
}