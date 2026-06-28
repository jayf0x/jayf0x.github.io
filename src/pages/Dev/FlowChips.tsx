import type { FlowPhase } from "./useLoop";

const CHIPS = [
  { phase: "friction"      as FlowPhase, n: 1, text: "Friction"       },
  { phase: "focus"         as FlowPhase, n: 2, text: "Focus"          },
  { phase: "understanding" as FlowPhase, n: 3, text: "Understanding"  },
  { phase: "learning"      as FlowPhase, n: 4, text: "learning"       },
] as const;

// Per-phase RGB strings matching useLoop.ts
const COL: Record<FlowPhase, string> = {
  friction:      "255,148,52",
  focus:         "46,208,255",
  understanding: "172,72,255",
  learning:      "88,228,118",
};

const Chip = ({
  phase,
  n,
  text,
  lit,
}: {
  phase: FlowPhase;
  n: number;
  text: string;
  lit: boolean;
}) => {
  const col = COL[phase];
  return (
    <span
      className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap transition-all duration-300 select-none"
      style={{
        color:       lit ? `rgb(${col})`          : "rgba(255,255,255,0.45)",
        borderColor: lit ? `rgba(${col},0.45)`    : "rgba(255,255,255,0.08)",
        background:  lit ? `rgba(${col},0.10)`    : "rgba(0,0,0,0.25)",
        boxShadow:   lit ? `0 0 12px rgba(${col},0.28)` : "none",
      }}
    >
      <span className="opacity-35">[{n}]</span>{" "}{text}
    </span>
  );
};

export const FlowChips = ({ active }: { active: FlowPhase | null }) => (
  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 pointer-events-none flex-wrap justify-center">
    {CHIPS.map((c) => (
      <Chip key={c.n} {...c} lit={active === c.phase} />
    ))}
  </div>
);
