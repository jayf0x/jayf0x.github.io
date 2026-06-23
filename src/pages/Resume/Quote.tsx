import type { CircuitPhase } from "@/lib/circuit";
import { useIsMobile } from "@/hooks/useDevice";

type Fragment = { phase: CircuitPhase; n: number; text: string; pos: string };

// Each line maps to a phase of the pulse and anchors near that zone of the
// circuit. `pos` is the desktop placement; mobile stacks them at the top.
const FRAGMENTS: Fragment[] = [
  { phase: "question", n: 1, text: "The question becomes a pulse", pos: "left-[6%] top-[16%] text-left" },
  { phase: "memory", n: 2, text: "the pulse becomes memory", pos: "right-[6%] top-[28%] text-right" },
  { phase: "loop", n: 3, text: "and memory asks again", pos: "left-1/2 -translate-x-1/2 bottom-[8%] text-center" },
];

const Line = ({ frag, lit }: { frag: Fragment; lit: boolean }) => (
  <span
    className="font-mono text-[13px] italic select-none transition-colors duration-300"
    style={{ color: lit ? "var(--accent)" : "rgba(255,255,255,0.6)" }}
  >
    <span className="not-italic opacity-50">[{frag.n}]</span> {frag.text}
  </span>
);

export const Quote = ({ active }: { active: CircuitPhase | null }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="absolute left-0 top-[4%] z-10 w-full flex flex-col items-center gap-1.5 px-8 pointer-events-none">
        {FRAGMENTS.map((frag) => (
          <Line key={frag.n} frag={frag} lit={active === frag.phase} />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {FRAGMENTS.map((frag) => (
        <div key={frag.n} className={`absolute max-w-[40%] ${frag.pos}`}>
          <Line frag={frag} lit={active === frag.phase} />
        </div>
      ))}
    </div>
  );
};
