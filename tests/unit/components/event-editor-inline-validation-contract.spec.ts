import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 event editor inline validation contract", () => {
  it("uses inline validation state instead of alert-driven validation interruptions", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("editorValidationErrors");
    expect(source).toContain("setEditorValidationErrors");
    expect(source).toContain('data-editor-validation="title"');
    expect(source).toContain('data-editor-validation="location"');
    expect(source).toContain('data-editor-validation="challenge_area"');
    expect(source).toContain('data-editor-validation="date_range"');

    expect(source).not.toContain("alert(firstError)");
  });

  it("keeps required markers and validation or warning messages discoverable inside field status containers", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain('className="editor-field-required"');
    expect(source).toContain('aria-hidden="true"');

    ["title", "location", "challenge_area", "date_range"].forEach((validationId) => {
      const validationIndex = source.indexOf(`data-editor-validation="${validationId}"`);
      expect(validationIndex).toBeGreaterThan(-1);

      const precedingFieldStatusIndex = source.lastIndexOf('className="editor-field-status"', validationIndex);
      const precedingFieldIndex = source.lastIndexOf('className="editor-field"', validationIndex);
      expect(precedingFieldStatusIndex).toBeGreaterThan(precedingFieldIndex);
    });

    const warningIndex = source.indexOf('data-editor-warning="event-conflicts"');
    expect(warningIndex).toBeGreaterThan(-1);
    expect(source.lastIndexOf('className="editor-field-help"', warningIndex)).toBeGreaterThan(source.lastIndexOf('className="editor-field"', warningIndex));
  });
});
