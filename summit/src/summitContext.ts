import { BaseSummitMessage, SummitDownloadLogbookMessage, SummitMessageEvent, SummitMessageHandler, SummitRouteChangeMessage, SummitUploadLogbookMessage } from "../typings/summitTypes";
import { TerrainEvent, TerrainProfile } from "../typings/terrainTypes";
import { clearCache, compareVersions, openIndexedDB, reconstructGuids, saveToIndexedDB } from "./helpers";
import { loadLogbookData, writeLogbook } from "./terrainButtons/copyLogbook";
import { fetchActivity, fetchMemberEvents } from "./terrainCalls";

export class SummitContext {
  public isAssisting = false;
  public upgradeAvailable = false;
  private static instance: SummitContext;
  public summitMessageHandlers: SummitMessageHandler[] = [];
  private bcChannel: BroadcastChannel = new BroadcastChannel("TerrainSummit");
  public currentProfile: TerrainProfile | undefined = undefined;
  public primaryProfile: TerrainProfile | undefined = undefined;
  public currentProfilesList: TerrainProfile[] = [];
  public terrainRoute: string = "";
  public terrainRouteChangeHandlers: ((message: SummitRouteChangeMessage) => void)[] = [];
  public loggedin: boolean = false;
  public summitVersion: string = process.env.SUMMITVERSION || "0.0.0";
  public buildMode: string = process.env.SUMMITBUILD || "prod";
  public presentedAwards = [] as string[];
  public nuxtWatchers = [] as { item: string; unwatch: () => void }[];

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
    this.setupNuxtWatchers();
  }

  public setupNuxtWatchers() {
    this.watchNuxt("user.profileIndex", () => this.getData());
    this.watchNuxt("user.profileIndex", () => clearCache());
  }

  public watchNuxt(propertyPath: string, callback: () => void): void {
    //get properties to watch from window.$nuxt.$store.state
    this.nuxtWatchers.push(
      window.$nuxt.$watch(() => {
        const pathParts = propertyPath.split(".");
        return pathParts.reduce((acc, part) => acc && acc[part], window.$nuxt.$store.state);
      }, callback),
    );
  }

  public checkForUpdate() {
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
  public updateSummit() {
    if (this.buildMode === "dev") {
      // get latest js from http://localhost:3000/summit.js
      fetch("http://localhost:3000/summit.js")
        .then((response) => response.text())
        .then(async (data) => {
          const dbName = "TerrainSummit";
          const storeName = "JSStore";
          const id = "summitJS";
          const db = await openIndexedDB(dbName, storeName);
          await saveToIndexedDB(db, storeName, data, id);
          localStorage.setItem("summit-version", "9.9.9");
          setTimeout(() => window.location.reload(), 1000);
        });
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
    this.currentProfilesList = JSON.parse(JSON.stringify(window.$nuxt.$store.state.user.profiles));
    this.currentProfile = this.currentProfilesList[window.$nuxt.$store.state.user.profileIndex];
    this.primaryProfile = this.currentProfilesList[0];
    this.getAchievements();
  }

  public async getAchievements() {
    const memberEvents = await fetchMemberEvents("2100-01-01T00:00:00", "2100-01-30T00:00:00");
    let existingEvent = undefined as TerrainEvent | undefined;
    const existingEventId = memberEvents?.find((event) => event.title === "Summit Award Storage - Please Ignore" && event.invitee_id === this.currentProfile?.unit.id)?.id;
    if (existingEventId) {
      existingEvent = await fetchActivity(existingEventId);
    }
    const existingAwards = existingEvent && existingEvent.schedule_items ? existingEvent.schedule_items.flatMap((item) => item.description) : [];
    if (existingAwards.length > 0) this.presentedAwards = reconstructGuids(existingAwards);
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
