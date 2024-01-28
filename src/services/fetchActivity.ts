import { type TerrainEvent } from '../types/terrainTypes';
import { TerrainState } from '@/helpers';

export default async function fetchActivity(activityId: string): Promise<TerrainEvent | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch(`https://events.terrain.scouts.com.au/events/${activityId}`, {
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
    console.log('Error fetching activity: ' + e);
    return undefined;
  }
}
