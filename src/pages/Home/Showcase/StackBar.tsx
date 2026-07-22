import { StackIcon } from "@/components/StackIcon";
import { languageColor } from "@/utils/language-color";
import { memo } from "react";

// Vertical, right-edge language stack. Segment heights = share of bytes.
// Colours carry meaning (linguist palette); labels + icons reveal on hover.
export const StackBar = memo(
  ({ languages }: { languages: Record<string, number> }) => {
    const entries = Object.entries(languages);
    if (entries.length === 0) return null;
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 4);

    return (
      <div className="absolute right-3 top-5 z-20 flex items-start gap-2">
        {/* labels, revealed on card hover */}
        <ul className="mt-0.5 flex translate-x-1 flex-col items-end gap-1 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {top.map(([lang, bytes]) => (
            <li
              key={lang}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-nano text-white/85 backdrop-blur-md"
            >
              <span className="tabular-nums text-white/55">
                {Math.round((bytes / total) * 100)}%
              </span>
              {lang}
              <StackIcon
                language={lang}
                className="text-[11px]"
                style={{ color: languageColor(lang) }}
              />
            </li>
          ))}
        </ul>

        {/* the vertical bar */}
        <div className="flex h-20 w-1 flex-col overflow-hidden rounded-full bg-white/12 shadow-[0_0_0_1px_rgba(0,0,0,0.35)] transition-[width] duration-300 group-hover:w-1.5">
          {top.map(([lang, bytes]) => (
            <span
              key={lang}
              title={`${lang} · ${Math.round((bytes / total) * 100)}%`}
              style={{
                height: `${(bytes / total) * 100}%`,
                background: languageColor(lang),
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);
StackBar.displayName = "StackBar";
