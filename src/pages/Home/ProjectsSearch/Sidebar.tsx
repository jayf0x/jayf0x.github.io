import { OWNER } from "@/config";
import { useIsMobile } from "@/hooks/useDevice";
import { fetchUserRepos, GithubRepo } from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

const spring = { type: "spring" as const, stiffness: 380, damping: 36 };
const topN = 16;

type SortKey = "created_at" | "pushed_at";

const TABS: { key: SortKey; label: string }[] = [
  { key: "pushed_at", label: "Updated" },
  { key: "created_at", label: "Created" },
];

interface SidebarProps {
  onSelect: (name: string) => void;
  onSort?: (key: SortKey) => void;
}

// Refined recent-projects rail. Sticky on desktop, drawer on mobile.
export const Sidebar = ({ onSelect, onSort }: SidebarProps) => {
  const { data: repos = [], isLoading } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });
  const [tab, setTab] = useState<SortKey>("pushed_at");
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const projects = repos
    .slice()
    .sort((a, b) => new Date(b[tab]).getTime() - new Date(a[tab]).getTime())
    .slice(0, topN);

  const pick = (key: SortKey) => {
    setTab(key);
    onSort?.(key);
  };

  const panel = (onItem: (name: string) => void) => (
    <div className="flex h-full min-h-0 flex-col">
      {/* segmented control */}
      <div className="mb-4 flex rounded-full border border-border/70 bg-(--bg)/40 p-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => pick(t.key)}
              className={`relative flex-1 rounded-full px-3 py-1.5 text-micro font-medium tracking-tight transition-colors duration-150 ${
                active ? "text-text" : "text-(--muted) hover:text-text"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-tab"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-(--surface-2) shadow-sm"
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* list */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 space-y-0.5 overflow-y-auto overflow-x-hidden pb-6 [&::-webkit-scrollbar]:hidden">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="mx-1 h-7 animate-pulse rounded-lg bg-white/5"
                  style={{ opacity: 1 - i * 0.08 }}
                />
              ))
            : projects.map((repo) => (
                <Item
                  key={repo.id}
                  repo={repo}
                  date={repo[tab]}
                  onClick={() => onItem(repo.name)}
                />
              ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    </div>
  );

  if (isMobile) {
    const onItem = (name: string) => {
      onSelect(name);
      setOpen(false);
    };
    return (
      <>
        <button
          type="button"
          aria-label="Recent projects"
          onClick={() => setOpen(true)}
          className="fixed left-3 top-[7rem] z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-(--surface)/90 text-(--muted) shadow-lg backdrop-blur transition-colors hover:text-(--accent)"
        >
          <PanelLeftOpen size={15} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="bd"
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="drawer"
                className="fixed left-0 top-0 bottom-0 z-50 flex w-72 flex-col border-r border-border bg-bg px-4 pb-6 pt-4"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={spring}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mb-3 self-end p-1 text-(--muted) transition-colors hover:text-(--accent)"
                >
                  <ChevronLeft size={18} />
                </button>
                {panel(onItem)}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <aside className="sticky top-2 hidden h-[78vh] w-56 shrink-0 self-start md:block">
      <span className="mb-3 block font-mono text-nano uppercase tracking-widest text-(--muted)">
        Recent
      </span>
      {panel(onSelect)}
    </aside>
  );
};

const Item = ({
  repo,
  date,
  onClick,
}: {
  repo: GithubRepo;
  date: string;
  onClick: () => void;
}) => {
  const raw = repo.language ? getStackMeta(repo.language).bg : "";
  const tint = raw && raw !== "transparent" ? raw : "var(--muted)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors duration-100 hover:bg-(--surface)"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: tint }}
      />
      <span className="min-w-0 flex-1 truncate text-mini text-(--overlay-a100) transition-colors group-hover:text-text">
        {repo.name}
      </span>
      <span className="shrink-0 font-mono text-nano tabular-nums text-(--muted)/60">
        {fmt(date)}
      </span>
    </button>
  );
};

const units: [number, string][] = [
  [31536000, "y"],
  [2592000, "mo"],
  [604800, "w"],
  [86400, "d"],
  [3600, "h"],
  [60, "m"],
];
const fmt = (iso: string) => {
  const ago = (Date.now() - new Date(iso).getTime()) / 1000;
  const found = units.find(([s]) => ago / s >= 1);
  if (!found) return "now";
  return `${Math.floor(ago / found[0])}${found[1]}`;
};
