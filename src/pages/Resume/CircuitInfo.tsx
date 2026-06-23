import { PopoverPanel } from "@/components/PopoverPanel";
import { Popover } from "@/lib/popover";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import { useState } from "react";

const POEM = [
  "The question becomes a pulse,",
  "the pulse becomes memory,",
  "and memory asks again.",
];

// Pre-filled Claude conversation. Gives the structure + quote + a disclaimer,
// then asks for Claude's own reading rather than a textbook definition.
const ASK_CLAUDE = `https://claude.ai/new?q=${encodeURIComponent(
  `On my portfolio there's an animated digital logic circuit captioned with this line:

"${POEM.join("\n")}"

The circuit is a loop:
  input → XOR gate → orbiting pulse → SR latch (stores one bit) → feedback wires back into the XOR → repeat

So: a question is computed at the XOR, the result becomes a travelling pulse, the pulse is latched as a stored bit (memory), and that stored bit feeds back to shape the next computation.

This is an artistic metaphor, not a technically rigorous claim about how SR latches behave.

What do you make of the relationship between the line and the circuit? I'd rather hear your own reading than an explanation of what an SR latch is.`,
)}`;

// Minimal schematic mirroring the live circuit, with the numbered zones.
const Sketch = () => (
  <svg viewBox="0 0 200 74" className="w-full h-auto" aria-hidden>
    <g
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
    >
      <path d="M10 25 H40" />
      <path d="M40 18 L58 25 L40 32 Z" />
      <circle cx={92} cy={25} r={11} />
      <path d="M58 25 H81" />
      <path d="M103 25 H130" />
      <rect x={130} y={15} width={26} height={20} rx={3} />
      <path d="M156 25 H180 V58 H20 V32" />
    </g>
    <g
      fill="var(--accent)"
      fontSize={7}
      fontFamily="ui-monospace, monospace"
      opacity={0.6}
      textAnchor="middle"
    >
      <text x={49} y={48}>[1] question</text>
      <text x={143} y={48}>[2] memory</text>
      <text x={100} y={70}>[3] loop</text>
    </g>
  </svg>
);

const Content = () => (
  <PopoverPanel className="w-[260px] p-4">
    <Sketch />

    <p className="mt-3 font-mono text-[12px] italic leading-relaxed text-white/70">
      {POEM.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>

    <a
      href={ASK_CLAUDE}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-[11.5px] text-white/60 transition-colors duration-150 hover:text-white bg-(--overlay-xs) hover:bg-(--accent-dim)"
    >
      <span>Ask Claude what it means</span>
      <ArrowUpRight size={12} className="shrink-0 text-(--accent)/60" />
    </a>
  </PopoverPanel>
);

export const CircuitInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
      <Popover
        trigger="click"
        onOpenChange={setIsOpen}
        padding={8}
        content={isOpen ? <Content /> : null}
      >
        <button
          type="button"
          aria-label="What does this mean?"
          className={`flex items-center justify-center rounded-full size-7 transition-all duration-200 ${
            isOpen
              ? "text-accent bg-accent-dim"
              : "text-(--accent)/50 hover:text-(--accent)/80"
          }`}
        >
          <HelpCircle size={16} strokeWidth={1.8} />
        </button>
      </Popover>
    </div>
  );
};
