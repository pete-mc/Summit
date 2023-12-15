export interface CacheType {
    type: string;
    data: any;
    ttl: number;
}

export interface TerrainCache extends Array<CacheType> {}
 
export interface TerrainProfile {
profiles: Profile[];
}
interface Unit {
    id: string; // replace with the actual type of the id
}
interface Profile {
    unit: Unit;
}

export interface SummitMessage {
  type: string;
}

export interface SummitScreen {
  path: string;
  html: string;
  onload: () => void;
}

//boardcast event message types
export interface SummitUploadLogbookMessage extends SummitMessage {
  type: 'upload';
  upload: boolean;
}

export interface SummitDownloadLogbookMessage extends SummitMessage {
  type: 'download';
  record: string;
  download: boolean;
}

export interface SummitRouteChangeMessage extends SummitMessage {
  type: 'routeChange' | 'changeRoute';
  newRoute: string;
}

export interface SummitAddSreensMessage extends SummitMessage {
  type: 'addScreens';
  screens: SummitScreen[];
}