import { type TerrainLogbook } from '../types/terrainTypes';
import { TerrainState } from '@/helpers';

export default async function getLogbookData(logbookId: string): Promise<TerrainLogbook | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch('https://achievements.terrain.scouts.com.au/members/' + TerrainState.getMemberID() + '/logbook/' + logbookId, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TerrainState.getToken()
      },
      redirect: 'error',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.log('Error fetching logbook: ' + e);
    return undefined;
  }
}
