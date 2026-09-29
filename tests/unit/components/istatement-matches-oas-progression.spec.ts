import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const read = (relative: string) => fs.readFileSync(path.resolve(REPO_ROOT, relative), "utf8");

const I_HEAT_MAP = read("src/pages/IStatements/components/IStatementHeatMap.vue");
const OAS_HEAT_MAP = read("src/pages/OasProgressionVue/components/OASHeatMapVue.vue");
const INDEX_CSS = read("src/styles/index.css");

const OAS_FILTERS = read("src/pages/OasProgressionVue/components/OASProgressionFiltersVue.vue");
const AWARD_FILTERS = read("src/pages/PresentAwardsVue/components/PresentAwardsFiltersVue.vue");
const I_FILTERS = read("src/pages/IStatements/components/IStatementFilters.vue");

/** Strips comments so assertions test what the file DOES, not what it says about itself. */
const withoutComments = (source: string) => source.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

describe("I Statements heat map — same table elements as OAS Progression", () => {
  it("renders through v-data-table rather than a bare <table>", () => {
    expect(I_HEAT_MAP).toContain("<v-data-table");
    expect(withoutComments(I_HEAT_MAP)).not.toContain('<table class="oas-heatmap-table');
  });

  it("disables the same v-data-table features the OAS heat map does", () => {
    // Neither heat map sorts, filters or paginates through Vuetify: order comes from the data
    // builder and filtering from the bar above. Switched off so Vuetify adds no UI for them.
    ["disable-sort", "disable-filtering", "disable-pagination", "hide-default-header", "hide-default-footer", 'items-per-page="-1"'].forEach((prop) => {
      expect(I_HEAT_MAP).toContain(prop);
      expect(OAS_HEAT_MAP).toContain(prop);
    });
  });

  it("hand-writes both header and body slots, as the OAS heat map does", () => {
    // #header because the two-row header spans stage columns with colspan, which Vuetify's own
    // one-<th>-per-entry renderer cannot express; #body because rows render from a frozen
    // boolean[] rather than per-cell objects.
    expect(I_HEAT_MAP).toContain("#header");
    expect(I_HEAT_MAP).toContain("#body");
    expect(I_HEAT_MAP).toContain('colspan="group.visibleStages.length"');
  });

  it("passes headers even though the header is hand-written", () => {
    // v-data-table needs them for its own bookkeeping regardless of the custom header.
    expect(I_HEAT_MAP).toContain(':headers="dataTableHeaders"');
    expect(read("src/pages/IStatements/components/IStatementHeatMap.ts")).toContain("dataTableHeaders()");
  });

  it("wears Terrain's table frame, via tokens rather than literal colours", () => {
    [I_HEAT_MAP, OAS_HEAT_MAP].forEach((source) => {
      expect(source).toContain("var(--color-white, #fff)");
      expect(source).toContain("var(--color-light-charcoal, #e5e9ec)");
    });
  });
});

describe("I Statements heat map — the green header is gone", () => {
  it("drops .oas-heatmap-thead, matching the OAS page", () => {
    // Terrain does not style table headers at all, so the heat map's green is removed rather
    // than replaced.
    expect(withoutComments(I_HEAT_MAP)).not.toContain("oas-heatmap-thead");
  });

  it("keeps .oas-heatmap-thead in index.css for the legacy React page", () => {
    // Still used by src/pages/OasProgression/components/OASHeatMap.tsx.
    expect(INDEX_CSS).toContain(".oas-heatmap-thead th");
    expect(read("src/pages/OasProgression/components/OASHeatMap.tsx")).toContain("oas-heatmap-thead");
  });

  it("gives the sticky header an explicit opaque background", () => {
    // Load-bearing, not decorative: the green used to supply this. Without it the sticky header
    // is transparent and body rows scroll visibly through it.
    expect(I_HEAT_MAP).toMatch(/thead th\s*\{[^}]*background:\s*var\(--color-white/);
  });

  it("keeps border-collapse: separate, which sticky cells require", () => {
    // Collapsed borders detach sticky cells' backgrounds, breaking both frozen edges at once.
    expect(I_HEAT_MAP).toContain("border-collapse: separate");
  });
});

describe("Filter panel spacing is declared once, not per page", () => {
  it("defines .oas-vue-filter-panel in the shared stylesheet", () => {
    expect(INDEX_CSS).toContain(".oas-vue-filter-panel {");
  });

  it("sets space BELOW the panel, which no page did", () => {
    // The DEV_NOTES entry: the gap before the table previously came from whatever the next
    // element happened to bring, so the three pages did not line up.
    const rule = INDEX_CSS.slice(INDEX_CSS.indexOf(".oas-vue-filter-panel {"));
    expect(rule.slice(0, rule.indexOf("}"))).toContain("margin-bottom");
  });

  it("is not redeclared by any page", () => {
    // Per-page copies are the actual cause of the drift: each can move independently, and one
    // page declaring it not at all is how I Statements' filter row got no layout whatsoever.
    [OAS_FILTERS, AWARD_FILTERS, I_FILTERS].forEach((source) => {
      expect(withoutComments(source)).not.toContain(".oas-vue-filter-panel {");
    });
  });

  it("gives all three pages the same page-level panel layout", () => {
    // .istatement-panel and .present-awards-panel were written on their pages' roots but defined
    // nowhere — dead classes that looked like they were doing something.
    const rule = INDEX_CSS.slice(INDEX_CSS.indexOf(".oas-progression-panel"));
    const selector = rule.slice(0, rule.indexOf("{"));
    expect(selector).toContain(".present-awards-panel");
    expect(selector).toContain(".istatement-panel");
  });
});
