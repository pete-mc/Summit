import fetchUnitMembers from "@/services/fetchUnitMembers";
import { createFetchMock, mockFetchReject, mockFetchResponse } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("fetchUnitMembers service", () => {
  let fetchMock: jest.Mock;
  let terrainSpies: jest.SpyInstance[];

  beforeEach(() => {
    fetchMock = createFetchMock();
    terrainSpies = mockTerrainState();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    restoreTerrainState(terrainSpies);
    (console.log as jest.Mock).mockRestore();
    jest.clearAllMocks();
  });

  it("returns [] and does not call fetch when token is missing", async () => {
    restoreTerrainState(terrainSpies);
    terrainSpies = mockTerrainState({ token: "" });

    const result = await fetchUnitMembers();

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls fetch with expected URL, GET method, and auth header", async () => {
    mockFetchResponse(fetchMock, { ok: true, jsonData: { results: [] } });

    await fetchUnitMembers();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://members.terrain.scouts.com.au/units/unit-123/members",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns jsonData.results on success", async () => {
    const members = [
      { id: "1", first_name: "Casey", last_name: "Ranger" },
      { id: "2", first_name: "Alex", last_name: "Scout" },
    ];

    mockFetchResponse(fetchMock, { ok: true, jsonData: { results: members } });

    const result = await fetchUnitMembers();

    expect(result).toEqual(members);
  });

  it("returns [] when response is non-OK", async () => {
    mockFetchResponse(fetchMock, { ok: false, status: 500 });

    const result = await fetchUnitMembers();

    expect(result).toEqual([]);
  });

  it("returns [] when fetch throws", async () => {
    mockFetchReject(fetchMock, new Error("network failure"));

    const result = await fetchUnitMembers();

    expect(result).toEqual([]);
  });
});
