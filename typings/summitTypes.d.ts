export interface CacheType {
    type: string;
    data: any;
    ttl: number;
}

export interface TerrainCache extends Array<CacheType> {}
 
export interface SummitScreen {
  path: string;
  html: string;
  onloadSummit?: string;
  onloadTerrain?: () => void;
}

//boardcast event message types
export type SummitMessage =
  | SummitUploadLogbookMessage
  | SummitDownloadLogbookMessage
  | SummitRouteChangeMessage
  | SummitAddSreensMessage
  | SummitOnLoadMessage
  | BaseSummitMessage;

type SummitMessageType = 
  | SummitUploadLogbookMessage['type']
  | SummitDownloadLogbookMessage['type']
  | SummitRouteChangeMessage['type']
  | SummitAddSreensMessage['type']
  | SummitOnLoadMessage['type'];

export interface SummitMessageHandler {
  type: SummitMessageType;
  handler: (e:any) => void;
}

export interface BaseSummitMessage {
  type: string;
}

export interface SummitMessageEvent<T extends SummitMessage = SummitMessage>  extends MessageEvent{
  data: T;
}

export interface SummitUploadLogbookMessage extends BaseSummitMessage {
  type: 'writeLogbook';
  upload: boolean;
}

export interface SummitDownloadLogbookMessage extends BaseSummitMessage {
  type: 'loadLogbookData';
  record: string;
  download: boolean;
}

export interface SummitRouteChangeMessage extends BaseSummitMessage {
  type: 'routeChange' | 'changeRoute';
  newRoute: string;
}

export interface SummitAddSreensMessage extends BaseSummitMessage {
  type: 'addScreens';
  screens: SummitScreen[];
}

export interface SummitOnLoadMessage extends BaseSummitMessage {
  type: 'onloadSummit';
  onloadSummit: string;
}

