import TerrainState from "@/helpers/TerrainState";
import { getSectionLabel, getSectionLogoUrl } from "./sectionLogo";

export interface TerrainPrintContext {
  /** Placeholder values every print header/footer can use: {unit}, {group}, {section}. */
  vars: { unit: string; group: string; section: string };
  /** Section logo URL for the header, or null. */
  logo: string | null;
}

/**
 * Who/what is being printed, read from Terrain's active profile. Each read is guarded on its own:
 * a missing value prints as nothing (summitPrint tidies the dangling separator) rather than
 * stopping the print.
 */
export function getTerrainPrintContext(): TerrainPrintContext {
  const read = (fn: () => string | undefined): string => {
    try {
      return fn() ?? "";
    } catch {
      return "";
    }
  };
  const section = read(() => TerrainState.getSectionName());
  return {
    vars: {
      unit: read(() => TerrainState.getUnitName()),
      group: read(() => TerrainState.getGroupName()),
      section: getSectionLabel(section),
    },
    logo: getSectionLogoUrl(section),
  };
}
