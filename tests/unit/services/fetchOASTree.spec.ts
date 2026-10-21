import fetchOASTree from "@/services/fetchOASTree";
import { createFetchMock, mockFetchReject, mockFetchResponse } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("fetchOASTree service", () => {
  let fetchMock: jest.Mock;
  let terrainSpies: jest.SpyInstance[];

  beforeEach(() => {
    fetchMock = createFetchMock();
    terrainSpies = mockTerrainState();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    restoreTerrainState(terrainSpies);
    (console.error as jest.Mock).mockRestore();
    jest.clearAllMocks();
  });

  it("returns undefined and does not call fetch when token is missing", async () => {
    restoreTerrainState(terrainSpies);
    terrainSpies = mockTerrainState({ token: "" });

    const result = await fetchOASTree("bushwalking");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls fetch with the expected URL, GET method, and auth header", async () => {
    mockFetchResponse(fetchMock, { ok: true, jsonData: { stream: "bushwalking", children: [] } });

    await fetchOASTree("bushwalking");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://templates.terrain.scouts.com.au/oas/bushwalking/tree.json",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns the parsed JSON on success", async () => {
    const tree = { title: "Bushwalking", stream_id: "bushwalking", description: "test", tree: { branch_id: "bushwalking", title: "Bushwalking", stage: 1, template_link: "oas/bushwalking/1/latest.json", children: [] } };
    mockFetchResponse(fetchMock, { ok: true, jsonData: tree });

    const result = await fetchOASTree("bushwalking");

    expect(result).toEqual(tree);
  });

  it("returns undefined when response is non-OK", async () => {
    mockFetchResponse(fetchMock, { ok: false, status: 404 });

    const result = await fetchOASTree("bushwalking");

    expect(result).toBeUndefined();
  });

  it("returns undefined when fetch throws", async () => {
    mockFetchReject(fetchMock, new Error("network failure"));

    const result = await fetchOASTree("bushwalking");

    expect(result).toBeUndefined();
  });
});
