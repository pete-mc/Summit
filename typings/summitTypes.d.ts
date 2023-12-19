import { TerrainCacheData } from "./terrainTypes";
export interface CacheType {
  type: string;
  data: TerrainCacheData;
  ttl: number;
}

export interface TerrainCache extends Array<CacheType> {}

export interface SummitScreen {
  path: string;
  html: string;
  id: string;
}

//boardcast event message types
export type SummitMessage = SummitUploadLogbookMessage | SummitDownloadLogbookMessage | SummitRouteChangeMessage | SummitAddSreensMessage | SummitOnLoadMessage | BaseSummitMessage | SummitTerrainLoadedMessage;

type SummitMessageType = SummitUploadLogbookMessage["type"] | SummitDownloadLogbookMessage["type"] | SummitRouteChangeMessage["type"] | SummitAddSreensMessage["type"] | SummitOnLoadMessage["type"] | SummitTerrainLoadedMessage["type"];

export interface SummitMessageHandler {
  type: SummitMessageType;
  handler: (e: BaseSummitMessage) => void;
}

export interface BaseSummitMessage {
  type: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SummitMessageEvent<T extends SummitMessage = SummitMessage> extends MessageEvent {
  data: T;
}

export interface SummitUploadLogbookMessage extends BaseSummitMessage {
  type: "writeLogbook";
  upload: boolean;
}

export interface SummitDownloadLogbookMessage extends BaseSummitMessage {
  type: "loadLogbookData";
  record: string;
  download: boolean;
}

export interface SummitRouteChangeMessage extends BaseSummitMessage {
  type: "routeChange" | "changeRoute";
  newRoute: string;
  oldRoute?: string | undefined;
}

export interface SummitAddSreensMessage extends BaseSummitMessage {
  type: "addScreens";
  ids: string[];
}

export interface SummitOnLoadMessage extends BaseSummitMessage {
  type: "onloadSummit";
  id: string;
}

export interface SummitTerrainLoadedMessage extends BaseSummitMessage {
  type: "terrainLoaded";
}
