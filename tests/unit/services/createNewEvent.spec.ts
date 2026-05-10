import createNewEvent from "@/services/createNewEvent";
import { createFetchMock } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("createNewEvent service", () => {
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

  it("normalizes JSON validation failures with top-level + inline messages", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          message: "Validation failed",
          errors: {
            title: ["Title is required", "Title must be unique"],
            organisers: "At least one organiser is required",
          },
        }),
      ),
    });

    const result = await createNewEvent(JSON.stringify({ title: "" }));

    expect(result).toEqual({
      ok: false,
      status: 422,
      topLevelMessages: ["Validation failed"],
      fieldErrors: {
        title: ["Title is required", "Title must be unique"],
        organisers: ["At least one organiser is required"],
      },
      rawMessage: expect.stringContaining("Validation failed"),
    });
  });

  it("preserves non-JSON response text as top-level error message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("gateway exploded"),
    });

    const result = await createNewEvent(JSON.stringify({ title: "Camp" }));

    expect(result).toEqual({
      ok: false,
      status: 500,
      topLevelMessages: ["gateway exploded"],
      fieldErrors: {},
      rawMessage: "gateway exploded",
    });
  });
});
