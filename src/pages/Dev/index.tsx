import { DefaultLayout } from "@/layouts/DefaultLayout";
import { useRef } from "react";
import { FlowChips } from "./FlowChips";
import { useFlowPhase } from "./useFlowPhase";
import { useLoop } from "./useLoop";

export const DevPage = () => {
  const { active, cycles, events } = useFlowPhase();
  const containerRef = useRef<HTMLDivElement>(null);
  useLoop(containerRef, events);

  return (
    <DefaultLayout>
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden">
        <FlowChips active={active} />
        <p className="absolute bottom-4 right-5 font-mono text-[10px] tabular-nums tracking-[0.22em] text-white/20 pointer-events-none select-none">
          ↻ {String(cycles).padStart(4, "0")}
        </p>
      </div>
    </DefaultLayout>
  );
};
