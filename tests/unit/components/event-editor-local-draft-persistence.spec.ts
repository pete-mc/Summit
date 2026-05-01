import { clearSummitCalendarEditorDraft, loadSummitCalendarEditorDraft, saveSummitCalendarEditorDraft } from "@/helpers/SummitCalendarDraftPersistence";

describe("Phase 2 event editor local draft persistence", () => {
  const storageKey = "summit.calendar.editor.draft";

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and restores draft data using localStorage only", () => {
    const draft = {
      title: "Weekly planning",
      location: "Scout Hall",
      challenge_area: "community",
    };

    saveSummitCalendarEditorDraft(draft);

    expect(window.localStorage.getItem(storageKey)).toContain("Weekly planning");
    expect(loadSummitCalendarEditorDraft()).toEqual(expect.objectContaining(draft));
  });

  it("clears draft data after save/cancel paths", () => {
    saveSummitCalendarEditorDraft({ title: "Temporary" });
    clearSummitCalendarEditorDraft();

    expect(window.localStorage.getItem(storageKey)).toBeNull();
    expect(loadSummitCalendarEditorDraft()).toBeNull();
  });

  it("ignores malformed local draft payloads safely", () => {
    window.localStorage.setItem(storageKey, "{not-json");

    expect(loadSummitCalendarEditorDraft()).toBeNull();
  });
});
