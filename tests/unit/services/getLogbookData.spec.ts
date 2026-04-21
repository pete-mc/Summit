import getLogbookData from '@/services/getLogbookData';
import { createFetchMock, mockFetchReject, mockFetchResponse } from './mocks/fetchMock';
import { mockTerrainState, restoreTerrainState } from './mocks/terrainStateMock';

describe('getLogbookData service', () => {
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

    const result = await getLogbookData('logbook-1');

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls fetch with expected URL, GET method, and auth header', async () => {
    mockFetchResponse(fetchMock, { ok: true, jsonData: { id: 'logbook-1' } });

    await getLogbookData('logbook-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://achievements.terrain.scouts.com.au/members/member-456/logbook/logbook-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('uses the selected profile member ID when building the logbook URL', async () => {
    restoreTerrainState(terrainSpies);
    terrainSpies = mockTerrainState({ memberId: 'member-456', profileMemberId: 'profile-member-789' });
    mockFetchResponse(fetchMock, { ok: true, jsonData: { id: 'logbook-1' } });

    await getLogbookData('logbook-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://achievements.terrain.scouts.com.au/members/profile-member-789/logbook/logbook-1',
      expect.any(Object),
    );
  });

  it('returns parsed response json on success', async () => {
    const logbook = { id: 'logbook-1', sections: [] };
    mockFetchResponse(fetchMock, { ok: true, jsonData: logbook });

    const result = await getLogbookData('logbook-1');

    expect(result).toEqual(logbook);
  });

  it('returns undefined when response is non-OK', async () => {
    mockFetchResponse(fetchMock, { ok: false, status: 500 });

    const result = await getLogbookData('logbook-1');

    expect(result).toBeUndefined();
  });

  it('returns undefined when fetch throws', async () => {
    mockFetchReject(fetchMock, new Error('network failure'));

    const result = await getLogbookData('logbook-1');

    expect(result).toBeUndefined();
  });
});
