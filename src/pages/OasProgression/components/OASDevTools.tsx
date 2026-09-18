import React, { useEffect, useState } from "react";

const AWARDED_SWATCHES = ["004C00", "1A5E1A", "337033", "4D824D", "669466", "80A680", "99B799", "B3C9B3", "CCDBCC", "E6EDE6"];
const ANSWERED_SWATCHES = ["26004C", "3C1A5E", "513370", "674D82", "7D6694", "9380A6", "A899B7", "BEB3C9", "D4CCDB", "E9E6ED"];

const DEFAULT_AWARDED_COLOR = "#B3C9B3";
const DEFAULT_ANSWERED_COLOR = "#7D6694";

interface DevToolsColors {
  awardedColor: string;
  answeredColor: string;
}

const DEV_TOOLS_COLORS_KEY = "summit.oasProgression.devToolsColors";

function loadDevToolsColors(): DevToolsColors {
  try {
    const stored = window.localStorage.getItem(DEV_TOOLS_COLORS_KEY);
    if (!stored) {
      return { awardedColor: DEFAULT_AWARDED_COLOR, answeredColor: DEFAULT_ANSWERED_COLOR };
    }
    const parsed = JSON.parse(stored);
    return {
      awardedColor: typeof parsed.awardedColor === "string" ? parsed.awardedColor : DEFAULT_AWARDED_COLOR,
      answeredColor: typeof parsed.answeredColor === "string" ? parsed.answeredColor : DEFAULT_ANSWERED_COLOR,
    };
  } catch {
    return { awardedColor: DEFAULT_AWARDED_COLOR, answeredColor: DEFAULT_ANSWERED_COLOR };
  }
}

function saveDevToolsColors(colors: DevToolsColors) {
  try {
    window.localStorage.setItem(DEV_TOOLS_COLORS_KEY, JSON.stringify(colors));
  } catch {
    // local storage is best-effort only
  }
}

function SwatchRow({ label, swatches, selected, onSelect }: { label: string; swatches: string[]; selected: string; onSelect: (hex: string) => void }): React.ReactNode {
  return (
    <div className="oas-dev-tools-field">
      <label className="oas-heatmap-filter-label">{label}</label>
      <div className="oas-dev-swatch-row">
        {swatches.map((hex) => (
          <button key={hex} type="button" className="oas-dev-swatch" style={{ backgroundColor: `#${hex}` }} aria-pressed={selected.toLowerCase() === `#${hex}`.toLowerCase()} title={`#${hex}`} onClick={() => onSelect(`#${hex}`)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Developer-only panel for tuning the heat map's awarded/answered colors. Only mounted when
 * OAS_DEV_TOOLS_ENABLED is flipped on in OasProgression.tsx — not a real user-facing feature.
 * Overrides the --summit-color-status-awarded/-answered CSS variables on the whole page's root
 * so the change is visible immediately across the heat map without touching index.css.
 */
export function OASDevTools(): React.ReactNode {
  const [colors, setColors] = useState<DevToolsColors>(loadDevToolsColors);

  useEffect(() => {
    saveDevToolsColors(colors);
    document.documentElement.style.setProperty("--summit-color-status-awarded", colors.awardedColor);
    document.documentElement.style.setProperty("--summit-color-status-answered", colors.answeredColor);
  }, [colors]);

  return (
    <div className="oas-dev-tools-panel" data-oas-dev-tools="true">
      <SwatchRow label="Awarded bar colour" swatches={AWARDED_SWATCHES} selected={colors.awardedColor} onSelect={(hex) => setColors((prev) => ({ ...prev, awardedColor: hex }))} />
      <SwatchRow label="Answered box colour" swatches={ANSWERED_SWATCHES} selected={colors.answeredColor} onSelect={(hex) => setColors((prev) => ({ ...prev, answeredColor: hex }))} />
    </div>
  );
}
