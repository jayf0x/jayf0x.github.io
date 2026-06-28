import { DefaultLayout } from "@/layouts/DefaultLayout";
import { useRef, useState } from "react";
import { captureGif } from "./capture";
import { useFlowPhase } from "./useFlowPhase";
import { useLoop } from "./useLoop";

export const DevPage = () => {
  const { cycles, events } = useFlowPhase();
  const containerRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  useLoop(containerRef, events);

  const onCapture = async () => {
    setCapturing(true);
    try {
      await captureGif();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[capture] failed — is create-gif.py running?", e);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <DefaultLayout>
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden">
        <button
          onClick={onCapture}
          disabled={capturing}
          className="absolute bottom-4 left-5 z-10 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 disabled:opacity-40 transition-colors"
        >
          {capturing ? "capturing…" : "● capture gif"}
        </button>
        <p className="absolute bottom-4 right-5 font-mono text-[10px] tabular-nums tracking-[0.22em] text-white/20 pointer-events-none select-none">
          ↻ {String(cycles).padStart(4, "0")}
        </p>
      </div>
    </DefaultLayout>
  );
};
