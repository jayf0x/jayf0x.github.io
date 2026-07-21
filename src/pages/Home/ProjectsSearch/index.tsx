import { AnimatePresence, motion } from "framer-motion";
import { PackageSearch, Search, X } from "lucide-react";
import { ActiveChips } from "./ActiveChips";
import { FilterRow } from "./FilterRow";
import { useProjectSearch } from "./hooks/useProjectSearch";
import { RepoCard } from "./RepoCard";
import { Sidebar } from "./Sidebar";

const spring = { type: "spring" as const, stiffness: 500, damping: 40 };
const springGentle = { type: "spring" as const, stiffness: 320, damping: 32 };

export const ProjectSection = () => {
  const {
    query,
    setQuery,
    filters,
    toggleFilter,
    sort,
    applySort,
    inputRef,
    isLoading,
    allFilters,
    facetFilters,
    displayResults,
    hasActiveFilters,
    hasInput,
    clearQuery,
    clearFilters,
    clearAll,
  } = useProjectSearch();

  return (
    <section className="flex flex-col px-8 pt-6 pb-4">
      <div className="mx-auto max-w-6xl flex flex-row gap-6 w-full items-start">
        <Sidebar onSelect={setQuery} onSort={applySort} />

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Search bar — sticks to top while browsing so it's always reachable */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springGentle}
            className="relative sticky top-0 z-20 py-2 bg-(--surface)/75 backdrop-blur-md"
          >
            <Search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, languages, topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-border/70 bg-(--bg)/50 py-3 pl-11 pr-24 text-sm text-text placeholder:text-(--muted) outline-none transition-all duration-150 focus:border-(--accent)/60 focus:shadow-[0_0_0_3px_var(--accent-glow)]"
            />
            <div className="absolute right-3 top-0 h-full flex items-center gap-2">
              <AnimatePresence mode="popLayout">
                {hasInput || sort ? (
                  <motion.div
                    key="meta"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-micro text-(--muted) tabular-nums">
                      {displayResults.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear all"
                      onClick={clearAll}
                      className="text-(--muted) hover:text-(--accent) transition-colors duration-100 p-0.5 rounded"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="pointer-events-none"
                  >
                    <kbd className="font-mono text-nano border border-border rounded px-1 py-0.5 text-(--muted) leading-none">
                      /
                    </kbd>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Filter row */}
          <AnimatePresence>
            {!isLoading && (allFilters.length > 0 || facetFilters.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ...springGentle, delay: 0.06 }}
                className="overflow-hidden"
              >
                <FilterRow
                  items={[...facetFilters, ...allFilters]}
                  filters={filters}
                  onToggle={toggleFilter}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active chips */}
          <AnimatePresence>
            {hasInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springGentle}
                className="overflow-hidden"
              >
                <ActiveChips
                  query={query}
                  filters={filters}
                  onClearQuery={clearQuery}
                  onRemoveFilter={toggleFilter}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="space-y-2 pr-0.5 pt-0.5">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {hasInput && displayResults.length === 0 && (
                  <motion.div
                    key="empty-no-results"
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={springGentle}
                  >
                    <EmptyNoResults onClear={clearAll} />
                  </motion.div>
                )}

                {displayResults.map((repo, i) => (
                  <motion.div
                    key={`repo-card-${repo.id}`}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                    transition={{ ...spring, delay: i * 0.02 }}
                  >
                    <RepoCard repo={repo} onTagClick={toggleFilter} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const EmptyNoResults = ({ onClear }: { onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--muted)">
    <PackageSearch size={48} className="opacity-20" />
    <div className="text-center">
      <p className="font-mono text-sm">No matches</p>
      <button
        type="button"
        onClick={onClear}
        className="font-mono text-micro opacity-60 mt-1 hover:text-(--accent) hover:opacity-100 transition-colors"
      >
        clear filters
      </button>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-1.5">
    {[56, 72, 48, 64, 80].map((h, i) => (
      <div
        key={`skeleton-${i}`}
        className="rounded-lg border border-border/40 bg-(--surface)/60 overflow-hidden"
        style={{ height: h }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.8s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      </div>
    ))}
  </div>
);
