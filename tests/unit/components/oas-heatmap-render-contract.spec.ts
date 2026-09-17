import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { OASHeatMap } from "@/pages/OasProgression/components/OASHeatMap";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const OAS_STREAMS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];

document.documentElement.setAttribute("data-summit-extension-url", "chrome-extension://test/");

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushcraft",
    branch: "bushcraft",
    stage: 1,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can do a thing",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: false,
    awarded: false,
    date: null,
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

function makeProps(overrides: Partial<React.ComponentProps<typeof OASHeatMap>> = {}): React.ComponentProps<typeof OASHeatMap> {
  return {
    items: [],
    trunkStageCounts: {},
    members: [],
    showEmptySections: false,
    memberFilter: "",
    hideLastName: false,
    useCodenames: false,
    selectedPatrols: [],
    breakByPatrol: false,
    hideEmptyTopColumns: true,
    visibleStreams: OAS_STREAMS,
    stageRange: [1, 9],
    sortBy: "firstName",
    ...overrides,
  };
}

describe("OASHeatMap render contract", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("renders one tbody section per distinct skill, under one shared thead", () => {
    const rows = [makeRow({ stream: "aquatics" }), makeRow({ stream: "boating", branch: "boating" })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { aquatics: 1, boating: 1 }, members })));
    });

    expect(container.querySelectorAll("thead")).toHaveLength(1);
    expect(container.querySelectorAll("[data-oas-skill]")).toHaveLength(2);
    expect(container.querySelector('[data-oas-skill="aquatics"]')).toBeTruthy();
    expect(container.querySelector('[data-oas-skill="boating"]')).toBeTruthy();
  });

  it("orders core skills (bushwalking, bushcraft, camping) first, before other skills sorted alphabetically", () => {
    const rows = [
      makeRow({ stream: "vertical", branch: "vertical" }),
      makeRow({ stream: "camping", branch: "camping" }),
      makeRow({ stream: "aquatics", branch: "aquatics" }),
      makeRow({ stream: "bushwalking", branch: "bushwalking" }),
      makeRow({ stream: "bushcraft", branch: "bushcraft" }),
    ];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { vertical: 1, camping: 1, aquatics: 1, bushwalking: 1, bushcraft: 1 }, members })));
    });

    const skillOrder = Array.from(container.querySelectorAll("[data-oas-skill]")).map((el) => el.getAttribute("data-oas-skill"));
    expect(skillOrder).toEqual(["bushwalking", "bushcraft", "camping", "aquatics", "vertical"]);
  });

  it("lists every unit member as a row within a section, even a member with zero progress there", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Sam" })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    expect(container.querySelectorAll("[data-oas-member]")).toHaveLength(2);
  });

  it("renders a separate titled section per forked stream, with its own full member list", () => {
    const rows = [
      makeRow({ stage: 1, branch: "bushcraft" }),
      makeRow({ stage: 4, branch: "pioneering", inputId: "p1", answered: true, awarded: true }),
      makeRow({ stage: 4, branch: "survival-skills", inputId: "s1", answered: true, awarded: true }),
    ];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    expect(container.querySelectorAll('[data-oas-stream="pioneering"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-oas-stream="survival-skills"]')).toHaveLength(1);
    // 3 sections (base + 2 streams), 1 member each = 3 member rows total
    expect(container.querySelectorAll("[data-oas-member]")).toHaveLength(3);
  });

  it("postfixes the stream name onto the skill title for a forked section", () => {
    const rows = [makeRow({ stage: 4, branch: "pioneering", inputId: "p1", answered: true, awarded: true }), makeRow({ stage: 4, branch: "survival-skills", inputId: "s1", answered: true, awarded: true })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    const titles = Array.from(container.querySelectorAll(".oas-heatmap-skill-title")).map((el) => el.textContent);
    expect(titles).toContain("Bushcraft — Pioneering");
    expect(titles).toContain("Bushcraft — Survival Skills");
  });

  it("shows the same highest-stage value for a member across every section of a skill", () => {
    const rows = [
      makeRow({ stage: 1, inputId: "a", answered: true, awarded: true, branch: "bushcraft" }),
      makeRow({ stage: 4, branch: "pioneering", inputId: "b", answered: true, awarded: true }),
      makeRow({ stage: 5, branch: "pioneering", inputId: "c", answered: false, awarded: false }),
    ];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    const highestStages = Array.from(container.querySelectorAll(".oas-heatmap-highest-stage")).map((el) => el.textContent);
    expect(highestStages.every((v) => v === "4")).toBe(true);
  });

  it("renders one square per i-statement for an in-progress stage, matching the cell count", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", awarded: true, answered: true }), makeRow({ stage: 1, inputId: "b", awarded: false, answered: true }), makeRow({ stage: 1, inputId: "c", awarded: false, answered: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    expect(container.querySelectorAll(".oas-heatmap-square")).toHaveLength(3);
  });

  it("renders a single solid completed bar (not individual squares) for a fully-awarded stage", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", awarded: true, answered: true }), makeRow({ stage: 1, inputId: "b", awarded: true, answered: true })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    expect(container.querySelectorAll(".oas-heatmap-stage-bar-complete")).toHaveLength(1);
    expect(container.querySelectorAll(".oas-heatmap-square")).toHaveLength(0);
  });

  it("renders a single unstarted bar (not individual squares) for a stage with zero progress", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", awarded: false, answered: false }), makeRow({ stage: 1, inputId: "b", awarded: false, answered: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    expect(container.querySelectorAll(".oas-heatmap-stage-bar-unstarted")).toHaveLength(1);
    expect(container.querySelectorAll(".oas-heatmap-square")).toHaveLength(0);
  });

  it("hides an empty stream section when showEmptySections is false, and shows it when true", () => {
    const rows = [makeRow({ stage: 4, branch: "pioneering", inputId: "p1", answered: true, awarded: true }), makeRow({ stage: 4, branch: "survival-skills", inputId: "s1", answered: false, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, showEmptySections: false })));
    });

    expect(container.querySelector('[data-oas-stream="pioneering"]')).toBeTruthy();
    expect(container.querySelector('[data-oas-stream="survival-skills"]')).toBeFalsy();

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, showEmptySections: true })));
    });

    expect(container.querySelector('[data-oas-stream="survival-skills"]')).toBeTruthy();
  });

  it("hides trailing empty stage columns above stage 4 when hideEmptyTopColumns is true, but never hides stage 4 or below", () => {
    // stage 6 has no progress from anyone -> should be trimmed; stages 1-4 stay even though empty.
    const rows = [makeRow({ stage: 5, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 6, inputId: "b", answered: false, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 6 }, members, hideEmptyTopColumns: true })));
    });

    const headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("keeps a column visible if any member has progress in it, even above stage 4", () => {
    const rows = [makeRow({ stage: 6, inputId: "a", answered: true, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 6 }, members, hideEmptyTopColumns: true })));
    });

    const headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("shows all stage columns, including trailing empty ones, when hideEmptyTopColumns is false", () => {
    const rows = [makeRow({ stage: 5, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 6, inputId: "b", answered: false, awarded: false })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 6 }, members, hideEmptyTopColumns: false })));
    });

    const headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("renders each section's skill icon before the title text", () => {
    const rows = [makeRow({ stream: "bushwalking", branch: "bushwalking" })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushwalking: 1 }, members })));
    });

    const icon = container.querySelector('img[data-oas-skill-icon="bushwalking"]') as HTMLImageElement;
    expect(icon).toBeTruthy();
    expect(icon.src).toContain("images/oas-skills/Bushwalking.png");
  });

  it("filters member rows by name using the memberFilter prop", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m1", first_name: "Alex" }), makeMember({ id: "m2", first_name: "Sam" })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, memberFilter: "Sam" })));
    });

    expect(container.querySelectorAll("[data-oas-member]")).toHaveLength(1);
    expect(container.querySelector('[data-oas-member="m2"]')).toBeTruthy();
  });

  it("shows first-name-only when hideLastName is true", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m1", first_name: "Alex", last_name: "Scout" })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, hideLastName: true })));
    });

    expect(container.querySelector(".oas-heatmap-member-name")?.textContent).toBe("Alex");
  });

  it("shows a deterministic codename instead of the member name when useCodenames is true", () => {
    const rows = [makeRow({ memberId: "m1" })];
    const members = [makeMember({ id: "m1", first_name: "Alex", last_name: "Scout" })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, useCodenames: true })));
    });

    const text = container.querySelector(".oas-heatmap-member-name")?.textContent ?? "";
    expect(text).not.toContain("Alex");
    expect(text.length).toBeGreaterThan(0);
  });

  it("filters member rows by selected patrols", () => {
    const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
    const members = [makeMember({ id: "m1", first_name: "Alex", patrol: { id: "p1", name: "Kookaburras", duty: "member" as TerrainUnitMember["unit"]["duty"] } }), makeMember({ id: "m2", first_name: "Sam", patrol: null })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, selectedPatrols: ["Kookaburras"] })));
    });

    expect(container.querySelectorAll("[data-oas-member]")).toHaveLength(1);
    expect(container.querySelector('[data-oas-member="m1"]')).toBeTruthy();
  });

  it("groups member rows under a patrol sub-heading when breakByPatrol is true", () => {
    const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
    const members = [
      makeMember({ id: "m1", first_name: "Alex", patrol: { id: "p1", name: "Kookaburras", duty: "member" as TerrainUnitMember["unit"]["duty"] } }),
      makeMember({ id: "m2", first_name: "Sam", patrol: { id: "p2", name: "Wombats", duty: "member" as TerrainUnitMember["unit"]["duty"] } }),
    ];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, breakByPatrol: true })));
    });

    const titles = Array.from(container.querySelectorAll(".oas-heatmap-patrol-title")).map((el) => el.textContent);
    expect(titles).toEqual(["Kookaburras", "Wombats"]);
  });

  it("only renders visible streams (skills)", () => {
    const rows = [makeRow({ stream: "aquatics" }), makeRow({ stream: "boating", branch: "boating" })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { aquatics: 1, boating: 1 }, members, visibleStreams: ["aquatics"] })));
    });

    expect(container.querySelector('[data-oas-skill="aquatics"]')).toBeTruthy();
    expect(container.querySelector('[data-oas-skill="boating"]')).toBeFalsy();
  });

  it("slices stage columns to the given stageRange", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", answered: true, awarded: true }), makeRow({ stage: 4, inputId: "b", answered: true, awarded: true }), makeRow({ stage: 6, inputId: "c", answered: true, awarded: true })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 6 }, members, stageRange: [2, 5] })));
    });

    const headerStages = Array.from(container.querySelectorAll(".oas-heatmap-stage-group-header")).map((el) => el.textContent);
    expect(headerStages).toEqual(["2", "3", "4", "5"]);
  });

  it("marks the first square of each new Plan/Do/Review group (after the first) with a group-start class", () => {
    const rows = [
      makeRow({ stage: 1, inputId: "a", inputGroup: "Plan", answered: true }),
      makeRow({ stage: 1, inputId: "b", inputGroup: "Plan", answered: true }),
      makeRow({ stage: 1, inputId: "c", inputGroup: "Do", answered: true }),
      makeRow({ stage: 1, inputId: "d", inputGroup: "Review", answered: true }),
    ];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    const squares = Array.from(container.querySelectorAll(".oas-heatmap-square"));
    expect(squares.map((el) => el.getAttribute("data-oas-cell-group"))).toEqual(["Plan", "Plan", "Do", "Review"]);
    expect(squares.map((el) => el.classList.contains("oas-heatmap-square-group-start"))).toEqual([false, false, true, true]);
  });

  it("prefixes the hover title with the input group name", () => {
    const rows = [makeRow({ stage: 1, inputId: "a", inputGroup: "Do", iStatement: "I can navigate", answered: true })];
    const members = [makeMember()];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members })));
    });

    const square = container.querySelector(".oas-heatmap-square") as HTMLElement;
    expect(square.title).toBe("Do: I can navigate");
  });

  it("sorts member rows within a section according to the sortBy prop", () => {
    const rows = [makeRow({ memberId: "m1" }), makeRow({ memberId: "m2" })];
    const members = [makeMember({ id: "m1", first_name: "Zara" }), makeMember({ id: "m2", first_name: "Alex" })];

    act(() => {
      root.render(React.createElement(OASHeatMap, makeProps({ items: rows, trunkStageCounts: { bushcraft: 1 }, members, sortBy: "firstName" })));
    });

    const order = Array.from(container.querySelectorAll("[data-oas-member]")).map((el) => el.getAttribute("data-oas-member"));
    expect(order).toEqual(["m2", "m1"]);
  });
});
