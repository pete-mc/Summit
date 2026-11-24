import moment from "moment";

/**
 * Gotcha: imported awards carry day-first dates ("5/6/2023"). Without explicit formats moment falls back to
 * the browser's US month-first parse, so 5 June reads as 6 May.
 */
const ROW_DATE_FORMATS = [moment.ISO_8601, "D/M/YYYY"];

export function parseRowDate(date: string): moment.Moment {
  return moment(date, ROW_DATE_FORMATS, true);
}

/** Unparseable dates are shown as-is. */
export function formatAwardDate(date: string | null): string {
  if (!date) return "";
  const parsed = parseRowDate(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : date;
}
