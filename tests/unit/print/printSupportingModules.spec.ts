import { loadPrintSettings, savePrintSettings } from "@/print/printSettings";
import { existsSync } from "fs";
import { resolve } from "path";
import { getSectionLabel, getSectionLogoFile, getSectionLogoUrl, SECTION_KEYS } from "@/print/sectionLogo";
import { buildSummaryPrintMeta, describePatrols } from "@/pages/OasProgressVue/services/oasPrintMeta";
import type { OASProgressVueFilterState } from "@/pages/OasProgressVue/services/OASProgressVueFilterPersistence";

describe("printSettings", () => {
  beforeEach(() => window.localStorage.clear());

  it("remembers settings per profile", () => {
    savePrintSettings("peak-award-summary", { pageSize: "A3", orientation: "landscape", margins: "narrow", layout: "split" });
    savePrintSettings("other", { pageSize: "A4", orientation: "portrait", margins: "normal", layout: "fit" });
    expect(loadPrintSettings("peak-award-summary")).toEqual({ pageSize: "A3", orientation: "landscape", margins: "narrow", layout: "split" });
    expect(loadPrintSettings("other").pageSize).toBe("A4");
  });

  it("returns nothing for an unknown profile or corrupt storage, rather than throwing", () => {
    expect(loadPrintSettings("never-saved")).toEqual({});
    window.localStorage.setItem("summit.print.settings", "{not json");
    expect(loadPrintSettings("peak-award-summary")).toEqual({});
  });
});

describe("sectionLogo", () => {
  afterEach(() => document.documentElement.removeAttribute("data-summit-extension-url"));

  it("has a logo file on disk for every section, since the name is built from a pattern", () => {
    const missing = SECTION_KEYS.map(getSectionLogoFile).filter((file) => !existsSync(resolve(__dirname, "../../../src/images/sections", file)));
    expect(missing).toEqual([]);
  });

  it("maps every Terrain section value to its logo URL, case-insensitively", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSectionLogoUrl("Cub")).toBe("chrome-extension://abc/images/sections/Section_Cub_Vert_FullCol.jpg");
  });

  it("maps every Terrain section value to its exact file", () => {
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSectionLogoUrl("joey")).toBe("chrome-extension://abc/images/sections/Section_Joey_Vert_FullCol.jpg");
    expect(getSectionLogoUrl("cub")).toBe("chrome-extension://abc/images/sections/Section_Cub_Vert_FullCol.jpg");
    expect(getSectionLogoUrl("scout")).toBe("chrome-extension://abc/images/sections/Section_Scout_Vert_FullCol.jpg");
    expect(getSectionLogoUrl("venturer")).toBe("chrome-extension://abc/images/sections/Section_Venturer_Vert_FullCol.jpg");
    expect(getSectionLogoUrl("rover")).toBe("chrome-extension://abc/images/sections/Section_Rover_Vert_FullCol.jpg");
  });

  it("returns null (never a broken image) for an unknown section or a missing extension URL", () => {
    expect(getSectionLogoUrl("venturer")).toBeNull();
    document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://abc/");
    expect(getSectionLogoUrl("ranger")).toBeNull();
    expect(getSectionLogoUrl(undefined)).toBeNull();
  });

  it("labels sections with their official names", () => {
    expect(getSectionLabel("venturer")).toBe("Venturer Scouts");
    expect(getSectionLabel("scout")).toBe("Scouts");
    expect(getSectionLabel(undefined)).toBe("");
  });
});

describe("Summary print meta", () => {
  const base = { summaryMemberFilter: "", summarySelectedPatrols: null, summarySortBy: "progress" } as unknown as OASProgressVueFilterState;

  it("describes patrol selections", () => {
    expect(describePatrols(null, ["Kookaburra", "Possum"])).toBe("All");
    expect(describePatrols(["Possum", "Kookaburra"], ["Kookaburra", "Possum"])).toBe("All");
    expect(describePatrols(["Possum"], ["Kookaburra", "Possum"])).toBe("Possum");
    expect(describePatrols([], ["Kookaburra", "Possum"])).toBe("None");
  });

  it("lists the filters that change who is shown — not the sort order", () => {
    const meta = buildSummaryPrintMeta({ ...base, summaryMemberFilter: " sam " }, ["Kookaburra", "Possum"], true);
    expect(meta).toEqual([
      { label: "Member", value: 'contains "sam"' },
      { label: "Patrol", value: "All" },
    ]);
  });

  it("leaves out the Patrol line when there is no patrol choice to make", () => {
    expect(buildSummaryPrintMeta(base, ["Kookaburra"], false)).toEqual([]);
  });
});
