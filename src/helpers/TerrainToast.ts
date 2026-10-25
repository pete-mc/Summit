import { createLogger } from "./Logger";

const logger = createLogger("TerrainToast");

export type ToastKind = "success" | "error" | "info";

/** Icon names from Terrain's own setSnack calls. */
const ICONS: Record<ToastKind, string> = { success: "check", error: "nope", info: "info" };

const DEFAULT_TIMEOUT_MS: Record<ToastKind, number> = { success: 4000, error: 6000, info: 6000 };

/**
 * Learning: shows Terrain's own top-right snackbar, so Summit messages look like Terrain's.
 * Gotcha: setSnack reuses the previous caller's timeout when none is given, so always pass one.
 */
export function showTerrainToast(message: string, kind: ToastKind = "success", timeoutMs: number = DEFAULT_TIMEOUT_MS[kind]): void {
  const store = window.$nuxt?.$store;
  if (!store) {
    logger.warn("Terrain's store is not available; toast not shown:", message);
    return;
  }
  store.dispatch("snackbar/setSnack", { message, icon: ICONS[kind], timeout: timeoutMs, type: "", path: "", filename: "" });
}
