import { DOWNLOAD_RESUME_LINKS } from "@/config";
import { AnimatePresence, motion } from "framer-motion";
import { FileHeart } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { FactionCard } from "./FactionCard";

export const DownloadButton = forwardRef<
  HTMLButtonElement,
  { isMobile: boolean }
>(({ isMobile }, ref) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = () => {
    cancelClose();
    setOpen(false);
  };
  // Grace period so moving the cursor button → popover doesn't close it.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 130);
  };

  // Close when interacting outside the button+popover (covers mobile tap-away).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Hover opens on desktop; closing is handled by hover-out / outside / pick.
  const hoverProps = isMobile
    ? {}
    : {
        onMouseEnter: () => {
          cancelClose();
          setOpen(true);
        },
        onMouseLeave: scheduleClose,
      };

  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col items-center"
      {...hoverProps}
    >
      <div className="group/btn relative flex items-center justify-center">
        {/* Breathing halo — soft pulse behind the orb. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute size-20 rounded-full blur-md"
          style={{
            background:
              "radial-gradient(circle, var(--c-ff3737-a65) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0.8, 0.45] }}
          transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
        />

        <button
          ref={ref}
          type="button"
          aria-label="Download resume"
          aria-expanded={open}
          // Open-only: clicking while already hovered must never close it.
          onClick={() => setOpen(true)}
          style={{
            background:
              "radial-gradient(circle at 36% 32%, var(--c-ff9090) 0%, var(--c-e00000) 48%, var(--c-7a0000) 100%)",
            boxShadow:
              "0 0 28px var(--c-ff3737-a65), 0 8px 24px var(--bg-a60), inset 0 3px 7px var(--c-ffbebe-a45), inset 0 -3px 5px var(--bg-a45)",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
          }}
          className="group relative size-20 overflow-hidden rounded-full flex justify-center items-center hover:scale-[1.1] active:scale-[0.91]"
        >
          {/* Slow rotating conic sheen — liquid-metal shimmer. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.5) 60deg, transparent 140deg, transparent 360deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
          />

          {/* Periodic shine streak that sweeps across, faster on hover. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-y-3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
            animate={{ x: ["-220%", "420%"] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
              repeatDelay: 2.4,
            }}
          />

          {/* Glossy specular cap. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1.5 h-4 w-9 -translate-x-1/2 rounded-full bg-white/35 blur-[3px]"
          />

          {/* Heart icon with a subtle double-beat. */}
          <motion.span
            className="relative z-10 flex"
            animate={{ scale: [1, 1.16, 1, 1.1, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              times: [0, 0.12, 0.24, 0.36, 0.5],
              repeatDelay: 0.9,
            }}
          >
            <FileHeart
              size={32}
              className="opacity-70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-1/2 z-30 mt-3 -translate-x-1/2"
          >
            {/* hover bridge across the gap so it counts as "inside" */}
            <div className="absolute -top-3 inset-x-0 h-3" />

            <div className="rounded-2xl border border-white/10 bg-black/55 px-3 pb-3 pt-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
              <p className="mb-2 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-white/45 select-none whitespace-nowrap">
                // choose format
              </p>
              <div className="flex items-stretch gap-2">
                {DOWNLOAD_RESUME_LINKS.map((item, i) => (
                  <FactionCard
                    key={item.label}
                    {...item}
                    index={i}
                    onPick={close}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DownloadButton.displayName = "DownloadButton";
