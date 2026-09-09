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

export type DerivedPaletteType = "Complement" | "Analogous" | "Triadic";

export interface DerivedPalette {
  type: DerivedPaletteType;
  colors: string[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const normalizeHex = (hex: string): string => hex.toUpperCase();

export const isValidHex = (value: string): boolean =>
  /^#?[0-9a-f]{6}$/i.test(value.trim());

export const parseHexInput = (value: string): string | null => {
  const trimmed = value.trim();

  if (!isValidHex(trimmed)) {
    return null;
  }

  return normalizeHex(trimmed.startsWith("#") ? trimmed : `#${trimmed}`);
};

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
    `#${clamp(Math.round(r), 0, 255).toString(16).padStart(2, "0")}${clamp(
      Math.round(g),
      0,
      255
    )
      .toString(16)
      .padStart(2, "0")}${clamp(Math.round(b), 0, 255)
      .toString(16)
      .padStart(2, "0")}`
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
    r: a.r * weightA + b.r * weightB,
    g: a.g * weightA + b.g * weightB,
    b: a.b * weightA + b.b * weightB,
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

export const hslToHex = ({ h, s, l }: HslColor): string => {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = chroma;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = chroma;
  } else if (hue < 180) {
    g = chroma;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = chroma;
  } else if (hue < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return rgbToHex({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  });
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

export const randomHexColor = (): string =>
  rgbToHex({
    r: Math.random() * 255,
    g: Math.random() * 255,
    b: Math.random() * 255,
  });

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

export const getContrastRatio = (foreground: string, background: string): number => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

export const getContrastInfo = (hex: string) => {
  const white = getContrastRatio("#FFFFFF", hex);
  const dark = getContrastRatio("#0F172A", hex);
  const bestText = white >= dark ? "white" : "dark";
  const bestRatio = Math.max(white, dark);

  return {
    white,
    dark,
    bestText,
    bestRatio,
    label: bestRatio >= 4.5 ? "Good contrast" : "Low contrast",
  };
};

export const getApproximateColorName = (hex: string): string => {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));

  if (l <= 10) return "near black";
  if (l >= 94 && s <= 14) return "soft white";
  if (s <= 8) {
    if (l < 35) return "charcoal gray";
    if (l < 70) return "balanced gray";
    return "pale gray";
  }

  const tone = l < 28 ? "deep" : l > 78 ? "pale" : s < 32 ? "muted" : s > 72 ? "vivid" : "soft";
  const families = [
    { max: 15, name: "red" },
    { max: 38, name: "coral" },
    { max: 58, name: "amber" },
    { max: 82, name: "yellow" },
    { max: 150, name: "green" },
    { max: 190, name: "teal" },
    { max: 220, name: "cyan" },
    { max: 255, name: "blue" },
    { max: 285, name: "violet" },
    { max: 330, name: "magenta" },
    { max: 360, name: "red" },
  ];
  const family = families.find((item) => h <= item.max)?.name ?? "color";

  return `${tone} ${family}`;
};

export const getTonalScale = (hex: string): string[] => {
  const hsl = rgbToHsl(hexToRgb(hex));
  const stops = [18, 30, 42, hsl.l, 62, 74, 86];

  return stops.map((lightness) =>
    hslToHex({
      h: hsl.h,
      s: clamp(hsl.s, 12, 88),
      l: clamp(lightness, 4, 96),
    })
  );
};

export const getDerivedPalettes = (hex: string): DerivedPalette[] => {
  const hsl = rgbToHsl(hexToRgb(hex));
  const base = { ...hsl, s: clamp(hsl.s, 18, 82), l: clamp(hsl.l, 32, 72) };
  const rotate = (degrees: number) =>
    hslToHex({ ...base, h: (base.h + degrees + 360) % 360 });

  return [
    { type: "Complement", colors: [hex, rotate(180)] },
    { type: "Analogous", colors: [rotate(-30), hex, rotate(30)] },
    { type: "Triadic", colors: [hex, rotate(120), rotate(240)] },
  ];
};

export const getExportFormats = (hex: string, colorA: string, colorB: string, ratio: number) => {
  const formats = getColorFormats(hex);

  return {
    CSS: `--color-mix: ${formats.HEX};`,
    Tailwind: `mix: "${formats.HEX}"`,
    JSON: JSON.stringify(
      {
        color: formats.HEX,
        rgb: formats.RGB,
        hsl: formats.HSL,
        mix: { colorA: normalizeHex(colorA), colorB: normalizeHex(colorB), ratio },
      },
      null,
      2
    ),
  };
};
