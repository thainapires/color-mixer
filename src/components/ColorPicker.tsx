import { Pipette } from "lucide-react";
import { useId, useRef } from "react";
import { getReadableTextColor, normalizeHex } from "@/lib/color";

interface ColorPickerProps {
  label: string;
  color: string;
  isActive: boolean;
  onChange: (color: string) => void;
  onSelect: () => void;
}

export const ColorPicker = ({
  label,
  color,
  isActive,
  onChange,
  onSelect,
}: ColorPickerProps) => {
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
        onClick={() => {
          onSelect();
          inputRef.current?.click();
        }}
        onFocus={onSelect}
        className="color-swatch group relative flex min-h-44 w-full overflow-hidden rounded-lg p-6 text-left shadow-[var(--shadow-swatch)] outline-none transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background data-[active=true]:ring-2 data-[active=true]:ring-ring data-[active=true]:ring-offset-4 data-[active=true]:ring-offset-background lg:min-h-36 lg:p-5 xl:min-h-40"
        style={{ backgroundColor: color, color: textColor }}
        data-active={isActive}
        aria-label={`Change ${label}, currently ${normalizeHex(color)}. Paste a HEX value while selected to replace it.`}
      >
        <span className="relative z-10 flex flex-col gap-1">
          <span className="text-sm font-semibold">{label}</span>
          <span className="font-mono text-lg">{normalizeHex(color)}</span>
          {isActive && (
            <span className="mt-2 text-xs font-medium opacity-75">Paste HEX</span>
          )}
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
