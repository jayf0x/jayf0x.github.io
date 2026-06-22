import { Pause, Play, RotateCcw } from "lucide-react";
import { FileHeart } from "lucide-react";
import { useRef, useState } from "react";
import { useDigitalHeartbeat } from "./useDigitalHeartbeat";
import "./styles.css";

export const Resume = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { playingRef, speedRef, reset } = useDigitalHeartbeat(
    containerRef,
    buttonRef as React.RefObject<HTMLElement>,
    labelRef as React.RefObject<HTMLElement>,
  );

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
      {/* Download button — centered on circuit circle by hook */}
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
            <FileHeart size={32} className="m-auto opacity-60" />
          </div>
        </a>
      </div>

      {/* "download cv" label — positioned below the circle by hook */}
      <p
        ref={labelRef}
        className="absolute pointer-events-none z-10 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 whitespace-nowrap select-none"
        style={{ transform: "translateX(-50%)" }}
      >
        download cv
      </p>

      {/* Quote — above circuit, centered */}
      <p className="absolute top-3 left-1/2 -translate-x-1/2 z-10 font-mono text-[13px] text-white/65 italic whitespace-nowrap select-none pointer-events-none">
        "The question becomes a beat — the beat becomes memory — and memory asks again."
      </p>

      {/* Sim controls — bottom left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20 pointer-events-auto">
        <button onClick={handlePlayPause} title={isPaused ? "Play" : "Pause"} className="sim-ctrl-btn">
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="sim-ctrl-btn sim-ctrl-row">
          <span className="sim-label">Rate</span>
          <input
            type="range" min="0.25" max="2.5" step="0.05"
            value={speed} onChange={handleSpeed}
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
