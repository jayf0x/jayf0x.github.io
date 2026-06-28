import { useEffect, useMemo, useRef, useState } from "react";
import type { FlowEvents, FlowPhase } from "./useLoop";

const CLEAR_MS = 520;

// Bridges the animation's imperative phase events to React state.
//   active — phase currently lit; auto-clears after CLEAR_MS
//   cycles — completed loops (increments on each "learning" firing, the last stage)
export function useFlowPhase() {
  const [active, setActive] = useState<FlowPhase | null>(null);
  const [cycles, setCycles] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const events = useMemo<FlowEvents>(
    () => ({
      onPhase: (phase) => {
        if (phase === "learning") setCycles((c) => c + 1);
        setActive(phase);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setActive(null), CLEAR_MS);
      },
    }),
    [],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { active, cycles, events };
}
