import Vue from "vue";
import * as fs from "fs";
import * as path from "path";
import OASNextStepsVueOptions, { HEADERS } from "@/pages/OasProgressVue/components/OASNextStepsVue";
import { groupNextStepsRows } from "@/pages/OasProgressVue/services/nextStepsRows";
import type { NextStepsRow } from "@/pages/OasProgressVue/services/nextStepsRows";

/** No .vue import in its chain, so it can be `new Vue(options)`'d; the template is checked as source text. */

const REPO_ROOT = path.resolve(__dirname, "../../..");
const readTemplate = () => fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASNextStepsVue.vue"), "utf8");

describe("OASNextStepsVue render contract", () => {
  it("shows Group, Answered, I-Statement and Date only, Answered beside its I-Statement", () => {
    expect(HEADERS.map((h) => h.text)).toEqual(["Group", "Answered", "I-Statement", "Date"]);
  });

  it("renders like the summary tables: one scroll block, no paging, no in-table filter row", () => {
    const source = readTemplate();
    expect(source).toContain('<div class="oas-heatmap-scroll">');
    expect(source).toContain("oas-heatmap-data-table");
    expect(source).toContain("hide-default-footer");
    expect(source).toContain("disable-pagination");
    expect(source).not.toContain("#body.prepend");
    expect(source).not.toContain("Clear filters");
    expect(source).not.toContain("debug tool");
  });

  it("merges each Plan/Do/Review group into one Group cell, keeping template order", () => {
    const row = (inputId: string, inputGroup: string) => ({ inputId, inputGroup }) as NextStepsRow;
    const groups = groupNextStepsRows([row("a", "Plan"), row("b", "Plan"), row("c", "Do"), row("d", "Review")]);
    expect(groups.map((g) => [g.title, g.rows.map((r) => r.inputId)])).toEqual([
      ["Plan", ["a", "b"]],
      ["Do", ["c"]],
      ["Review", ["d"]],
    ]);
    expect(readTemplate()).toContain(':rowspan="group.rows.length"');
  });

  it("draws a line between columns, including beside the merged Group cell", () => {
    expect(readTemplate()).toMatch(/tbody td:not\(\.oas-next-steps-inputGroup\) \{[^}]*border-left: 1px solid/);
  });

  it("shows Answered as the heat map's answered/unanswered square", () => {
    expect(readTemplate()).toContain("row.answered ? 'oas-heatmap-square-answered' : 'oas-heatmap-square-unanswered'");
  });

  it("formats dates day-first and leaves a missing date blank", () => {
    const vm = new Vue({ ...OASNextStepsVueOptions, propsData: { rows: [] } }) as unknown as { formatDate: (date: string | null) => string };

    expect(vm.formatDate("2024-02-03T06:33:41.791295+00:00")).toBe("03/02/2024");
    expect(vm.formatDate(null)).toBe("");
  });

  it("sizes to its content up to the box's width, so I-Statements wrap only when the window is narrower", () => {
    const source = readTemplate();
    expect(source).toMatch(/\.oas-heatmap-data-table \{[^}]*width: fit-content;[^}]*max-width: 100%;/);
    expect(source).toMatch(/\.v-data-table__wrapper > table \{[^}]*width: auto;/);
  });
});
