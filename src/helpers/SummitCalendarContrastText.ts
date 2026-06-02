const WHITE_TEXT_COLOR = "#fff";
const BLACK_TEXT_COLOR = "#000";

const expandShorthandHex = (hex: string): string =>
  hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");

const parseHexColor = (backgroundColor: string): { red: number; green: number; blue: number } | null => {
  if (!backgroundColor) {
    return null;
  }

  const normalized = backgroundColor.trim().replace(/^#/, "");
  const fullHex = normalized.length === 3 ? expandShorthandHex(normalized) : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) {
    return null;
  }

  return {
    red: parseInt(fullHex.slice(0, 2), 16),
    green: parseInt(fullHex.slice(2, 4), 16),
    blue: parseInt(fullHex.slice(4, 6), 16),
  };
};

const toLinearChannel = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
};

const getRelativeLuminance = (red: number, green: number, blue: number): number => 0.2126 * toLinearChannel(red) + 0.7152 * toLinearChannel(green) + 0.0722 * toLinearChannel(blue);

const getContrastRatio = (luminanceA: number, luminanceB: number): number => {
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getContrastTextColor = (backgroundColor: string): "#fff" | "#000" => {
  const rgb = parseHexColor(backgroundColor);

  if (!rgb) {
    return BLACK_TEXT_COLOR;
  }

  const backgroundLuminance = getRelativeLuminance(rgb.red, rgb.green, rgb.blue);
  const whiteContrast = getContrastRatio(backgroundLuminance, 1);
  const blackContrast = getContrastRatio(backgroundLuminance, 0);

  return whiteContrast >= blackContrast ? WHITE_TEXT_COLOR : BLACK_TEXT_COLOR;
};
