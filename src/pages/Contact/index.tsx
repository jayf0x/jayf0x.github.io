import { InfoPopover } from "@/components/InfoPopover";
import type { ConwayControls } from "@/lib/conway/conway";
import { createConwayEngine } from "@/lib/conway/conway";
import { Github, Linkedin, Package, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

type SimMode = "conway" | "daynight";

const links = [
  {
    platform: "GitHub",
    handle: "jayf0x",
    href: "https://github.com/jayf0x",
    icon: <Github size={14} strokeWidth={1.5} />,
    color: "bg-neutral-500/20 text-neutral-300",
  },
  {
    platform: "LinkedIn",
    handle: "jonatan-verstraete",
    href: "https://www.linkedin.com/in/jonatan-verstraete/",
    icon: <Linkedin size={14} strokeWidth={1.5} />,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    platform: "Bluesky",
    handle: "jayf0x.bsky.social",
    href: "https://bsky.app/profile/jayf0x.bsky.social",
    icon: "🦋",
    color: "bg-sky-500/20 text-sky-400",
  },
  {
    platform: "npm",
    handle: "~jayf0x",
    href: "https://www.npmjs.com/~jayf0x",
    icon: <Package size={14} strokeWidth={1.5} />,
    color: "bg-red-500/20 text-red-400",
  },
  {
    platform: "Chess.com",
    handle: "chaos_70b",
    href: "https://www.chess.com/member/chaos_70b",
    icon: "♟️",
    color: "bg-green-600/20 text-green-400",
  },
];

export const Contact = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ConwayControls | null>(null);
  const [simMode, setSimMode] = useState<SimMode>("conway");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createConwayEngine(
      canvasRef.current,
      simMode === "conway",
      {},
    );
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [simMode]);

  const handleModeToggle = (next: SimMode) => {
    if (next === simMode) return;
    setIsPaused(false);
    setSimMode(next);
  };

  const handlePlayPause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      engineRef.current?.setPaused(next);
      return next;
    });
  };

  return (
    <div className="flex-1 relative overflow-hidden min-h-0">
      {/* Scrollable content on top */}
      <div className="relative z-10 h-full overflow-y-auto pointer-events-none">
        <div className="px-8 py-6 max-w-lg mx-auto w-full">
          <p className="font-mono text-mini tracking-[0.18em] uppercase mb-5 text-(--muted)/40">
            Find me on
          </p>

          <ul className="flex flex-col gap-2">
            {links.map(({ platform, handle, href, icon, color }) => (
              <li
                key={platform}
                className=" backdrop-blur-md bg-white/20 rounded-md"
                style={{
                  backdropFilter: "blur(4px) brightness(0.01)",
                }}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto group flex items-center gap-4 px-4 py-3.5 rounded-lg border border-(--border)/50 hover:border-(--border) hover:bg-(--overlay-xs) transition-colors duration-150"
                >
                  <span
                    className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-[13px] ${color}`}
                  >
                    {icon}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-mono text-[10px] tracking-[0.15em] uppercase mb-0.5 text-(--muted)/40">
                      {platform}
                    </span>
                    <span className="block font-mono text-[13px] truncate text-(--muted)/80 group-hover:text-(--muted) transition-colors duration-150">
                      {handle}
                    </span>
                  </span>

                  <span className="font-mono text-[10px] text-(--muted)/0 group-hover:text-(--muted)/40 transition-colors duration-150">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Conway canvas — behind everything, receives cursor interactions */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full block" />

      {/* Sim controls — above canvas, pointer-events isolated */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <div className="sim-mode-toggle">
          <button
            onClick={() => handleModeToggle("conway")}
            className={simMode === "conway" ? "active" : ""}
          >
            Conway
          </button>
          <button
            onClick={() => handleModeToggle("daynight")}
            className={simMode === "daynight" ? "active" : ""}
          >
            Day &amp; Night
          </button>
        </div>
        <button
          onClick={handlePlayPause}
          title={isPaused ? "Play" : "Pause"}
          className="sim-ctrl-btn"
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <InfoPopover
          items={[
            [
              "Playground Golly",
              "https://golly.sourceforge.io/webapp/golly.html",
            ],
            ["✨Inspiration✨", "https://members.tip.net.au/~dbell/"],
          ]}
        />
      </div>
    </div>
  );
};
