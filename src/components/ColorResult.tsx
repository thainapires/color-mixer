import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getApproximateColorName,
  getColorFormats,
  getContrastInfo,
  getExportFormats,
  getReadableTextColor,
  normalizeHex,
} from "@/lib/color";

interface ColorResultProps {
  color: string;
  colorA: string;
  colorB: string;
  ratio: number;
  copiedSignal: number;
}

type ColorFormat = "HEX" | "RGB" | "HSL";
type ExportFormat = "CSS" | "Tailwind" | "JSON";

export const ColorResult = ({
  color,
  colorA,
  colorB,
  ratio,
  copiedSignal,
}: ColorResultProps) => {
  const [format, setFormat] = useState<ColorFormat>("HEX");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSS");
  const [copied, setCopied] = useState(false);
  const formats = getColorFormats(color);
  const exports = useMemo(
    () => getExportFormats(color, colorA, colorB, ratio),
    [color, colorA, colorB, ratio]
  );
  const displayValue = formats[format];
  const exportValue = exports[exportFormat];
  const textColor = getReadableTextColor(color);
  const colorName = getApproximateColorName(color);
  const contrast = getContrastInfo(color);

  const flashCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    flashCopied();
  };

  useEffect(() => {
    if (copiedSignal > 0) {
      flashCopied();
    }
  }, [copiedSignal]);

  return (
    <section className="mx-auto w-full max-w-xl">
      <div
        className="result-swatch relative flex min-h-40 flex-col justify-end overflow-hidden rounded-lg p-6 shadow-[var(--shadow-result)] transition-[background-color,transform,box-shadow] duration-500 data-[copied=true]:scale-[1.01]"
        style={{ backgroundColor: color, color: textColor }}
        data-copied={copied}
        aria-label={`Result color ${normalizeHex(color)}, approximately ${colorName}`}
      >
        <button
          type="button"
          onClick={() => copyToClipboard(displayValue)}
          className="absolute right-5 top-5 inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-white/15 px-3 text-sm font-medium text-current backdrop-blur-sm transition duration-200 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label={`Copy ${format} result ${displayValue}`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2">Copied!</span>
            </>
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] opacity-70">
            Result
          </p>
          <p className="font-mono text-3xl font-semibold">{normalizeHex(color)}</p>
          <p className="mt-2 text-sm font-medium capitalize opacity-80">{colorName}</p>
        </div>
      </div>

      <div className="result-tabs mt-3 flex flex-col items-center gap-2">
        <div
          className="flex items-center gap-7 text-sm font-medium"
          role="tablist"
          aria-label="Color format"
        >
          {(Object.keys(formats) as ColorFormat[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={format === item}
              onClick={() => setFormat(item)}
              className="relative px-1 py-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background data-[active=true]:text-foreground"
              data-active={format === item}
            >
              {item}
              {format === item && (
                <span className="absolute inset-x-0 -bottom-1 h-px bg-foreground" />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(displayValue)}
          className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 font-mono text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={`Copy ${displayValue}`}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copied!" : displayValue}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border/80 bg-background/55 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Contrast
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {contrast.label} with {contrast.bestText} text
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            white {contrast.white}:1 · dark {contrast.dark}:1
          </p>
        </div>

        <div className="rounded-md border border-border/80 bg-background/55 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Export
            </p>
            <button
              type="button"
              onClick={() => copyToClipboard(exportValue)}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <Copy className="h-3 w-3" aria-hidden="true" />
              Copy
            </button>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            {(Object.keys(exports) as ExportFormat[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setExportFormat(item)}
                className="rounded-sm px-2 py-1 text-muted-foreground transition hover:text-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
                data-active={exportFormat === item}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-2 truncate font-mono text-xs text-muted-foreground">
            {exportValue.replace(/\n/g, " ")}
          </p>
        </div>
      </div>
    </section>
  );
};
