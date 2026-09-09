import { Pipette } from "lucide-react";
import { useId, useRef } from "react";
import { getReadableTextColor, normalizeHex } from "@/lib/color";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ label, color, onChange }: ColorPickerProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const textColor = getReadableTextColor(color);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        type="color"
        value={color}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
        aria-label={`Choose ${label}`}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="color-swatch group relative flex min-h-44 w-full overflow-hidden rounded-lg p-6 lg:p-5 text-left shadow-[var(--shadow-swatch)] outline-none transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:min-h-44 lg:min-h-36 xl:min-h-40"
        style={{ backgroundColor: color, color: textColor }}
        aria-label={`Change ${label}, currently ${normalizeHex(color)}`}
      >
        <span className="relative z-10 flex flex-col gap-1">
          <span className="text-sm font-semibold">{label}</span>
          <span className="font-mono text-lg">{normalizeHex(color)}</span>
        </span>
        <span
          className="color-swatch-icon absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-current backdrop-blur-sm transition duration-300 group-hover:bg-white/25"
          aria-hidden="true"
        >
          <Pipette className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
};
