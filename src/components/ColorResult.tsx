import { Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  getColorFormats,
  getReadableTextColor,
  normalizeHex,
} from "@/lib/color";

interface ColorResultProps {
  color: string;
}

type ColorFormat = "HEX" | "RGB" | "HSL";

export const ColorResult = ({ color }: ColorResultProps) => {
  const [format, setFormat] = useState<ColorFormat>("HEX");
  const [copied, setCopied] = useState(false);
  const formats = getColorFormats(color);
  const displayValue = formats[format];
  const textColor = getReadableTextColor(color);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(displayValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <div
        className="result-swatch relative flex min-h-40 flex-col justify-end rounded-lg p-6 shadow-[var(--shadow-result)] transition-colors duration-500"
        style={{ backgroundColor: color, color: textColor }}
        aria-label={`Result color ${normalizeHex(color)}`}
      >
        <button
          type="button"
          onClick={copyToClipboard}
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
          <p className="font-mono text-3xl font-semibold">
            {normalizeHex(color)}
          </p>
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
          onClick={copyToClipboard}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 font-mono text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={`Copy ${displayValue}`}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copied!" : displayValue}
        </button>
      </div>
    </section>
  );
};
