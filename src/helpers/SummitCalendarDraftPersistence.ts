import { TerrainEvent } from "@/types/terrainTypes";

const SUMMIT_CALENDAR_EDITOR_DRAFT_KEY = "summit.calendar.editor.draft";

export const saveSummitCalendarEditorDraft = (draft: Partial<TerrainEvent>) => {
  try {
    window.localStorage.setItem(SUMMIT_CALENDAR_EDITOR_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // local storage is best-effort only
  }
};

export const loadSummitCalendarEditorDraft = (): Partial<TerrainEvent> | null => {
  try {
    const draft = window.localStorage.getItem(SUMMIT_CALENDAR_EDITOR_DRAFT_KEY);
    if (!draft) {
      return null;
    }

    const parsed = JSON.parse(draft);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as Partial<TerrainEvent>;
  } catch {
    return null;
  }
};

export const clearSummitCalendarEditorDraft = () => {
  try {
    window.localStorage.removeItem(SUMMIT_CALENDAR_EDITOR_DRAFT_KEY);
  } catch {
    // local storage is best-effort only
  }
};
