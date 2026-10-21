import type { PrintProfile } from "../summitPrint";
import peakAwardSummary from "./peakAwardSummary";
import skillHeatmap from "./skillHeatmap";
import presentAwards from "./presentAwards";
import oasTable from "./oasTable";

/** Gotcha: not registered by import side effect. package.json "sideEffects" lets webpack drop such imports, silently emptying the registry. */
export const SUMMIT_PRINT_PROFILES: PrintProfile[] = [peakAwardSummary, skillHeatmap, presentAwards, oasTable];
