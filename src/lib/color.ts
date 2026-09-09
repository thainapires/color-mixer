export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export const normalizeHex = (hex: string): string => hex.toUpperCase();

export const hexToRgb = (hex: string): RgbColor => {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }: RgbColor): string =>
  normalizeHex(
    `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  );

export const mixColors = (
  colorA: string,
  colorB: string,
  colorAAmount: number
): string => {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const weightA = colorAAmount / 100;
  const weightB = 1 - weightA;

  return rgbToHex({
    r: Math.round(a.r * weightA + b.r * weightB),
    g: Math.round(a.g * weightA + b.g * weightB),
    b: Math.round(a.b * weightA + b.b * weightB),
  });
};

export const rgbToHsl = ({ r, g, b }: RgbColor): HslColor => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      default:
        h = (red - green) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const getColorFormats = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  return {
    HEX: normalizeHex(hex),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
};

export const getReadableTextColor = (hex: string): "#0F172A" | "#FFFFFF" => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.58 ? "#0F172A" : "#FFFFFF";
};

export const hexToRgbChannels = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);

  return `${r} ${g} ${b}`;
};
