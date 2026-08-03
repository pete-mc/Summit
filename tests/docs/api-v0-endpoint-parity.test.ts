import fs from "fs";
import path from "path";

type OpenApiDocument = {
  servers?: Array<{ url: string }>;
  paths?: Record<string, Record<string, { servers?: Array<{ url: string }>; tags?: string[] }>>;
};

const terrainSpecPath = path.resolve(__dirname, "../../docs/API/terrain.json");

function readTerrainSpec(): OpenApiDocument {
  const raw = fs.readFileSync(terrainSpecPath, "utf8");
  return JSON.parse(raw) as OpenApiDocument;
}

function collectOperations(document: OpenApiDocument): Array<{ method: string; path: string; hosts: string[]; tags: string[] }> {
  const rootHosts = (document.servers ?? []).map((server) => new URL(server.url).hostname.toLowerCase());
  const operations: Array<{ method: string; path: string; hosts: string[]; tags: string[] }> = [];

  Object.entries(document.paths ?? {}).forEach(([endpointPath, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const operationHosts = (operation.servers ?? []).map((server) => new URL(server.url).hostname.toLowerCase());
      operations.push({
        method: method.toUpperCase(),
        path: endpointPath,
        hosts: operationHosts.length > 0 ? operationHosts : rootHosts,
        tags: operation.tags ?? [],
      });
    });
  });

  return operations;
}

describe("terrain OpenAPI endpoint parity for Summit v0", () => {
  it("covers the expected Terrain hosts and endpoint-method pairs used by Summit", () => {
    expect(fs.existsSync(terrainSpecPath)).toBe(true);

    const spec = readTerrainSpec();
    const operations = collectOperations(spec);

    expect(operations.length).toBeGreaterThan(0);

    const availableHosts = new Set(operations.flatMap((operation) => operation.hosts));
    [
      "members.terrain.scouts.com.au",
      "events.terrain.scouts.com.au",
      "achievements.terrain.scouts.com.au",
      "templates.terrain.scouts.com.au",
      "metrics.terrain.scouts.com.au",
    ].forEach((host) => {
      expect(availableHosts.has(host)).toBe(true);
    });

    const operationKeys = new Set(operations.map((operation) => `${operation.method} ${operation.path}`));
    [
      "GET /profiles",
      "GET /units/{unitId}/members",
      "GET /units/{unitId}/achievements",
      "GET /members/{memberId}/achievements",
      "GET /members/{memberId}/logbook/{logbookId}",
      "POST /members/{memberId}/logbook",
      "GET /members/{memberId}/events",
      "GET /events/{eventId}",
      "PATCH /events/{eventId}",
      "DELETE /events/{eventId}",
      "POST /units/{unitId}/events",
      "GET /members/{memberId}/calendars",
      "PUT /members/{memberId}/calendars",
      "GET /units/{unitId}/members/metrics",
      "GET /sia/{templateId}.json",
    ].forEach((operationKey) => {
      expect(operationKeys.has(operationKey)).toBe(true);
    });
  });

  it("uses only recognized Phase 3 domain tags", () => {
    const spec = readTerrainSpec();
    const operations = collectOperations(spec);
    const allowedTags = new Set(["auth", "members", "events", "achievements", "templates", "metrics"]);

    operations.forEach((operation) => {
      expect(operation.tags.length).toBeGreaterThan(0);
      operation.tags.forEach((tag) => {
        expect(allowedTags.has(tag)).toBe(true);
      });
    });
  });
});
