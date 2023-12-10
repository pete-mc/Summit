import { loadLogbookData, writeLogbook } from "./terrainButtons/copyLogbook";
import { getCurrentProfile } from "./terrainCalls";

export class SummitContext {
    summitMessageHandlers: any[] = [];
    private bcChannel: BroadcastChannel = new BroadcastChannel('TerrainSummit');
    LastAuthUser: string | null = localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');
    currentProfile: any;

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
    }
    get token(): string {
        const token = localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+this.LastAuthUser+".idToken");
        if (!token) {
            throw new Error("No token found");
        }
        return token;
    }

    async getData (){
      // check that there is a valid auth user and pause here until there is add a delay to prevent spamming the browser
      this.LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');
      while (!this.LastAuthUser) {
          await setTimeout(() => { this.LastAuthUser = localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser'); }, 100);
      }
      this.currentProfile = await getCurrentProfile(this);
      // check that there is a valid profile and pause here until there is add a delay to prevent spamming the server
      while (!this.currentProfile) {
          await setTimeout(() => { this.currentProfile = getCurrentProfile(this); }, 100);
      }
    }
    
}