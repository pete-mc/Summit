import { showTerrainToast } from "@/helpers/TerrainToast";

describe("showTerrainToast", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockClear();
    (window as unknown as { $nuxt: unknown }).$nuxt = { $store: { dispatch } };
  });

  afterEach(() => {
    delete (window as unknown as { $nuxt?: unknown }).$nuxt;
  });

  it("uses Terrain's own snackbar with its tick icon for a success", () => {
    showTerrainToast("Excel export complete");

    expect(dispatch).toHaveBeenCalledWith("snackbar/setSnack", { message: "Excel export complete", icon: "check", timeout: 4000, type: "", path: "", filename: "" });
  });

  // setSnack keeps the previous caller's timeout unless one is passed.
  it("always passes a timeout, and uses Terrain's cross icon for an error", () => {
    showTerrainToast("Save failed", "error");
    showTerrainToast("Merged", "info", 10000);

    expect(dispatch.mock.calls[0][1]).toMatchObject({ icon: "nope", timeout: 6000 });
    expect(dispatch.mock.calls[1][1]).toMatchObject({ icon: "info", timeout: 10000 });
  });

  it("does nothing when Terrain's store is not there", () => {
    delete (window as unknown as { $nuxt?: unknown }).$nuxt;
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(() => showTerrainToast("Hello")).not.toThrow();
  });
});
