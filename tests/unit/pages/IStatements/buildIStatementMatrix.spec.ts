import { buildIStatementMatrix, normaliseIStatement, titleCaseSegment } from "@/pages/IStatements/services/buildIStatementMatrix";
import { getCachedOASTemplate, getCachedOASTree } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { OASTemplate, OASTree } from "@/types/terrainTypes";

jest.mock("@/pages/OasProgression/services/buildOASProgressionRows", () => {
  const actual = jest.requireActual("@/pages/OasProgression/services/buildOASProgressionRows");
  return { ...actual, getCachedOASTree: jest.fn(), getCachedOASTemplate: jest.fn() };
});

const mockTree = getCachedOASTree as jest.MockedFunction<typeof getCachedOASTree>;
const mockTemplate = getCachedOASTemplate as jest.MockedFunction<typeof getCachedOASTemplate>;

function template(labels: string[], extraInputs: Array<{ id: string; type: string; label: string }> = []): OASTemplate {
  return {
    template: "x",
    version: 1,
    document: [
      {
        title: "Stage",
        input_groups: [
          {
            title: "Plan>",
            inputs: [...labels.map((label, index) => ({ id: "input_" + index + "_" + label.length, type: "verifiable_checkbox", label })), ...extraInputs],
          },
        ],
      },
    ],
  };
}

/** Paddling-shaped: trunk stages 1-2, then two branches at stage 3. */
function forkingTree(): OASTree {
  return {
    title: "Paddling",
    stream_id: "paddling",
    description: "",
    tree: {
      branch_id: "paddling",
      title: "Paddling",
      stage: 1,
      template_link: "oas/paddling/1/latest.json",
      children: [
        {
          branch_id: "paddling",
          title: "Paddling",
          stage: 2,
          template_link: "oas/paddling/2/latest.json",
          children: [
            { branch_id: "canoeing", title: "Canoeing", stage: 3, template_link: "oas/paddling/canoeing/3/latest.json", children: [] },
            { branch_id: "kayaking", title: "Kayaking", stage: 3, template_link: "oas/paddling/kayaking/3/latest.json", children: [] },
          ],
        },
      ],
    },
  };
}

