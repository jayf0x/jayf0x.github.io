import { useCheckpointValue } from "@/hooks/useCheckpoint";
import { FileHeart, Pause, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { useDigitalHeartbeat } from "./useDigitalHeartbeat";
import "./styles.css";

export const Resume = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const showButton = useCheckpointValue("Red Button");

  const { playingRef, speedRef, reset } = useDigitalHeartbeat(containerRef, buttonRef);

  const handlePlayPause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      playingRef.current = !next;
      return next;
    });
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setSpeed(v);
    speedRef.current = v;
  };

  return (
    <div ref={containerRef} className="size-full relative overflow-hidden">
      {/* Download button — positioned by hook at circle center */}
      {showButton && (
        <div
          ref={buttonRef}
          className="absolute pointer-events-auto z-10"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <a
            href="https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/Jonatan-Verstraete-resume-2026.pdf"
            download
            className="no-underline"
            aria-label="Download resume"
          >
            <div
              id="red-button"
              title="Doubt everything. Find your own light. - Buddha"
            >
              <FileHeart size={34} className="m-auto opacity-60" />
            </div>
          </a>
        </div>
      )}

      {/* Text overlay — app typography, no canvas text */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-4 pointer-events-none select-none">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--muted)/30">
            To be, or not to be
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--muted)/30">
            And so it is
          </span>
        </div>
        <p className="text-center font-mono text-[12px] text-(--muted)/25 italic">
          "The question becomes a beat — the beat becomes memory — and memory asks again."
        </p>
      </div>

      {/* Sim controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
        <button
          onClick={handlePlayPause}
          title={isPaused ? "Play" : "Pause"}
          className="sim-ctrl-btn"
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="sim-ctrl-btn sim-ctrl-row">
          <span className="sim-label">Rate</span>
          <input
            type="range"
            min="0.25"
            max="2.5"
            step="0.05"
            value={speed}
            onChange={handleSpeed}
            className="speed-slider"
          />
        </div>
        <button onClick={reset} title="Reset" className="sim-ctrl-btn">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
