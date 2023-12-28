import { BaseSummitMessage, SummitDownloadLogbookMessage, SummitMessageEvent, SummitMessageHandler, SummitRouteChangeMessage, SummitUploadLogbookMessage } from "../typings/summitTypes";
import { TerrainProfile } from "../typings/terrainTypes";
import { compareVersions, openIndexedDB, saveToIndexedDB } from "./helpers";
import { loadLogbookData, writeLogbook } from "./terrainButtons/copyLogbook";
import { getCurrentProfile } from "./terrainCalls";

export class SummitContext {
  public upgradeAvailable = false;
  private static instance: SummitContext;
  public summitMessageHandlers: SummitMessageHandler[] = [];
  private bcChannel: BroadcastChannel = new BroadcastChannel("TerrainSummit");
  public currentProfile: TerrainProfile | undefined = undefined;
  public terrainRoute: string = "";
  public terrainRouteChangeHandlers: ((message: SummitRouteChangeMessage) => void)[] = [];
  public loggedin: boolean = false;
  public summitVersion: string = process.env.SUMMITVERSION || "0.0.0";
  public buildMode: string = process.env.SUMMITBUILD || "prod";

  private constructor() {
    this.bcChannel.addEventListener("message", (event: SummitMessageEvent) => {
      this.summitMessageHandlers.forEach((entry) => {
        if (entry.type === event.data.type) {
          entry.handler(event.data);
        }
      });
    });
    this.summitMessageHandlers.push({ type: "loadLogbookData", handler: (data) => loadLogbookData(data as SummitDownloadLogbookMessage, this) });
    this.summitMessageHandlers.push({ type: "writeLogbook", handler: (data) => writeLogbook(data as SummitUploadLogbookMessage, this) });
    this.summitMessageHandlers.push({
      type: "routeChange",
      handler: (data) => {
        this.terrainRoute = (data as SummitRouteChangeMessage).newRoute;
        this.terrainRouteChangeHandlers.forEach((handler) => handler(data as SummitRouteChangeMessage));
      },
    });
    this.checkForUpdate();
  }
  checkForUpdate() {
    if (this.buildMode === "dev") {
      this.upgradeAvailable = true;
      return;
    }
    fetch("https://api.github.com/repos/pete-mc/Summit/releases/latest")
      .then((response) => response.json())
      .then((data) => {
        if (compareVersions(data.tag_name, this.summitVersion)) {
          this.upgradeAvailable = true;
          this.log("New version available");
        }
      });
  }
  updateSummit() {
    if (this.buildMode === "dev") {
      localStorage.setItem("summit-version", "0.0.0");
      window.location.reload();
      return;
    }
    fetch("https://api.github.com/repos/pete-mc/Summit/releases/latest")
      .then((response) => response.json())
      .then((releaseData) => {
        if (compareVersions(releaseData.tag_name, this.summitVersion)) {
          //get latest js from release
          fetch("https://github.com/pete-mc/Summit/releases/download/" + releaseData.tag_name + "/summit.js")
            .then((response) => response.text())
            .then(async (data) => {
              const dbName = "TerrainSummit";
              const storeName = "JSStore";
              const id = "summitJS";
              const db = await openIndexedDB(dbName, storeName);
              await saveToIndexedDB(db, storeName, data, id);
              localStorage.setItem("summit-version", releaseData.tag_name);
              window.location.reload();
            });
        }
      });
  }

  public static getInstance(): SummitContext {
    if (!SummitContext.instance) {
      SummitContext.instance = new SummitContext();
    }

    return SummitContext.instance;
  }

  public get token(): string | null {
    const token = localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c." + this.LastAuthUser + ".idToken");
    if (!token) {
      this.log("No token found");
    }
    return token;
  }

  public get LastAuthUser(): string | null {
    return !this.loggedin ? null : localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser");
  }

  public changePage(page: string) {
    this.bcChannel.postMessage({
      type: "changeRoute",
      newRoute: page,
    });
  }

  //send message to bcChannel
  public sendMessage(message: BaseSummitMessage) {
    this.bcChannel.postMessage(message);
  }

  public addTerrainRouteChangeHandler(handler: (newRoute: SummitRouteChangeMessage) => void) {
    this.terrainRouteChangeHandlers.push(handler);
  }

  public async getData() {
    this.currentProfile = await getCurrentProfile(this);
    // check that there is a valid profile and pause here until there is add a delay to prevent spamming the server
    while (!this.currentProfile) {
      await this.delay(200);
      this.currentProfile = await getCurrentProfile(this);
    }
  }

  public delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public log(message: string) {
    message = "%cSummit: " + message;
    const css = "color: #228B22";
    const stackLines = new Error().stack?.split("\n");
    const originatingLine = stackLines ? stackLines[2] : "";
    if (this.buildMode === "dev") {
      console.log(message, css, originatingLine);
    } else {
      console.debug(message, css, originatingLine);
    }
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).SummitContext = SummitContext;
