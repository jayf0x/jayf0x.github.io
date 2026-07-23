import { InfoPopover } from "@/components/InfoPopover";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import {
  attachDrawInteraction,
  createLife,
  DAY_NIGHT,
  type LifeControls,
} from "conways-life";
import { Github, Linkedin, Package, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SimMode = "conway" | "daynight";

const COLORS_CONWAY = [
  "var(--c-0f1950)",
  "var(--c-193282)",
  "var(--c-2d5fb9)",
  "var(--c-55afff)",
  "var(--c-4196eb)",
  "var(--c-3073c8)",
  "var(--c-2250a5)",
  "var(--c-163a8c)",
  "var(--c-0e266e)",
];

const COLORS_DAYNIGHT = [
  "var(--text)",
  "var(--c-ffd796)",
  "var(--c-ffb446)",
  "var(--amber)",
  "var(--c-da5a08)",
  "var(--c-b93704)",
  "var(--c-961c02)",
  "var(--c-730a01)",
  "var(--c-4e0301)",
];

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
  const engineRef = useRef<LifeControls | null>(null);
  const [simMode, setSimMode] = useState<SimMode>("conway");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const isConway = simMode === "conway";
    const engine = createLife(canvasRef.current, {
      rule: isConway ? undefined : DAY_NIGHT,
      colors: isConway ? COLORS_CONWAY : COLORS_DAYNIGHT,
    });
    const detach = attachDrawInteraction(canvasRef.current, engine);
    engineRef.current = engine;
    return () => {
      detach();
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
    <DefaultLayout>
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Scrollable content on top */}
      <div className="relative z-10 h-full overflow-y-auto pointer-events-none">
        <div className="px-8 py-6 max-w-lg mx-auto w-full">
          <p className="font-mono text-mini tracking-[0.18em] uppercase mb-5 text-(--muted)/40">
            Find me on
          </p>

          <ul className="flex flex-col gap-3">
            {links.map(({ platform, handle, href, icon, color }) => (
              <li
                key={platform}
                className="rounded-md bg-[#111e]"
                style={{
                  backdropFilter: "blur(4px)",
                }}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto group flex items-center gap-4 px-4 py-3.5 rounded-md border border-white/10 bg-white/5 dark:bg-black/30 hover:border-white/20 hover:bg-white/10 transition-colors duration-150"
                >
                  <span
                    className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-[13px] ${color} ring-1 ring-white/6`}
                  >
                    {icon}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-mono text-[10px] tracking-[0.15em] uppercase mb-0.5 text-neutral-400">
                      {platform}
                    </span>
                    <span className="block font-mono text-[13px] truncate text-white/90 group-hover:text-white transition-colors duration-150">
                      {handle}
                    </span>
                  </span>

                  <span className="font-mono text-[10px] text-white/40 group-hover:text-white/70 transition-colors duration-150">
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
        <div className="flex rounded-md border border-white/10 bg-white/5 dark:bg-black/30 backdrop-blur-md overflow-hidden">
          <button
            onClick={() => handleModeToggle("conway")}
            className={`px-3 py-1 text-xs font-mono text-white/70 hover:text-white/90 transition-colors ${
              simMode === "conway" ? "bg-white/10 text-white/90" : ""
            }`}
          >
            Conway
          </button>
          <button
            onClick={() => handleModeToggle("daynight")}
            className={`px-3 py-1 text-xs font-mono text-white/70 hover:text-white/90 transition-colors ${
              simMode === "daynight" ? "bg-white/10 text-white/90" : ""
            }`}
          >
            Day &amp; Night
          </button>
        </div>

        <button
          onClick={handlePlayPause}
          title={isPaused ? "Play" : "Pause"}
          className="w-8 h-8 rounded-md border border-white/10 bg-white/5 dark:bg-black/30 text-white/70 flex items-center justify-center hover:text-white/90 hover:bg-[#1E2337]/70 transition-colors"
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
    </DefaultLayout>
  );
};
