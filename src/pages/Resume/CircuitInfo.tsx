import { Popover } from "@/lib/popover";
import { motion } from "framer-motion";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import { useState } from "react";

const SOURCE_QUOTE = "Doubt everything. Find your own light. — Buddha";

const POEM = [
  "The question becomes a pulse,",
  "the pulse becomes memory,",
  "and memory asks again.",
];

// Pre-filled Claude conversation explaining the piece.
const ASK_CLAUDE = `https://claude.ai/new?q=${encodeURIComponent(
  `This animated SR-latch circuit on a portfolio carries the line "${POEM.join(
    " ",
  )}" — a riff on the Buddha quote "${SOURCE_QUOTE}". Explain how the circuit (a question computed at an XOR, stored as a bit in the latch, fed back to ask itself again) mirrors the quote about doubting and self-inquiry.`,
)}`;

// Minimal schematic: question → memory → loop back. Mirrors the live circuit.
const Sketch = () => (
  <svg viewBox="0 0 200 70" className="w-full h-auto" aria-hidden>
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
      opacity={0.55}
      textAnchor="middle"
    >
      <text x={92} y={48}>question</text>
      <text x={143} y={48}>memory</text>
      <text x={100} y={68}>loop</text>
    </g>
  </svg>
);

const Content = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    className="relative p-[1.5px] rounded-2xl"
    style={{
      background: "var(--accent-dim)",
      boxShadow: "0 24px 64px var(--bg-a65), 0 0 0 1px var(--overlay-xs) inset",
    }}
  >
    <div className="relative z-10 w-[260px] backdrop-blur-[28px] backdrop-saturate-200 rounded-[14.5px] overflow-hidden bg-(--glass) p-4">
      <Sketch />

      <p className="mt-3 font-mono text-[12px] italic leading-relaxed text-white/70">
        {POEM.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
        after {SOURCE_QUOTE}
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
    </div>
  </motion.div>
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
            isOpen ? "text-accent bg-accent-dim" : "text-(--accent)/50 hover:text-(--accent)/80"
          }`}
        >
          <HelpCircle size={16} strokeWidth={1.8} />
        </button>
      </Popover>
    </div>
  );
};
