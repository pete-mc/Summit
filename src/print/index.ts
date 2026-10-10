/**
 * summit-print public API (.claude/Print/PLAN.md). Profiles are registered by summitPrint.ts
 * itself from profiles/index.ts — nothing here depends on import side effects.
 *
 * The button lives in src/components/SummitPrintButton.vue and is not re-exported here, so plain
 * .ts code and Jest can import this module without pulling in a .vue file.
 */
export * from "./summitPrint";
export { getTerrainPrintContext, type TerrainPrintContext } from "./printContext";
export { loadPrintSettings, savePrintSettings } from "./printSettings";
