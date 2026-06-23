import { useIsMobile } from "@/hooks/useDevice";
import type { CircuitPhase } from "@/lib/circuit";

type Fragment = { phase: CircuitPhase; n: number; text: string };

// Each line maps to a phase of the pulse; the matching canvas zone is labelled
// with the same [n]. The fragment lights up as the pulse passes its zone.
const FRAGMENTS: Fragment[] = [
  { phase: "question", n: 1, text: "The question becomes a pulse" },
  { phase: "memory", n: 2, text: "the pulse becomes memory" },
  { phase: "loop", n: 3, text: "and memory asks again" },
];

const Chip = ({ frag, lit }: { frag: Fragment; lit: boolean }) => (
  <span
    className="font-mono text-[13px] font-semibold italic px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all duration-300 select-none"
    style={{
      color: lit ? "var(--accent)" : "rgba(255,255,255,0.85)",
      borderColor: lit ? "var(--accent)" : "var(--border)",
      background: lit ? "var(--accent-dim)" : "var(--bg-a60)",
      backdropFilter: "blur(8px)",
      boxShadow: lit
        ? "0 0 18px color-mix(in srgb, var(--accent) 40%, transparent), 0 4px 12px var(--bg-a60)"
        : "0 4px 12px var(--bg-a45)",
    }}
  >
    <span className="not-italic opacity-50">[{frag.n}]</span> {frag.text}
  </span>
);

export const Quote = ({ active }: { active: CircuitPhase | null }) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`absolute top-[4%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 pointer-events-none ${
        isMobile ? "flex-col" : "flex-row"
      }`}
    >
      {FRAGMENTS.map((frag) => (
        <Chip key={frag.n} frag={frag} lit={active === frag.phase} />
      ))}
    </div>
  );
};
