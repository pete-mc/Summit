import { TerrainState } from '@/helpers';

export default async function createNewEvent(body: string): Promise<void | string> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch('https://events.terrain.scouts.com.au/units/' + TerrainState.getUnitID() + '/events', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TerrainState.getToken()
      },
      redirect: 'error',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body
    });
    if (!response.ok) {
      return JSON.parse(await response.text());
    }
  } catch (e) {
    console.log('Error creating event: ' + e);
    throw e;
  }
}