function singleStageTree(stream: string): OASTree {
  return {
    title: stream,
    stream_id: stream,
    description: "",
    tree: { branch_id: stream, title: stream, stage: 1, template_link: "oas/" + stream + "/1/latest.json", children: [] },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("normaliseIStatement", () => {
  it("collapses trailing punctuation, case, whitespace and curly quotes to one key", () => {
    const variants = ["I can explain the 'buddy' system.", "I can explain the ‘buddy’ system", "  i can explain the 'buddy'   system!  ", "I Can Explain The 'Buddy' System."];
    const keys = new Set(variants.map(normaliseIStatement));
    expect(keys.size).toBe(1);
  });

  it("keeps genuinely different statements distinct", () => {
    expect(normaliseIStatement("I can tie a bowline")).not.toBe(normaliseIStatement("I can tie a clove hitch"));
  });

  it("normalises en and em dashes to hyphens", () => {
    expect(normaliseIStatement("I can paddle 5–10 km")).toBe(normaliseIStatement("I can paddle 5-10 km"));
  });
});

describe("titleCaseSegment", () => {
  it("turns a hyphenated branch id into display text", () => {
    expect(titleCaseSegment("white-water-rafting")).toBe("White Water Rafting");
    expect(titleCaseSegment("paddling")).toBe("Paddling");
  });
});

describe("buildIStatementMatrix", () => {
  it("merges labels differing only by punctuation across skills into one row with two cells", async () => {
    mockTree.mockImplementation(async (stream: string) => singleStageTree(stream));
    mockTemplate.mockImplementation(async (link: string) => (link.includes("camping") ? template(["I can light a fire."]) : template(["I can light a fire"])));

    const matrix = await buildIStatementMatrix(["camping", "bushcraft"]);

    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].cells).toHaveLength(2);
    expect(matrix.rows[0].variants.size).toBe(2);
  });

  it("picks the most common variant as displayText", async () => {
    mockTree.mockImplementation(async (stream: string) => singleStageTree(stream));
    mockTemplate.mockImplementation(async (link: string) => (link.includes("camping") ? template(["I can swim."]) : template(["I can swim"])));

    // bushcraft + bushwalking both use the unpunctuated form, camping the punctuated one.
    const matrix = await buildIStatementMatrix(["camping", "bushcraft", "bushwalking"]);

    expect(matrix.rows[0].displayText).toBe("I can swim");
  });

  it("breaks a display-text tie alphabetically for stable ordering", async () => {
    mockTree.mockImplementation(async (stream: string) => singleStageTree(stream));
    mockTemplate.mockImplementation(async (link: string) => (link.includes("camping") ? template(["I can swim."]) : template(["I can swim"])));

    const matrix = await buildIStatementMatrix(["camping", "bushcraft"]);

    // One occurrence each; "I can swim" sorts before "I can swim.".
    expect(matrix.rows[0].displayText).toBe("I can swim");
  });

  it("excludes logbook_up_to_date and file_uploader regardless of declared type", async () => {
    mockTree.mockImplementation(async () => singleStageTree("camping"));
    mockTemplate.mockResolvedValue(
      template(
        ["I can pitch a tent"],
        [
          { id: "logbook_up_to_date", type: "checkbox", label: "My logbook is up to date at the end of this stage." },
          { id: "logbook_up_to_date", type: "text", label: "Logbook up to date" },
          { id: "file_uploader", type: "file_uploader", label: "Upload supporting documents" },
        ],
      ),
    );

    const matrix = await buildIStatementMatrix(["camping"]);

    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].displayText).toBe("I can pitch a tent");
  });

  it("separates trunk and branch groups, each with only the stages that exist", async () => {
    mockTree.mockResolvedValue(forkingTree());
    mockTemplate.mockImplementation(async () => template(["I can paddle"]));

    const matrix = await buildIStatementMatrix(["paddling"]);

    expect(matrix.groups.map((g) => g.label)).toEqual(["Paddling · Paddling", "Paddling · Canoeing", "Paddling · Kayaking"]);
    expect(matrix.groups[0].stages).toEqual([1, 2]);
    expect(matrix.groups[1].stages).toEqual([3]);
    expect(matrix.groups[2].stages).toEqual([3]);
  });

  it("orders rows by cell count descending, then alphabetically", async () => {
    mockTree.mockResolvedValue(forkingTree());
    mockTemplate.mockImplementation(async (link: string) => (link.includes("/1/") ? template(["Rare statement", "Common statement"]) : template(["Common statement"])));

    const matrix = await buildIStatementMatrix(["paddling"]);

    expect(matrix.rows[0].displayText).toBe("Common statement");
    expect(matrix.rows[0].cells).toHaveLength(4);
    expect(matrix.rows[1].displayText).toBe("Rare statement");
  });

  it("reports determinate progress reaching done === total", async () => {
    mockTree.mockResolvedValue(forkingTree());
    mockTemplate.mockImplementation(async () => template(["I can paddle"]));

    const calls: Array<[number, number]> = [];
    await buildIStatementMatrix(["paddling"], (done, total) => calls.push([done, total]));

    const total = calls[0][1];
    expect(total).toBe(4);
    expect(calls.every(([, t]) => t === total)).toBe(true);
    expect(calls[calls.length - 1]).toEqual([4, 4]);
  });

  it("counts failed templates without aborting the crawl", async () => {
    mockTree.mockResolvedValue(forkingTree());
    mockTemplate.mockImplementation(async (link: string) => (link.includes("canoeing") ? undefined : template(["I can paddle"])));

    const matrix = await buildIStatementMatrix(["paddling"]);

    expect(matrix.failedTemplates).toBe(1);
    expect(matrix.rows[0].cells).toHaveLength(3);
    expect(matrix.groups.map((g) => g.label)).not.toContain("Paddling · Canoeing");
  });

  it("skips a skill whose tree cannot be loaded", async () => {
    mockTree.mockResolvedValue(undefined);

    const matrix = await buildIStatementMatrix(["paddling"]);

    expect(matrix.rows).toHaveLength(0);
    expect(matrix.groups).toHaveLength(0);
  });

  it("records one cell per skill/branch/stage even if a statement repeats in a template", async () => {
    mockTree.mockImplementation(async () => singleStageTree("camping"));
    mockTemplate.mockResolvedValue(template(["I can pitch a tent", "I can pitch a tent."]));

    const matrix = await buildIStatementMatrix(["camping"]);

    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].cells).toHaveLength(1);
  });
});
