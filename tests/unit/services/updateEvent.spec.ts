import updateEvent from "@/services/updateEvent";
import { createFetchMock } from "./mocks/fetchMock";
import { mockTerrainState, restoreTerrainState } from "./mocks/terrainStateMock";

describe("updateEvent service", () => {
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
      status: 400,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          message: "Could not update event",
          errors: {
            date_range: ["Start must be before end"],
          },
        }),
      ),
    });

    const result = await updateEvent("event-1", JSON.stringify({ title: "Camp" }));

    expect(result).toEqual({
      ok: false,
      status: 400,
      topLevelMessages: ["Could not update event"],
      fieldErrors: {
        date_range: ["Start must be before end"],
      },
      rawMessage: expect.stringContaining("Could not update event"),
    });
  });

  it("preserves non-JSON response text as top-level error message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: jest.fn().mockResolvedValue("service unavailable"),
    });

    const result = await updateEvent("event-1", JSON.stringify({ title: "Camp" }));

    expect(result).toEqual({
      ok: false,
      status: 503,
      topLevelMessages: ["service unavailable"],
      fieldErrors: {},
      rawMessage: "service unavailable",
    });
  });
});
