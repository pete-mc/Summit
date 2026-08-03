import fs from "fs";
import path from "path";

const contractPath = path.resolve(__dirname, "../../docs/API/summit-integration-api-v0.md");

function readContract(): string {
  return fs.readFileSync(contractPath, "utf8");
}

describe("summit-integration-api-v0 contract shape", () => {
  it("defines the required domain groups", () => {
    expect(fs.existsSync(contractPath)).toBe(true);

    const markdown = readContract();

    expect(markdown).toContain("## Domain groups");

    const requiredGroups = ["auth", "members", "events", "achievements", "templates", "metrics"];

    requiredGroups.forEach((group) => {
      expect(markdown.toLowerCase()).toContain(group);
    });
  });

  it("documents request and response contract style", () => {
    const markdown = readContract();

    expect(markdown).toContain("## Request/response contract style");
    expect(markdown).toContain("Request envelope");
    expect(markdown).toContain("Response envelope");
    expect(markdown).toContain("correlationId");
  });

  it("documents a stable error contract", () => {
    const markdown = readContract();

    expect(markdown).toContain("## Error contract");
    expect(markdown).toContain("error.code");
    expect(markdown).toContain("error.message");
    expect(markdown).toContain("error.details");
  });

  it("defines auth model and token provider abstraction", () => {
    const markdown = readContract();

    expect(markdown).toContain("## Auth model");
    expect(markdown).toContain("TokenProvider");
    expect(markdown).toContain("getToken");
    expect(markdown).toContain("Authorization: Bearer");
  });

  it("documents versioning and compatibility with a future public stance", () => {
    const markdown = readContract();
    const normalized = markdown.toLowerCase();

    expect(markdown).toContain("## Versioning and compatibility");
    expect(normalized).toContain("v0");
    expect(normalized).toContain("non-breaking");
    expect(normalized).toContain("public");
  });
});
