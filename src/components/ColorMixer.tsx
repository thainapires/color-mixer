import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  ExternalLink,
  Minimize2,
  Pin,
  PinOff,
  RefreshCcw,
  Shuffle,
} from "lucide-react";
import { BlurReveal } from "./blur-reveal";
import { ColorPicker } from "./ColorPicker";
import { ColorResult } from "./ColorResult";
import {
  getDerivedPalettes,
  getTonalScale,
  hexToRgbChannels,
  mixColors,
  normalizeHex,
  parseHexInput,
  randomHexColor,
} from "@/lib/color";

interface MixHistory {
  color1: string;
  color2: string;
  ratio: number;
  result: string;
  pinned?: boolean;
  createdAt: number;
}

type ActiveColor = "color1" | "color2";

interface SavedMix {
  color1: string;
  color2: string;
  ratio: number;
}

const HISTORY_KEY = "color-mixer:recent-mixes";
const LAST_MIX_KEY = "color-mixer:last-mix";
const COMPACT_KEY = "color-mixer:compact-mode";
const MAX_HISTORY_ITEMS = 9;

const defaultMix: SavedMix = {
  color1: "#823A3A",
  color2: "#4040A0",
  ratio: 50,
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']")
  );
};

const loadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const getInitialCompactMode = (): boolean => {
  if (typeof window === "undefined") return false;

  const saved = window.localStorage.getItem(COMPACT_KEY);
  if (saved) return JSON.parse(saved) as boolean;

  return window.innerWidth >= 1024 && window.innerHeight <= 850;
};

const normalizeHistory = (items: Partial<MixHistory>[]): MixHistory[] =>
  items
    .filter(
      (item): item is MixHistory =>
        Boolean(item.color1 && item.color2 && item.result && typeof item.ratio === "number")
    )
    .map((item, index) => ({
      ...item,
      color1: normalizeHex(item.color1),
      color2: normalizeHex(item.color2),
      result: normalizeHex(item.result),
      createdAt: item.createdAt ?? Date.now() - index,
      pinned: Boolean(item.pinned),
    }));

