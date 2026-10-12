import type { PrintProfile } from "../summitPrint";
import peakAwardSummary from "./peakAwardSummary";
import skillHeatmap from "./skillHeatmap";
import presentAwards from "./presentAwards";
import oasTable from "./oasTable";

/**
 * Every table's print profile. summitPrint.ts builds its registry from this list directly, rather
 * than each profile registering itself as an import side effect: package.json's "sideEffects" list
 * lets webpack skip a module imported only for its side effects, which would leave the registry
 * silently empty (the same trap the Vuetify setup module hit).
 */
export const SUMMIT_PRINT_PROFILES: PrintProfile[] = [peakAwardSummary, skillHeatmap, presentAwards, oasTable];
