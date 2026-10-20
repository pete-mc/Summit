import { buildPrintDocument, getPrintProfile, resolveHeaderFooter } from "@/print/summitPrint";
import { skillHeatmapWidths } from "@/print/profiles/skillHeatmap";
import { BASE_PRINT_CSS } from "@/print/printStyles";
import { buildHeatmapPrintMeta } from "@/pages/OasProgressionVue/services/oasPrintMeta";
import type { OASProgressionVueFilterState } from "@/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence";

const VARS = { unit: "Example Venturer Unit", group: "1st Example Group", section: "Venturer Scouts" };
const GENERATED = new Date(2026, 9, 10, 14, 5);

/** Shaped like OASHeatMapVue grouped by skill, with break by patrol. Invented content. */
function heatmapHtml(stages: number[]): string {
  const span = stages.length + 2;
  const stageHeads = stages.map((s) => `<th data-v-x="" class="oas-heatmap-stage-group-header">${s}</th>`).join("");
  const cells = stages
    .map((_, i) =>
      i === 0
        ? '<td class="oas-heatmap-stage-cell"><div class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete" title="Done"></div></td>'
        : `<td class="oas-heatmap-stage-cell"><div class="oas-heatmap-squares">
             <div class="oas-heatmap-square oas-heatmap-square-answered"></div>
             <div class="oas-heatmap-square oas-heatmap-square-hidden"></div>
             <div class="oas-heatmap-square oas-heatmap-square-unanswered oas-heatmap-square-group-start"></div>
           </div></td>`,
    )
    .join("");
  return `
<div class="oas-heatmap-scroll"><div class="v-data-table oas-heatmap-data-table"><div class="v-data-table__wrapper">
  <table>
    <colgroup>${stages.map(() => "<col>").join("")}<col><col></colgroup>
    <thead><tr><th class="oas-heatmap-member-header">Member</th><th class="oas-heatmap-highest-stage-header">Stage</th>${stageHeads}</tr></thead>
    <tbody data-oas-skill="bushwalking">
      <tr class="oas-heatmap-skill-title-row"><td class="oas-heatmap-skill-title" colspan="${span}"><img class="oas-heatmap-skill-icon" src="chrome-extension://abc/images/x.svg" alt="">Bushwalking</td></tr>
      <tr class="oas-heatmap-patrol-title-row"><td class="oas-heatmap-patrol-title" colspan="${span}">Possum</td></tr>
      <tr data-oas-member="m1"><td class="oas-heatmap-member-name">Member A</td><td class="oas-heatmap-highest-stage">2<span class="oas-heatmap-stage-progress">.3</span></td>${cells}</tr>
    </tbody>
  </table>
</div></div></div>`;
}