export const ColorMixer = () => {
  const initialMix = loadJson<SavedMix>(LAST_MIX_KEY, defaultMix);
  const [color1, setColor1] = useState(normalizeHex(initialMix.color1));
  const [color2, setColor2] = useState(normalizeHex(initialMix.color2));
  const [ratio, setRatio] = useState(initialMix.ratio);
  const [history, setHistory] = useState<MixHistory[]>(() =>
    normalizeHistory(loadJson<Partial<MixHistory>[]>(HISTORY_KEY, []))
  );
  const [activeColor, setActiveColor] = useState<ActiveColor>("color1");
  const [compactMode, setCompactMode] = useState(getInitialCompactMode);
  const [copiedSignal, setCopiedSignal] = useState(0);
  const [shortcutMessage, setShortcutMessage] = useState<string | null>(null);

  const resultColor = useMemo(
    () => mixColors(color1, color2, ratio),
    [color1, color2, ratio]
  );
  const color2Ratio = 100 - ratio;
  const tonalScale = useMemo(() => getTonalScale(resultColor), [resultColor]);
  const palettes = useMemo(() => getDerivedPalettes(resultColor), [resultColor]);

  const applyMix = useCallback((mix: SavedMix) => {
    setColor1(normalizeHex(mix.color1));
    setColor2(normalizeHex(mix.color2));
    setRatio(mix.ratio);
  }, []);

  const showShortcutMessage = useCallback((message: string) => {
    setShortcutMessage(message);
    window.setTimeout(() => setShortcutMessage(null), 1300);
  }, []);

  const copyResult = useCallback(async () => {
    await navigator.clipboard.writeText(resultColor);
    setCopiedSignal((value) => value + 1);
    showShortcutMessage("Copied result");
  }, [resultColor, showShortcutMessage]);

  const randomizeColors = useCallback(() => {
    setColor1(randomHexColor());
    setColor2(randomHexColor());
    showShortcutMessage("Random colors");
  }, [showShortcutMessage]);

  const swapColors = useCallback(() => {
    setColor1(color2);
    setColor2(color1);
    setRatio(color2Ratio);
    setActiveColor((current) => (current === "color1" ? "color2" : "color1"));
    showShortcutMessage("Swapped colors");
  }, [color1, color2, color2Ratio, showShortcutMessage]);

  const togglePinned = (target: MixHistory) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.createdAt === target.createdAt
          ? { ...item, pinned: !item.pinned }
          : item
      )
    );
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const newMix: MixHistory = {
        color1,
        color2,
        ratio,
        result: resultColor,
        createdAt: Date.now(),
      };

      setHistory((prev) => {
        const existing = prev.find(
          (item) =>
            item.color1 === color1 &&
            item.color2 === color2 &&
            item.ratio === ratio
        );
        const filtered = prev.filter(
          (item) =>
            !(
              item.color1 === color1 &&
              item.color2 === color2 &&
              item.ratio === ratio
            )
        );
        const next = [{ ...newMix, pinned: existing?.pinned, createdAt: existing?.createdAt ?? newMix.createdAt }, ...filtered];
        const pinned = next.filter((item) => item.pinned);
        const recent = next.filter((item) => !item.pinned);
        return [...pinned, ...recent].slice(0, MAX_HISTORY_ITEMS);
      });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [color1, color2, ratio, resultColor]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    window.localStorage.setItem(
      LAST_MIX_KEY,
      JSON.stringify({ color1, color2, ratio })
    );
  }, [color1, color2, ratio]);

  useEffect(() => {
    window.localStorage.setItem(COMPACT_KEY, JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const parsed = parseHexInput(event.clipboardData?.getData("text") ?? "");
      if (!parsed) return;

      event.preventDefault();
      if (activeColor === "color1") {
        setColor1(parsed);
      } else {
        setColor2(parsed);
      }
      showShortcutMessage(`Pasted ${parsed}`);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "r") {
        event.preventDefault();
        randomizeColors();
      }
      if (key === "s") {
        event.preventDefault();
        swapColors();
      }
      if (key === "c") {
        event.preventDefault();
        void copyResult();
      }
      if (key === "m") {
        event.preventDefault();
        setCompactMode((value) => !value);
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeColor, copyResult, randomizeColors, showShortcutMessage, swapColors]);

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

          <nav className="flex items-center gap-4 text-sm font-medium">
            <button
              type="button"
              onClick={() => setCompactMode((value) => !value)}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              aria-pressed={compactMode}
            >
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Compact</span>
            </button>
            <a
              href="https://github.com/thainapires/color-mixer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              GitHub
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        </header>

        {!compactMode && (
          <section className="app-hero mx-auto mt-8 max-w-3xl text-center sm:mt-10 lg:mt-10 xl:mt-8">
            <BlurReveal
              as="h1"
              className="app-hero-title text-balance text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-5xl xl:text-6xl"
              speedReveal={1.5}
              inView
            >
              Two colors, infinite possibilities.
            </BlurReveal>

            <BlurReveal
              as="p"
              className="app-hero-copy mx-auto mt-3 max-w-lg text-base leading-7 text-muted-foreground lg:mt-2"
              speedReveal={4}
              delay={0.25}
              inView
            >
              Mix two colors and see the result in real time.
            </BlurReveal>
          </section>
        )}

        <section className="actions-row mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <button type="button" onClick={randomizeColors} className="tool-button">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Random
          </button>
          <button type="button" onClick={swapColors} className="tool-button">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Swap
          </button>
          <button type="button" onClick={() => applyMix(defaultMix)} className="tool-button">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button type="button" onClick={() => void copyResult()} className="tool-button">
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy
          </button>
          {shortcutMessage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
              <Check className="h-3 w-3" aria-hidden="true" />
              {shortcutMessage}
            </span>
          )}
        </section>

        <section
          className="mixer-grid mt-6 grid items-center gap-7 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,29rem)_minmax(0,1fr)] lg:gap-8"
          aria-label="Color mixer"
        >
          <ColorPicker
            label="Color A"
            color={color1}
            isActive={activeColor === "color1"}
            onChange={setColor1}
            onSelect={() => setActiveColor("color1")}
          />

          <div className="flex flex-col gap-4">
            <label htmlFor="mix-ratio" className="sr-only">
              Color A mix percentage
            </label>
            <div className="relative pt-4">
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
              <div className="pointer-events-none absolute inset-x-0 top-[1.85rem] h-2">
                {[25, 50, 75].map((mark) => (
                  <span
                    key={mark}
                    className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-foreground/45 shadow-sm"
                    style={{ left: `%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between font-mono text-lg text-foreground">
              <span>{ratio}%</span>
              <span>{color2Ratio}%</span>
            </div>
          </div>

          <ColorPicker
            label="Color B"
            color={color2}
            isActive={activeColor === "color2"}
            onChange={setColor2}
            onSelect={() => setActiveColor("color2")}
          />
        </section>

        <section className="result-section mt-4 sm:mt-5">
          <ColorResult
            color={resultColor}
            colorA={color1}
            colorB={color2}
            ratio={ratio}
            copiedSignal={copiedSignal}
          />
        </section>

        {!compactMode && (
          <section className="details-grid mx-auto mt-5 grid w-full max-w-5xl gap-4 border-t border-border/80 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Tonal scale</h2>
              <div className="mt-3 grid grid-cols-7 overflow-hidden rounded-md border border-border/70">
                {tonalScale.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="h-12 transition hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: color }}
                    title={normalizeHex(color)}
                    aria-label={`Copy tonal color ${normalizeHex(color)}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">Derived palettes</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {palettes.map((palette) => (
                  <div key={palette.type} className="rounded-md border border-border/70 bg-background/50 p-2 backdrop-blur-sm">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">{palette.type}</p>
                    <div className="flex overflow-hidden rounded-sm">
                      {palette.colors.map((color) => (
                        <button
                          key={`${palette.type}-${color}`}
                          type="button"
                          onClick={() => navigator.clipboard.writeText(color)}
                          className="h-10 flex-1 transition hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ backgroundColor: color }}
                          title={normalizeHex(color)}
                          aria-label={`Copy ${palette.type} color ${normalizeHex(color)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="recent-mixes mx-auto mt-5 w-full max-w-4xl border-t border-border/80 pt-4 lg:mt-5">
          <div className="recent-header mb-2 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">Recent mixes</h2>
            <button
              type="button"
              onClick={() => setHistory((items) => items.filter((item) => item.pinned))}
              className="text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              Clear unpinned
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {history.map((item) => (
              <div key={item.createdAt} className="history-item group relative">
                <button
                  type="button"
                  onClick={() => applyMix(item)}
                  className="recent-swatch grid h-10 w-16 grid-cols-3 overflow-hidden rounded-md border border-white/70 shadow-sm ring-offset-background transition duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                  aria-label={`Restore mix ${normalizeHex(item.color1)} plus ${normalizeHex(item.color2)} into ${normalizeHex(item.result)}`}
                >
                  <span style={{ backgroundColor: item.color1 }} />
                  <span style={{ backgroundColor: item.result }} />
                  <span style={{ backgroundColor: item.color2 }} />
                </button>
                {item.pinned && (
                  <Pin className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-foreground text-foreground" aria-hidden="true" />
                )}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <p className="font-mono">{normalizeHex(item.color1)} + {normalizeHex(item.color2)}</p>
                  <p className="mt-1 font-mono text-muted-foreground">
                    {item.ratio}% / {100 - item.ratio}% → {normalizeHex(item.result)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePinned(item)}
                  className="absolute -bottom-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground opacity-0 shadow-sm ring-1 ring-border transition hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={item.pinned ? "Unpin mix" : "Pin mix"}
                >
                  {item.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </button>
              </div>
            ))}
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
          className="app-footer mt-auto flex items-center gap-1 py-3 text-sm text-muted-foreground"
        >
          Made with <img src="/rainbow-heart.png" alt="" className="h-4 w-4" /> by
          <a
            href="https://github.com/thainapires"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            Thainá
          </a>
        </footer>
      </div>
    </main>
  );
};
