import TerrainState from "@/helpers/TerrainState";
import { getSectionLabel, getSectionLogoUrl } from "./sectionLogo";

export interface TerrainPrintContext {
  vars: { unit: string; group: string; section: string };
  logo: string | null;
}

/** Each value is read separately, so a missing one prints as blank instead of stopping the print. */
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
