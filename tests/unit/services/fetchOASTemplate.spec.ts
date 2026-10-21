import fetchOASTemplate from "@/services/fetchOASTemplate";
import { createFetchMock, mockFetchReject, mockFetchResponse } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("fetchOASTemplate service", () => {
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

    const result = await fetchOASTemplate("oas/bushwalking/3/latest.json");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls fetch with the expected URL, GET method, and auth header", async () => {
    mockFetchResponse(fetchMock, { ok: true, jsonData: { template: "x", version: 1, document: [] } });

    await fetchOASTemplate("oas/bushwalking/3/latest.json");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://templates.terrain.scouts.com.au/oas/bushwalking/3/latest.json",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns the parsed JSON on success", async () => {
    const template = { template: "bushwalking-3", version: 1, document: [{ title: "Bushwalking Stage 3", input_groups: [] }] };
    mockFetchResponse(fetchMock, { ok: true, jsonData: template });

    const result = await fetchOASTemplate("oas/bushwalking/3/latest.json");

    expect(result).toEqual(template);
  });

  it("returns undefined when response is non-OK", async () => {
    mockFetchResponse(fetchMock, { ok: false, status: 404 });

    const result = await fetchOASTemplate("oas/bushwalking/3/latest.json");

    expect(result).toBeUndefined();
  });

  it("returns undefined when fetch throws", async () => {
    mockFetchReject(fetchMock, new Error("network failure"));

    const result = await fetchOASTemplate("oas/bushwalking/3/latest.json");

    expect(result).toBeUndefined();
  });

  it("rejects an absolute URL templateLink without calling fetch", async () => {
    const result = await fetchOASTemplate("https://evil.example/steal");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a templateLink with a leading slash without calling fetch", async () => {
    const result = await fetchOASTemplate("/oas/bushwalking/3/latest.json");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a templateLink containing a .. path segment without calling fetch", async () => {
    const result = await fetchOASTemplate("oas/../secrets/latest.json");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an empty templateLink without calling fetch", async () => {
    const result = await fetchOASTemplate("");

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
