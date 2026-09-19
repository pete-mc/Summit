import * as fs from "fs";
import * as path from "path";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { OasProgressionTable } from "@/pages/OasProgression/components/OasProgression";
import { OAS_SKILLS } from "@/pages/OasProgression/services/filterHeatMapSections";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const REPO_ROOT = path.resolve(__dirname, "../../..");

jest.mock("@/components/gridExport", () => ({
  exportGridToExcel: jest.fn(),
  exportGridToPdf: jest.fn(),
}));

document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://test/");

function openDropdown(container: HTMLElement, dataAttr: string) {
  const toggle = container.querySelector(`[data-oas-dropdown-toggle="${dataAttr}"]`) as HTMLButtonElement;
  act(() => {
    toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushwalking",
    branch: "navigation",
    stage: 3,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can pack appropriate gear for an overnight hike",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: true,
    awarded: false,
    date: "2020-11-18",
    ...overrides,
  };
}

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

describe("OasProgressionTable render contract", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("uses the shared DataGrid component", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgression/components/OasProgression.tsx"), "utf8");
    expect(source).toContain('from "@/components/DataGrid"');
  });

  it("defaults to heat-map view, and can switch to the flat table view showing every tidy row", () => {
    const rows = [makeRow(), makeRow({ memberId: "member-2", memberName: "Sam Ranger", inputId: "def456", iStatement: "I can navigate using a map and compass", answered: false, date: null })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector(".oas-heatmap-scroll")).toBeTruthy();
    expect(container.querySelector(".data-grid-container")).toBeNull();

    const tableToggle = container.querySelector('[data-action="view-table"]') as HTMLButtonElement;
    expect(tableToggle).toBeTruthy();

    act(() => {
      tableToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector(".data-grid-container")).toBeTruthy();
    const bodyText = container.querySelector(".data-grid-container tbody")?.textContent ?? "";
    expect(bodyText).toContain("Alex Scout");
    expect(bodyText).toContain("Sam Ranger");
    expect(bodyText).toContain("I can pack appropriate gear for an overnight hike");
    expect(bodyText).toContain("I can navigate using a map and compass");
    expect(bodyText).toContain("bushwalking");
    expect(bodyText).toContain("navigation");
  });

  it("the View toggle is a single switch: any click on it flips between Heat map and Table, regardless of which half is clicked", () => {
    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: [], trunkStageCounts: {}, members: [], loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const toggle = container.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    act(() => {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector(".data-grid-container")).toBeTruthy();

    act(() => {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(container.querySelector(".oas-heatmap-scroll")).toBeTruthy();
  });

  it("shows a loading indicator listing streams still loading", () => {
    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: [], trunkStageCounts: {}, members: [], loadingStreams: new Set(["bushwalking", "camping"]), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const loading = container.querySelector('[data-oas-progression-loading="true"]');
    expect(loading?.textContent).toContain("bushwalking");
    expect(loading?.textContent).toContain("camping");
  });

  it("hides the loading indicator once no streams are loading", () => {
    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: [], trunkStageCounts: {}, members: [], loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector('[data-oas-progression-loading="true"]')).toBeNull();
  });

  it("calls onReloadAll when the icon-only reload button is clicked, and only one reload control exists", () => {
    const onReloadAll = jest.fn();

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: [], trunkStageCounts: {}, members: [], loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll, onReloadStream: jest.fn() }));
    });

    const button = container.querySelector('[data-action="reload-all"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.title).toBe("Refresh data");
    expect(container.querySelectorAll('[data-action^="reload-"]')).toHaveLength(1);

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onReloadAll).toHaveBeenCalledTimes(1);
  });

  it("hides the last name when the Hide last name toggle is checked", () => {
    const rows = [makeRow()];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const toggle = container.querySelector('[data-oas-toggle="hide-last-name"]') as HTMLInputElement;
    act(() => {
      toggle.click();
    });

    expect(container.querySelector(".oas-heatmap-member-name")?.textContent).toBe("Alex");
  });

  it("disables the Hide last name toggle once Use codenames is checked", () => {
    const rows = [makeRow()];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const codenameToggle = container.querySelector('[data-oas-toggle="use-codenames"]') as HTMLInputElement;
    act(() => {
      codenameToggle.click();
    });

    const lastNameToggle = container.querySelector('[data-oas-toggle="hide-last-name"]') as HTMLInputElement;
    expect(lastNameToggle.disabled).toBe(true);

    const text = container.querySelector(".oas-heatmap-member-name")?.textContent ?? "";
    expect(text).not.toBe("Alex Scout");
  });

  it("only shows the patrol dropdown/break controls when at least one member has a patrol", () => {
    const rows = [makeRow()];
    const members = [makeMember({ patrol: null })];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector('[data-oas-dropdown="patrol"]')).toBeFalsy();
    expect(container.querySelector('[data-oas-toggle="break-by-patrol"]')).toBeFalsy();
  });

  it("filters members by patrol using the Patrol dropdown", () => {
    const rows = [makeRow({ memberId: "member-1" }), makeRow({ memberId: "member-2" })];
    const members = [
      makeMember({ id: "member-1", first_name: "Alex", patrol: { id: "p1", name: "Kookaburras", duty: "member" as TerrainUnitMember["unit"]["duty"] } }),
      makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger", patrol: { id: "p2", name: "Wombats", duty: "member" as TerrainUnitMember["unit"]["duty"] } }),
    ];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: { bushwalking: 3 }, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    openDropdown(container, "patrol");
    const checkbox = container.querySelector('[data-oas-dropdown-option="patrol:Wombats"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);

    act(() => {
      checkbox.click();
    });

    expect(container.querySelectorAll("[data-oas-member]")).toHaveLength(1);
    expect(container.querySelector('[data-oas-member="member-1"]')).toBeTruthy();
  });

  it("hides a skill entirely when visibleStreams excludes it", () => {
    const rows = [makeRow({ stream: "bushwalking" })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector('[data-oas-skill="bushwalking"]')).toBeTruthy();

    act(() => {
      root.render(
        React.createElement(OasProgressionTable, {
          items: rows,
          trunkStageCounts: {},
          members,
          loadingStreams: new Set(),
          visibleStreams: OAS_SKILLS.filter((s) => s !== "bushwalking"),
          onReloadAll: jest.fn(),
          onReloadStream: jest.fn(),
        }),
      );
    });

    expect(container.querySelector('[data-oas-skill="bushwalking"]')).toBeFalsy();
  });

  it("renders a search icon in the Member search field", () => {
    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: [], trunkStageCounts: {}, members: [], loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector(".oas-search-icon")).toBeTruthy();
  });

  it("only shows the Hide empty streams checkbox when a forked stream is entirely empty, and hides that stream when checked", () => {
    const rows = [makeRow({ stream: "bushcraft", branch: "pioneering", inputId: "p1", answered: true, awarded: true }), makeRow({ stream: "bushcraft", branch: "survival-skills", inputId: "s1", answered: false, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: { bushcraft: 1 }, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const toggle = container.querySelector('[data-oas-toggle="hide-empty-streams"]') as HTMLInputElement;
    expect(toggle).toBeTruthy();
    expect(container.querySelector('[data-oas-stream="survival-skills"]')).toBeTruthy();

    act(() => {
      toggle.click();
    });

    expect(container.querySelector('[data-oas-stream="survival-skills"]')).toBeFalsy();
  });

  it("does not show the Hide empty streams checkbox when no stream is empty", () => {
    const rows = [makeRow()];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector('[data-oas-toggle="hide-empty-streams"]')).toBeFalsy();
  });

  it("shows all stage columns by default, and trims trailing empty ones once Hide empty top columns is checked", () => {
    const rows = [makeRow({ stage: 5, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 6, inputId: "b", answered: false, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: { bushwalking: 6 }, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    let headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["1", "2", "3", "4", "5", "6"]);

    const toggle = container.querySelector('[data-oas-toggle="hide-empty-top-columns"]') as HTMLInputElement;
    act(() => {
      toggle.click();
    });

    headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("restricts visible stage columns using the stage range dropdowns", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 6, inputId: "b", answered: true, awarded: true })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: { bushwalking: 6 }, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const minSelect = container.querySelector('[data-oas-stage="min"]') as HTMLSelectElement;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")!.set!;
      setter.call(minSelect, "4");
      minSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).not.toContain("1");
  });

  it("resets filters to defaults (but keeps the current view mode) when Reset filters is clicked", () => {
    const rows = [makeRow()];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    act(() => {
      (container.querySelector('[data-oas-toggle="hide-last-name"]') as HTMLInputElement).click();
    });

    const resetButton = container.querySelector('[data-action="reset-filters"]') as HTMLButtonElement;
    expect(resetButton).toBeTruthy();
    act(() => {
      resetButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect((container.querySelector('[data-oas-toggle="hide-last-name"]') as HTMLInputElement).checked).toBe(false);
    expect((container.querySelector("[data-oas-slide-value]") as HTMLElement).getAttribute("data-oas-slide-value")).toBe("heatmap");

    act(() => {
      (container.querySelector('[role="switch"]') as HTMLButtonElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector(".data-grid-container")).toBeTruthy();
  });

  it("persists filter state to localStorage and restores it on next mount", () => {
    window.localStorage.clear();
    const rows = [makeRow()];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const lastNameToggle = container.querySelector('[data-oas-toggle="hide-last-name"]') as HTMLInputElement;
    act(() => {
      lastNameToggle.click();
    });

    const stored = window.localStorage.getItem("summit.oasProgression.filters");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored as string).hideLastName).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: {}, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    expect(container.querySelector(".oas-heatmap-member-name")?.textContent).toBe("Alex");
  });

  it("defaults sort-by to First Name and re-sorts members when changed", () => {
    const rows = [makeRow({ memberId: "member-1" }), makeRow({ memberId: "member-2" })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Zebra" }), makeMember({ id: "member-2", first_name: "Zara", last_name: "Anderson" })];

    act(() => {
      root.render(React.createElement(OasProgressionTable, { items: rows, trunkStageCounts: { bushwalking: 3 }, members, loadingStreams: new Set(), visibleStreams: OAS_SKILLS, onReloadAll: jest.fn(), onReloadStream: jest.fn() }));
    });

    const select = container.querySelector('[data-oas-sort-select="true"]') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("firstName");

    let order = Array.from(container.querySelectorAll("[data-oas-member]")).map((el) => el.getAttribute("data-oas-member"));
    expect(order).toEqual(["member-1", "member-2"]);

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")!.set!;
      setter.call(select, "lastName");
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    order = Array.from(container.querySelectorAll("[data-oas-member]")).map((el) => el.getAttribute("data-oas-member"));
    expect(order).toEqual(["member-2", "member-1"]);
  });
});
