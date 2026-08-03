import fs from "fs";
import path from "path";

const docsRoot = path.resolve(__dirname, "../../docs");
const requestsIndexPath = path.resolve(docsRoot, "requests/requests.ts");
const apiContractPath = path.resolve(docsRoot, "API/summit-integration-api-v0.md");
const openApiPath = path.resolve(docsRoot, "API/terrain.json");

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("docs cross-reference integrity", () => {
  it("links API v0 contract to the request examples index", () => {
    const contract = read(apiContractPath);

    expect(contract).toContain("docs/requests/requests.ts");
  });

  it("links request examples index back to API v0 docs and OpenAPI source", () => {
    const requestsIndex = read(requestsIndexPath);

    expect(requestsIndex).toContain("docs/API/summit-integration-api-v0.md");
    expect(requestsIndex).toContain("docs/API/terrain.json");
  });

  it("references concrete .rest example files and keeps links resolvable", () => {
    const requestsIndex = read(requestsIndexPath);
    const expectedExampleFiles = [
      "achievements.rest",
      "templates.rest",
      "events.rest",
      "calendars.rest",
      "logbook.rest",
      "profiles.rest",
    ];

    expectedExampleFiles.forEach((fileName) => {
      expect(requestsIndex).toContain(fileName);

      const linkedPath = path.resolve(docsRoot, "requests", fileName);
      expect(fs.existsSync(linkedPath)).toBe(true);
    });
  });

  it("ensures request examples index and API contract files are present", () => {
    expect(fs.existsSync(requestsIndexPath)).toBe(true);
    expect(fs.existsSync(apiContractPath)).toBe(true);
    expect(fs.existsSync(openApiPath)).toBe(true);
  });
});
