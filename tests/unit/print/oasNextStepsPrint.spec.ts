import { getPrintProfile, resolveHeaderFooter } from "@/print/summitPrint";
import { buildNextStepsPrintMeta } from "@/pages/OasProgressVue/services/oasPrintMeta";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 9, 12, 9, 0);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("oas-next-steps profile", () => {
  it("is titled per the OAS Progress pattern, A4 portrait like Terrain's stage sheets, with only Generated in the meta", () => {
    const profile = getPrintProfile("oas-next-steps");
    expect(profile.header.title).toBe("OAS Progress - Next Steps");
    expect(profile.defaults).toMatchObject({ pageSize: "A4", orientation: "portrait", layout: "fit" });
    const r = resolveHeaderFooter({ source: document.body, profile: "oas-next-steps", vars: VARS, generated: GENERATED });
    expect(r.header.meta.map((m) => m.label)).toEqual(["Generated"]);
  });

  it("prints the Answered box in the screen's colour, centred", () => {
    const profile = getPrintProfile("oas-next-steps");
    expect(profile.copyComputed.map((rule) => rule.selector)).toEqual([".oas-heatmap-square"]);
    expect(profile.css).toContain("td.oas-next-steps-answered { text-align: center; }");
  });
});

describe("buildNextStepsPrintMeta", () => {
  it("lists the member, skill and stage shown", () => {
    expect(buildNextStepsPrintMeta("Ann Scout", "Camping - Lightweight Camping", 3)).toEqual([
      { label: "Member", value: "Ann Scout" },
      { label: "Skill", value: "Camping - Lightweight Camping" },
      { label: "Stage", value: "3" },
    ]);
  });

  it("leaves out what isn't chosen", () => {
    expect(buildNextStepsPrintMeta("Ann Scout", "", null)).toEqual([{ label: "Member", value: "Ann Scout" }]);
  });
});
