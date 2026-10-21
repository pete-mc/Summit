import { compareDisplayDates } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

/**
 * The dates on this page are DD/MM/YYYY display strings, so v-data-table's default comparator
 * would sort them lexically. These cases are the ones a lexical sort gets wrong.
 */
describe("compareDisplayDates", () => {
  it("orders by actual date, not by string order", () => {
    // Lexically "01/12/2025" < "02/01/2024", but chronologically it is later.
    expect(compareDisplayDates("01/12/2025", "02/01/2024")).toBe(1);
    expect(compareDisplayDates("02/01/2024", "01/12/2025")).toBe(-1);
  });

  it("distinguishes months from days", () => {
    // 03/04 is 3 April; 04/03 is 4 March. A lexical sort puts 03/04 first for the wrong reason.
    expect(compareDisplayDates("03/04/2026", "04/03/2026")).toBe(1);
  });

  it("orders across years correctly", () => {
    expect(compareDisplayDates("31/12/2024", "01/01/2025")).toBe(-1);
  });

  it("treats equal dates as equal", () => {
    expect(compareDisplayDates("05/03/2026", "05/03/2026")).toBe(0);
  });

  it("sorts unpresented awards before any real date", () => {
    expect(compareDisplayDates("No", "01/01/2000")).toBe(-1);
    expect(compareDisplayDates("01/01/2000", "No")).toBe(1);
  });

  it("treats empty and null values as unpresented rather than throwing", () => {
    expect(compareDisplayDates("", "01/01/2000")).toBe(-1);
    expect(compareDisplayDates(null, "01/01/2000")).toBe(-1);
    expect(compareDisplayDates(undefined, "01/01/2000")).toBe(-1);
    expect(compareDisplayDates("No", "")).toBe(0);
  });

  it("sorts a realistic column into chronological order", () => {
    const column = ["01/12/2025", "No", "02/01/2024", "15/06/2025", "31/12/2024"];

    expect([...column].sort(compareDisplayDates)).toEqual(["No", "02/01/2024", "31/12/2024", "15/06/2025", "01/12/2025"]);
  });
});
