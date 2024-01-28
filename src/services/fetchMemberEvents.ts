import { type TerrainEventSummary } from '../types/terrainTypes';
import { TerrainState } from '@/helpers';

export default async function fetchMemberEvents(fromDateString: string, toDateString: string): Promise<TerrainEventSummary[] | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch('https://events.terrain.scouts.com.au/members/' + TerrainState.getMemberID() + '/events?start_datetime=' + fromDateString + '&end_datetime=' + toDateString, {
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
    const data = await response.json();
    return data.results;
  } catch (e) {
    console.log('Error fetching member events: ' + e);
    return undefined;
  }
}
