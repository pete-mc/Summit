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

//boardcast event message types


export interface SummitUploadLogbookMessage {
  type: 'upload';
  upload: boolean;
}

export interface SummitDownloadLogbookMessage {
  type: 'download';
  record: string;
  download: boolean;
}