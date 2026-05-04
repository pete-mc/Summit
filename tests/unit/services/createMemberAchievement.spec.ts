import createMemberAchievement from "@/services/createMemberAchievement";
import { createFetchMock } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("createMemberAchievement service", () => {
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

  it("returns undefined and does not call fetch when token is missing", async () => {
    restoreTerrainState(terrainSpies);
    terrainSpies = mockTerrainState({ token: "" });

    const result = await createMemberAchievement(JSON.stringify({ type: "special_interest_area" }));

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts member achievement payload to the member achievements endpoint with auth header", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      text: jest.fn().mockResolvedValue(""),
    });

    const body = JSON.stringify({
      section: "scout",
      type: "special_interest_area",
      answers: {
        project_name: "Imported project",
      },
    });

    await createMemberAchievement(body);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://achievements.terrain.scouts.com.au/members/member-456/achievements",
      expect.objectContaining({
        method: "POST",
        body,
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns parsed response body when Terrain returns non-OK response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue(JSON.stringify({ message: "Invalid payload" })),
    });

    const result = await createMemberAchievement(JSON.stringify({ type: "special_interest_area" }));

    expect(result).toEqual({ message: "Invalid payload" });
  });

  it("rethrows when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("network failure"));

    await expect(createMemberAchievement(JSON.stringify({ type: "special_interest_area" }))).rejects.toThrow("network failure");
  });
});
