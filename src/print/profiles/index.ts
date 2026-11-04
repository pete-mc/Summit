import type { PrintProfile } from "../summitPrint";
import peakAwardSummary from "./peakAwardSummary";
import skillHeatmap from "./skillHeatmap";
import oasTable from "./oasTable";
import overallProgress from "./overallProgress";
import oasWorksheets from "./oasWorksheets";

/** Gotcha: not registered by import side effect. package.json "sideEffects" lets webpack drop such imports, silently emptying the registry. */
export const SUMMIT_PRINT_PROFILES: PrintProfile[] = [peakAwardSummary, overallProgress, skillHeatmap, oasTable, oasWorksheets];
