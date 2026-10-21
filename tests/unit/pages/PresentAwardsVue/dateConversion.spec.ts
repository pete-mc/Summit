import { toDisplayDate, toPickerDate } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

/**
 * v-date-picker speaks ISO YYYY-MM-DD; the model, the table and the storage event all speak
 * DD/MM/YYYY. These two functions are the only place the formats meet.
 */
describe("date conversion at the picker boundary", () => {
  describe("toPickerDate", () => {
    it("converts a display date to ISO", () => {
      expect(toPickerDate("05/03/2026")).toBe("2026-03-05");
    });

    it("keeps day and month the right way round", () => {
      // 04/03 is 4 March, not 3 April — the failure mode a naive Date parse produces.
      expect(toPickerDate("04/03/2026")).toBe("2026-03-04");
    });

    it("returns undefined for an unpresented award so the picker opens on today", () => {
      expect(toPickerDate("No")).toBeUndefined();
      expect(toPickerDate("")).toBeUndefined();
    });

    it("returns undefined rather than throwing on malformed input", () => {
      expect(toPickerDate("not a date")).toBeUndefined();
      expect(toPickerDate("2026-03-05")).toBeUndefined();
    });
  });

  describe("toDisplayDate", () => {
    it("converts an ISO date back to display format", () => {
      expect(toDisplayDate("2026-03-05")).toBe("05/03/2026");
    });

    it("emits a 4-digit year", () => {
      // The React page formats this boundary "DD/MM/YY" while the save path parses "DD/MM/YYYY";
      // that only works because moment is lenient. This page uses the full year throughout.
      expect(toDisplayDate("2026-03-05")).not.toBe("05/03/26");
      expect(toDisplayDate("2026-03-05")).toHaveLength(10);
    });

    it("pads single-digit days and months", () => {
      expect(toDisplayDate("2026-01-02")).toBe("02/01/2026");
    });
  });

  it("round-trips a date unchanged", () => {
    const original = "27/11/2025";
    expect(toDisplayDate(toPickerDate(original) as string)).toBe(original);
  });
});
