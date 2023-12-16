import { BaseSummitMessage, SummitDownloadLogbookMessage, SummitMessageEvent, SummitMessageHandler, SummitRouteChangeMessage, SummitUploadLogbookMessage } from "../typings/summitTypes";
import { TerrainProfile } from "../typings/terrainTypes";
import { loadLogbookData, writeLogbook } from "./terrainButtons/copyLogbook";
import { getCurrentProfile } from "./terrainCalls";

export class SummitContext {
  private static instance: SummitContext;
  public summitMessageHandlers: SummitMessageHandler[] = [];
  private bcChannel: BroadcastChannel = new BroadcastChannel('TerrainSummit');
  public currentProfile: TerrainProfile | undefined = undefined;
  public terrainRoute: string = "";
  public terrainRouteChangeHandlers: ((newRoute: string) => void)[] = [];
  public loggedin: boolean = false;
  public summitVersion: string = process.env.SUMMITVERSION || "0.0.0";
  public buildMode: string = process.env.SUMMITBUILD || "prod";

  private constructor() {
      this.bcChannel.addEventListener("message", (event: MessageEvent) => {
        this.summitMessageHandlers.forEach(entry => {
          if (entry.type === event.data.type) {
            entry.handler(event.data);
          }
        });
      });
      this.summitMessageHandlers.push({type: "loadLogbookData", handler: (e: SummitMessageEvent<SummitDownloadLogbookMessage>) => loadLogbookData(e.data, this)});
      this.summitMessageHandlers.push({type: "writeLogbook", handler: (e: SummitMessageEvent<SummitUploadLogbookMessage>) => writeLogbook(e.data, this)});
      this.summitMessageHandlers.push({type: "routeChange", handler: (e: SummitMessageEvent<SummitRouteChangeMessage>) => { 
        this.terrainRoute = e.data.newRoute; 
        this.terrainRouteChangeHandlers.forEach(handler => handler(e.data.newRoute));
      }});
  }

  public static getInstance(): SummitContext {
    if (!SummitContext.instance) {
      SummitContext.instance = new SummitContext();
    }

    return SummitContext.instance;
  }

  public get token(): string | null {
      const token = localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+this.LastAuthUser+".idToken");
      if (!token) {
          this.log("No token found");
      }
      return token;
  }

  public get LastAuthUser (): string | null {
    return !this.loggedin ? null : localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');
  } 

  public changePage(page: string) {
    this.bcChannel.postMessage({
      type: 'changeRoute',
      newRoute: page
    });
  }

  //send message to bcChannel
  public sendMessage(message: BaseSummitMessage) {
    this.bcChannel.postMessage(message);
  }

  public addTerrainRouteChangeHandler(handler: (newRoute: string) => void) {
    this.terrainRouteChangeHandlers.push(handler);
  } 

  public async getData (){
    this.currentProfile = await getCurrentProfile(this);
    // check that there is a valid profile and pause here until there is add a delay to prevent spamming the server
    while (!this.currentProfile) {
        await setTimeout(async() => { this.currentProfile = await getCurrentProfile(this); }, 100);
    }
  }

  public log(message: string) {
    message = "%cSummit: " + message;
    const css = "color: #228B22";

    // Create a new Error object and split the stack trace into lines
    const stackLines = new Error().stack?.split('\n');

    // The third line of the stack trace should be the originating line
    const originatingLine = stackLines ? stackLines[2] : '';

    if (this.buildMode === "dev") {
      console.log(message, css, originatingLine);
    } else {
      console.debug(message, css, originatingLine);
    }
  }
}
(window as any).SummitContext = SummitContext;