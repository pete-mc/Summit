import fs from "fs";
import path from "path";

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
};

type RestExpectation = {
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  urlPattern: RegExp;
  openApiPath?: string;
};

const docsRoot = path.resolve(__dirname, "../../docs");
const requestsRoot = path.resolve(docsRoot, "requests");
const terrainSpecPath = path.resolve(docsRoot, "API/terrain.json");

function readRestFiles(): Array<{ filePath: string; content: string }> {
  const files = fs
    .readdirSync(requestsRoot)
    .filter((fileName) => fileName.endsWith(".rest"))
    .map((fileName) => path.resolve(requestsRoot, fileName));

  return files.map((filePath) => ({
    filePath,
    content: fs.readFileSync(filePath, "utf8"),
  }));
}

function hasRestExample(restFiles: Array<{ filePath: string; content: string }>, expectation: RestExpectation): boolean {
  return restFiles.some(({ content }) => {
    const lines = content.split(/\r?\n/);
    return lines.some((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith(expectation.method + " ")) {
        return false;
      }

      return expectation.urlPattern.test(trimmed);
    });
  });
}

function readTerrainSpec(): OpenApiDocument {
  const raw = fs.readFileSync(terrainSpecPath, "utf8");
  return JSON.parse(raw) as OpenApiDocument;
}

function getRequestBlocks(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const requestLinePattern = /^(GET|POST|PUT|PATCH|DELETE)\s+\S+\s+HTTP\/1\.1$/;
  const blocks: string[] = [];

  let currentBlock: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (requestLinePattern.test(trimmed)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
      }

      currentBlock = [trimmed];
      return;
    }

    if (currentBlock.length > 0) {
      currentBlock.push(trimmed);
    }
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks;
}

describe("docs request examples coverage", () => {
  it("uses Authorization: Bearer {{token}} for every request example", () => {
    const restFiles = readRestFiles();
    const invalidExamples: string[] = [];

    restFiles.forEach(({ filePath, content }) => {
      const blocks = getRequestBlocks(content);

      blocks.forEach((block, index) => {
        const hasExpectedHeader = /^Authorization:\s+Bearer\s+\{\{token\}\}\s*$/im.test(block);
        if (!hasExpectedHeader) {
          invalidExamples.push(`${path.basename(filePath)}#${index + 1}`);
        }
      });
    });

    expect(invalidExamples).toEqual([]);
  });

  it("contains concrete REST examples for key runtime operations", () => {
    const restFiles = readRestFiles();

    expect(restFiles.length).toBeGreaterThan(0);

    const requiredExamples: RestExpectation[] = [
      {
        description: "Profiles: GET /profiles",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/members\.terrain\.scouts\.com\.au\/profiles(?:\s|\?|$)/i,
        openApiPath: "/profiles",
      },
      {
        description: "Events list in date window: GET /members/{memberId}/events",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/events\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/events\?[^\s]*start_datetime=[^\s&]+&end_datetime=[^\s&]+(?:\s|$)/i,
        openApiPath: "/members/{memberId}/events",
      },
      {
        description: "Event detail: GET /events/{eventId}",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/events\.terrain\.scouts\.com\.au\/events\/[^\s/]+(?:\s|$)/i,
        openApiPath: "/events/{eventId}",
      },
      {
        description: "Create event: POST /units/{unitId}/events",
        method: "POST",
        urlPattern: /^POST\s+https:\/\/events\.terrain\.scouts\.com\.au\/units\/[^\s/]+\/events(?:\s|$)/i,
        openApiPath: "/units/{unitId}/events",
      },
      {
        description: "Update event: PATCH /events/{eventId}",
        method: "PATCH",
        urlPattern: /^PATCH\s+https:\/\/events\.terrain\.scouts\.com\.au\/events\/[^\s/]+(?:\s|$)/i,
        openApiPath: "/events/{eventId}",
      },
      {
        description: "Delete event: DELETE /events/{eventId}",
        method: "DELETE",
        urlPattern: /^DELETE\s+https:\/\/events\.terrain\.scouts\.com\.au\/events\/[^\s/]+(?:\s|$)/i,
        openApiPath: "/events/{eventId}",
      },
      {
        description: "Calendars read: GET /members/{memberId}/calendars",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/events\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/calendars(?:\s|$)/i,
        openApiPath: "/members/{memberId}/calendars",
      },
      {
        description: "Calendars update: PUT /members/{memberId}/calendars",
        method: "PUT",
        urlPattern: /^PUT\s+https:\/\/events\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/calendars(?:\s|$)/i,
        openApiPath: "/members/{memberId}/calendars",
      },
      {
        description: "Logbook read: GET /members/{memberId}/logbook/{logbookId}",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/achievements\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/logbook\/[^\s/]+(?:\s|$)/i,
        openApiPath: "/members/{memberId}/logbook/{logbookId}",
      },
      {
        description: "Logbook write: POST /members/{memberId}/logbook",
        method: "POST",
        urlPattern: /^POST\s+https:\/\/achievements\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/logbook(?:\s|$)/i,
        openApiPath: "/members/{memberId}/logbook",
      },
      {
        description: "Achievements filters (unit): GET /units/{unitId}/achievements?type=...",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/achievements\.terrain\.scouts\.com\.au\/units\/[^\s/]+\/achievements\?[^\s]*type=[^\s&]+(?:\s|$)/i,
        openApiPath: "/units/{unitId}/achievements",
      },
      {
        description: "Achievements filters (member): GET /members/{memberId}/achievements?type=...",
        method: "GET",
        urlPattern: /^GET\s+https:\/\/achievements\.terrain\.scouts\.com\.au\/members\/[^\s/]+\/achievements\?[^\s]*type=[^\s&]+(?:\s|$)/i,
        openApiPath: "/members/{memberId}/achievements",
      },
    ];

    requiredExamples.forEach((expectation) => {
      expect(hasRestExample(restFiles, expectation)).toBe(true);
    });
  });

  it("keeps request example operations aligned with terrain OpenAPI paths", () => {
    const spec = readTerrainSpec();
    const paths = spec.paths ?? {};

    const requiredPathMethods: Array<{ path: string; method: string }> = [
      { path: "/profiles", method: "get" },
      { path: "/members/{memberId}/events", method: "get" },
      { path: "/events/{eventId}", method: "get" },
      { path: "/events/{eventId}", method: "patch" },
      { path: "/events/{eventId}", method: "delete" },
      { path: "/units/{unitId}/events", method: "post" },
      { path: "/members/{memberId}/calendars", method: "get" },
      { path: "/members/{memberId}/calendars", method: "put" },
      { path: "/members/{memberId}/logbook/{logbookId}", method: "get" },
      { path: "/members/{memberId}/logbook", method: "post" },
      { path: "/units/{unitId}/achievements", method: "get" },
      { path: "/members/{memberId}/achievements", method: "get" },
    ];

    requiredPathMethods.forEach(({ path: endpointPath, method }) => {
      const operation = paths[endpointPath]?.[method];
      expect(operation).toBeDefined();
    });
  });
});