function mount(stages: number[]): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = heatmapHtml(stages);
  document.body.appendChild(host);
  return host;
}

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("skill-heatmap profile", () => {
  it("is registered, titled per the OAS Progression pattern, and has no Section line", () => {
    const profile = getPrintProfile("skill-heatmap");
    expect(profile.header.title).toBe("OAS Progression - Heatmap");
    const r = resolveHeaderFooter({ source: document.body, profile: "skill-heatmap", vars: VARS, generated: GENERATED });
    expect(r.header.meta.map((m) => m.label)).toEqual(["Generated"]);
    expect(profile.repeatColumns).toBe(1);
    expect(profile.defaults.orientation).toBe("landscape");
  });

  it("sizes columns to the stages actually shown (Stages filter / empty top stages)", () => {
    for (const stages of [[1, 2, 3, 4, 5, 6, 7, 8, 9], [2, 5], [1]]) {
      const host = mount(stages);
      const doc = parse(buildPrintDocument({ source: host, profile: "skill-heatmap", vars: VARS, generated: GENERATED }));
      const cols = doc.querySelectorAll("table.summit-print-table > colgroup > col");
      expect(cols).toHaveLength(stages.length + 2);
      document.body.innerHTML = "";
    }
  });

  it("returns automatic widths when there are no stage columns", () => {
    const t = document.createElement("table");
    t.innerHTML = "<thead><tr><th>Member</th><th>Stage</th></tr></thead>";
    expect(skillHeatmapWidths(t)).toBeNull();
  });

  it("adds a line break before each Plan/Do/Review group except the first square", () => {
    const host = mount([1, 2]);
    const doc = parse(buildPrintDocument({ source: host, profile: "skill-heatmap", vars: VARS, generated: GENERATED }));
    const strip = doc.querySelector("table.summit-print-table .oas-heatmap-squares") as HTMLElement;
    const kinds = Array.from(strip.children).map((c) => (c.classList.contains("oas-sq-break") ? "break" : "square"));
    expect(kinds).toEqual(["square", "square", "break", "square"]);
    // The live table is untouched.
    expect(host.querySelectorAll(".oas-sq-break")).toHaveLength(0);
  });

  it("prints every row on white — no zebra striping", () => {
    expect(BASE_PRINT_CSS).not.toMatch(/nth-child/);
    expect(BASE_PRINT_CSS).toMatch(/table\.summit-print-table tbody td \{ background: #fff; \}/);
    // Title and patrol bands are more specific than the white rule, so they keep their tint.
    expect(getPrintProfile("skill-heatmap").css).toMatch(/tr\.oas-heatmap-patrol-title-row > td \{\s*background: #f0f3f6;/);
  });

  it("keeps hidden squares invisible and title/patrol rows with the row beneath", () => {
    const css = getPrintProfile("skill-heatmap").css;
    expect(css).toMatch(/\.oas-heatmap-square-hidden \{ visibility: hidden; \}/);
    expect(css).toMatch(/tr\.oas-heatmap-patrol-title-row \{\s*break-after: avoid;/);
  });

  it("keeps the skill icon and strips tooltips", () => {
    const host = mount([1, 2]);
    const doc = parse(buildPrintDocument({ source: host, profile: "skill-heatmap", vars: VARS, generated: GENERATED }));
    expect(doc.querySelector("table.summit-print-table img.oas-heatmap-skill-icon")).not.toBeNull();
    expect(doc.querySelectorAll("table.summit-print-table [title]")).toHaveLength(0);
  });
});

describe("buildHeatmapPrintMeta", () => {
  const ALL_SKILLS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];
  const defaults = {
    memberFilter: "",
    selectedPatrols: null,
    visibleStreams: ALL_SKILLS,
    visibleStages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    showEmptySkillRows: true,
    showEmptyTopStages: true,
    showAwarded: true,
    showNotStarted: true,
    showAnswered: true,
    groupBy: "member",
    breakByPatrol: true,
    sortBy: "lastName",
  } as unknown as OASProgressionVueFilterState;

  it("lists nothing when everything is shown and there's no patrol choice (layout and sort are never listed)", () => {
    expect(buildHeatmapPrintMeta(defaults, ["Possum"], false)).toEqual([]);
  });

  it("lists only the filters that narrow what is shown", () => {
    const meta = buildHeatmapPrintMeta(
      { ...defaults, memberFilter: "ann", selectedPatrols: ["Possum"], visibleStreams: ["camping", "bushcraft"], visibleStages: [5, 2], showAnswered: false, showEmptySkillRows: false },
      ["Kookaburra", "Possum"],
      true,
    );
    expect(meta).toEqual([
      { label: "Member", value: 'contains "ann"' },
      { label: "Patrol", value: "Possum" },
      { label: "Skills", value: "Bushcraft, Camping" },
      { label: "Stages", value: "2, 5" },
      { label: "Hidden", value: "Skills not started, Answered I-Statements" },
    ]);
  });

  it("says None rather than printing an empty value", () => {
    const meta = buildHeatmapPrintMeta({ ...defaults, visibleStreams: [], visibleStages: [] }, [], false);
    expect(meta).toEqual([
      { label: "Skills", value: "None" },
      { label: "Stages", value: "None" },
    ]);
  });
});
