import type { PrintProfile } from "../summitPrint";
import peakAwardSummary from "./peakAwardSummary";
import skillHeatmap from "./skillHeatmap";
import oasNextSteps from "./oasNextSteps";
import overallProgress from "./overallProgress";
import oasStageGrid from "./oasStageGrid";

/** Gotcha: not registered by import side effect. package.json "sideEffects" lets webpack drop such imports, silently emptying the registry. */
export const SUMMIT_PRINT_PROFILES: PrintProfile[] = [peakAwardSummary, overallProgress, skillHeatmap, oasNextSteps, oasStageGrid];
