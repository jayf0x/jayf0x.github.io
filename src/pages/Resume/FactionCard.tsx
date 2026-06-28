import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

// Web-3 / faction gradients per file type, keyed by label.
const FACTION_GRADIENT: Record<string, string> = {
  PDF: "linear-gradient(150deg, #ff5f6d 0%, #c1121f 60%, #6a0000 100%)",
  MD: "linear-gradient(150deg, #8b7bff 0%, #4b2bb3 60%, #1d1147 100%)",
  HTML: "linear-gradient(150deg, #ffb347 0%, #ff6a3d 55%, #e52e71 100%)",
};

const spring = { type: "spring" as const, stiffness: 520, damping: 30 };

function useFileExists(link: string) {
  return useQuery({
    queryKey: ["resume-file-exists", link],
    queryFn: async () => {
      try {
        await axios.head(link);
        return true;
      } catch {
        return false;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export const FactionCard = ({
  label,
  link,
  icon,
  index,
  onPick,
}: {
  label: string;
  link: string;
  icon: string;
  index: number;
  onPick: () => void;
}) => {
  // undefined while loading → stay enabled (optimistic); false → locked.
  const { data: exists } = useFileExists(link);
  const locked = exists === false;

  return (
    <motion.a
      href={locked ? undefined : link}
      download={!locked}
      onClick={locked ? (e) => e.preventDefault() : onPick}
      aria-disabled={locked}
      title={locked ? `${label} unavailable` : `Download ${label}`}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ ...spring, delay: index * 0.05 }}
      whileHover={locked ? undefined : { y: -4, scale: 1.06 }}
      whileTap={locked ? undefined : { scale: 0.96 }}
      style={{ background: FACTION_GRADIENT[label] ?? "var(--surface-2)" }}
      className={`group/faction relative flex w-[4.75rem] flex-col items-center gap-1.5 overflow-hidden rounded-xl px-2 pt-3 pb-2 no-underline shadow-[0_6px_18px_rgba(0,0,0,0.5)] ring-1 ring-white/20 ${
        locked ? "pointer-events-none grayscale" : ""
      }`}
    >
      {/* sheen sweep on hover — war-game card flair */}
      {!locked && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover/faction:translate-x-full" />
      )}

      {/* animated faction logo */}
      <motion.img
        src={icon}
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="size-9 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
        animate={locked ? undefined : { y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: index * 0.3 }}
      />

      <span className="font-mono text-xs font-bold uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
        {label}
      </span>

      {locked ? (
        <span className="flex items-center gap-0.5 font-mono text-[8px] uppercase tracking-widest text-white/80">
          <Lock size={8} /> locked
        </span>
      ) : (
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/0 transition-colors duration-150 group-hover/faction:text-white/85">
          select
        </span>
      )}
    </motion.a>
  );
};
