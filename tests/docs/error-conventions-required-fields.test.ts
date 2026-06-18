import fs from "fs";
import path from "path";

const errorConventionsPath = path.resolve(__dirname, "../../docs/API/summit-error-conventions.md");

function readErrorConventions(): string {
  return fs.readFileSync(errorConventionsPath, "utf8");
}

describe("summit error conventions required fields", () => {
  it("defines a normalized error model with required fields and semantics", () => {
    expect(fs.existsSync(errorConventionsPath)).toBe(true);

    const markdown = readErrorConventions();

    expect(markdown).toContain("## Normalized error model");
    expect(markdown).toContain("error.code");
    expect(markdown).toContain("error.message");
    expect(markdown).toContain("error.details");
    expect(markdown).toContain("error.retryable");
    expect(markdown).toContain("error.category");
    expect(markdown).toContain("correlationId");
  });

  it("documents retryability guidance for external integrations", () => {
    const markdown = readErrorConventions().toLowerCase();

    expect(markdown).toContain("retryability guidance");
    expect(markdown).toContain("safe to retry");
    expect(markdown).toContain("do not retry");
    expect(markdown).toContain("backoff");
    expect(markdown).toContain("idempotency");
  });
});
