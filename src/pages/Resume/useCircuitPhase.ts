import type { CircuitEvents, CircuitPhase } from "@/lib/circuit";
import { useEffect, useMemo, useRef, useState } from "react";

const CLEAR_MS = 450;

// Bridges the circuit's imperative phase events to React state:
//   active — the phase currently lit (auto-clears shortly after firing)
//   cycles — completed loops, incremented on each "loop" event
export function useCircuitPhase() {
  const [active, setActive] = useState<CircuitPhase | null>(null);
  const [cycles, setCycles] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const events = useMemo<CircuitEvents>(
    () => ({
      onPhase: (phase) => {
        setActive(phase);
        if (phase === "loop") setCycles((c) => c + 1);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setActive(null), CLEAR_MS);
      },
    }),
    [],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { active, cycles, events };
}
