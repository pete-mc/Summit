import fs from "fs";
import path from "path";

const errorConventionsPath = path.resolve(__dirname, "../../docs/API/summit-error-conventions.md");
const integrationContractPath = path.resolve(__dirname, "../../docs/API/summit-integration-api-v0.md");

function read(pathname: string): string {
  return fs.readFileSync(pathname, "utf8");
}

describe("auth and observability conventions documentation", () => {
  it("documents auth model conventions and token-provider abstraction", () => {
    expect(fs.existsSync(errorConventionsPath)).toBe(true);

    const markdown = read(errorConventionsPath);

    expect(markdown).toContain("## Auth conventions");
    expect(markdown).toContain("Authorization: Bearer <token>");
    expect(markdown).toContain("TokenProvider");
    expect(markdown).toContain("getToken");
    expect(markdown).toContain("token-provider abstraction");
  });

  it("documents observability conventions including correlation IDs, structured logging, and redaction guidance", () => {
    const markdown = read(errorConventionsPath).toLowerCase();

    expect(markdown).toContain("## observability conventions");
    expect(markdown).toContain("x-correlation-id");
    expect(markdown).toContain("structured logs");
    expect(markdown).toContain("redaction");
    expect(markdown).toContain("pii");
  });

  it("aligns the v0 integration contract doc with cross-links to the conventions document", () => {
    expect(fs.existsSync(integrationContractPath)).toBe(true);

    const integrationMarkdown = read(integrationContractPath);

    expect(integrationMarkdown).toContain("summit-error-conventions.md");
    expect(integrationMarkdown).toContain("Auth model");
    expect(integrationMarkdown).toContain("Error contract");
    expect(integrationMarkdown).toContain("correlationId");
  });
});
