import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { ColorResult } from "./ColorResult";
import { hexToRgbChannels, mixColors, normalizeHex } from "@/lib/color";

interface MixHistory {
  color1: string;
  color2: string;
  ratio: number;
  result: string;
}

const HISTORY_KEY = "color-mixer:recent-mixes";
const MAX_HISTORY_ITEMS = 7;

const loadHistory = (): MixHistory[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(HISTORY_KEY);
    return saved ? (JSON.parse(saved) as MixHistory[]) : [];
  } catch {
    return [];
  }
};

export const ColorMixer = () => {
  const [color1, setColor1] = useState("#823A3A");
  const [color2, setColor2] = useState("#4040A0");
  const [ratio, setRatio] = useState(50);
  const [history, setHistory] = useState<MixHistory[]>(loadHistory);

  const resultColor = useMemo(
    () => mixColors(color1, color2, ratio),
    [color1, color2, ratio]
  );
  const color2Ratio = 100 - ratio;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const newMix = { color1, color2, ratio, result: resultColor };

      setHistory((prev) => {
        const filtered = prev.filter(
          (item) =>
            !(
              item.color1 === color1 &&
              item.color2 === color2 &&
              item.ratio === ratio
            )
        );
        return [newMix, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [color1, color2, ratio, resultColor]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const pageStyle = {
    "--color-a-rgb": hexToRgbChannels(color1),
    "--color-b-rgb": hexToRgbChannels(color2),
    "--mix-rgb": hexToRgbChannels(resultColor),
  } as CSSProperties;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      style={pageStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgb(var(--color-a-rgb)/0.16),transparent_28rem),radial-gradient(circle_at_100%_72%,rgb(var(--color-b-rgb)/0.13),transparent_30rem),radial-gradient(circle_at_52%_42%,rgb(var(--mix-rgb)/0.08),transparent_24rem)] transition-[background] duration-500" />

      <div className="app-shell relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-6">
        <header className="app-header flex items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 items-baseline gap-5">
            <a
              href="/"
              className="shrink-0 text-2xl font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Color<span className="text-accent">Mixer</span>
            </a>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Mix colors. Discover new possibilities.
            </p>
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              GitHub
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        </header>

        <section className="app-hero mx-auto mt-8 max-w-3xl text-center sm:mt-10 lg:mt-10 xl:mt-8">
          <h1 className="app-hero-title text-balance text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-5xl xl:text-6xl">
            Two colors
            <br />
            infinite possibilities.
          </h1>
          <p className="app-hero-copy mx-auto mt-3 max-w-lg text-base leading-7 text-muted-foreground lg:mt-2">
            Mix two colors and see the result in real time.
          </p>
        </section>

        <section
          className="mixer-grid mt-8 grid items-center gap-7 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,29rem)_minmax(0,1fr)] lg:gap-8"
          aria-label="Color mixer"
        >
          <ColorPicker label="Color A" color={color1} onChange={setColor1} />

          <div className="flex flex-col gap-4">
            <label htmlFor="mix-ratio" className="sr-only">
              Color A mix percentage
            </label>
            <input
              id="mix-ratio"
              type="range"
              min="0"
              max="100"
              value={ratio}
              onChange={(event) => setRatio(Number(event.target.value))}
              className="color-slider h-8 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none"
              style={{
                backgroundImage: `linear-gradient(90deg, ${color1}, ${color2})`,
              }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={ratio}
              aria-valuetext={`${ratio}% Color A and ${color2Ratio}% Color B`}
            />
            <div className="flex items-center justify-between font-mono text-lg text-foreground">
              <span>{ratio}%</span>
              <span>{color2Ratio}%</span>
            </div>
          </div>

          <ColorPicker label="Color B" color={color2} onChange={setColor2} />
        </section>

        <section className="result-section mt-4 sm:mt-5">
          <ColorResult color={resultColor} />
        </section>

        <section className="recent-mixes mx-auto mt-5 w-full max-w-3xl border-t border-border/80 pt-4 lg:mt-5">
          <div className="recent-header mb-2 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">Recent mixes</h2>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {history.map((item) => (
              <button
                key={`${item.color1}-${item.color2}-${item.ratio}-${item.result}`}
                type="button"
                onClick={() => {
                  setColor1(item.color1);
                  setColor2(item.color2);
                  setRatio(item.ratio);
                }}
                className="recent-swatch h-10 w-10 rounded-md border border-white/70 shadow-sm ring-offset-background transition duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                style={{ backgroundColor: item.result }}
                title={`${normalizeHex(item.result)} - ${item.ratio}% / ${100 - item.ratio}%`}
                aria-label={`Restore mix ${normalizeHex(item.result)}`}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setColor1("#823A3A");
                setColor2("#4040A0");
                setRatio(50);
              }}
              className="recent-swatch inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              aria-label="Reset to default mix"
              title="Reset mix"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        <p className="decorative-note pointer-events-none absolute bottom-14 right-8 hidden max-w-32 rotate-[-12deg] text-right font-serif text-xl italic leading-6 text-muted-foreground/70 lg:block">
          Good colors
          <br />
          create
          <br />
          better things.
        </p>

        <footer
          id="about"
          className="app-footer mt-auto py-3 text-sm text-muted-foreground"
        >
          Made with ♡ by Thainá
        </footer>
      </div>
    </main>
  );
};
