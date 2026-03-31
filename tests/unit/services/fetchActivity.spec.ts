import fetchActivity from '@/services/fetchActivity';
import { createFetchMock, mockFetchReject, mockFetchResponse } from './mocks/fetchMock';
import { mockTerrainState, restoreTerrainState } from './mocks/terrainStateMock';

describe('fetchActivity service', () => {
  let fetchMock: jest.Mock;
  let terrainSpies: jest.SpyInstance[];

  beforeEach(() => {
    fetchMock = createFetchMock();
    terrainSpies = mockTerrainState();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    restoreTerrainState(terrainSpies);
    (console.log as jest.Mock).mockRestore();
    jest.clearAllMocks();
  });

  it('returns undefined and does not call fetch when token is missing', async () => {
    restoreTerrainState(terrainSpies);
    terrainSpies = mockTerrainState({ token: '' });

    const result = await fetchActivity('activity-1');

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls fetch with expected URL, GET method, and auth header', async () => {
    mockFetchResponse(fetchMock, { ok: true, jsonData: { id: 'activity-1' } });

    await fetchActivity('activity-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://events.terrain.scouts.com.au/events/activity-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('returns parsed response json on success', async () => {
    const event = { id: 'activity-1', title: 'Hike' };
    mockFetchResponse(fetchMock, { ok: true, jsonData: event });

    const result = await fetchActivity('activity-1');

    expect(result).toEqual(event);
  });

  it('returns undefined when response is non-OK', async () => {
    mockFetchResponse(fetchMock, { ok: false, status: 500 });

    const result = await fetchActivity('activity-1');

    expect(result).toBeUndefined();
  });

  it('returns undefined when fetch throws', async () => {
    mockFetchReject(fetchMock, new Error('network failure'));

    const result = await fetchActivity('activity-1');

    expect(result).toBeUndefined();
  });
});
