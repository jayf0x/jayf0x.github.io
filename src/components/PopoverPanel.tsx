import "@/styles/info-popover.css";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Glass popover surface with the animated gradient-snake border.
// Shared by InfoPopover and any other rich popover content.
export const PopoverPanel = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    className="relative p-[1.5px] rounded-2xl"
    style={{
      background: "var(--accent-dim)",
      boxShadow: "0 24px 64px var(--bg-a65), 0 0 0 1px var(--overlay-xs) inset",
    }}
  >
    <div className="ip-snake" aria-hidden />
    <div
      className={`relative z-10 backdrop-blur-[28px] backdrop-saturate-200 rounded-[14.5px] overflow-hidden bg-(--glass) ${className}`}
    >
      {children}
    </div>
  </motion.div>
);
