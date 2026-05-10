export type SaveEventFailure = {
  ok: false;
  status: number;
  topLevelMessages: string[];
  fieldErrors: Record<string, string[]>;
  rawMessage: string;
};

export type SaveEventResult =
  | {
      ok: true;
    }
  | SaveEventFailure;

const asStringArray = (value: unknown): string[] => {
  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
};

const extractFieldErrors = (candidate: unknown): Record<string, string[]> => {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return {};
  }

  const fieldErrors: Record<string, string[]> = {};

  Object.entries(candidate as Record<string, unknown>).forEach(([field, value]) => {
    const messages = asStringArray(value);
    if (messages.length > 0) {
      fieldErrors[field] = messages;
    }
  });

  return fieldErrors;
};

export const normalizeSaveEventFailure = (status: number, responseText: string): SaveEventFailure => {
  const rawMessage = responseText ?? "";
  const trimmedResponseText = rawMessage.trim();
  const topLevelMessages: string[] = [];
  let fieldErrors: Record<string, string[]> = {};

  if (trimmedResponseText) {
    try {
      const parsed = JSON.parse(trimmedResponseText) as Record<string, unknown>;

      topLevelMessages.push(...asStringArray(parsed.message));
      topLevelMessages.push(...asStringArray(parsed.error));
      topLevelMessages.push(...asStringArray(parsed.messages));

      fieldErrors = {
        ...extractFieldErrors(parsed.field_errors),
        ...extractFieldErrors(parsed.errors),
      };
    } catch {
      topLevelMessages.push(trimmedResponseText);
    }
  }

  if (!topLevelMessages.length) {
    topLevelMessages.push(`Request failed with status ${status}`);
  }

  return {
    ok: false,
    status,
    topLevelMessages,
    fieldErrors,
    rawMessage,
  };
};
