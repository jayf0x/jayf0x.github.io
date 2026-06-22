import { OWNER } from "@/config";
import {
  fetchFlagshipSlugs,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Star } from "lucide-react";

const MIN = 3; // top up from top-starred repos if README links fewer
const OMIT = new Set(["pod-tooling"]); // hardcoded exclusions

function selectPicks(repos: GithubRepo[], slugs: string[]): GithubRepo[] {
  const bySlug = new Map(repos.map((r) => [r.name, r]));
  const picks = slugs
    .filter((s) => !OMIT.has(s))
    .map((s) => bySlug.get(s))
    .filter((r): r is GithubRepo => !!r);

  if (picks.length < MIN) {
    const have = new Set(picks.map((r) => r.id));
    const topup = repos
      .filter((r) => !have.has(r.id) && !OMIT.has(r.name))
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, MIN - picks.length);
    picks.push(...topup);
  }
  return picks;
}

export const Flagship = () => {
  const { data: repos = [] } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });
  const { data: slugs, isPending } = useQuery<string[]>({
    queryKey: ["flagship-slugs", OWNER],
    queryFn: () => fetchFlagshipSlugs(OWNER),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  const picks = selectPicks(repos, slugs ?? []);
  const loading = isPending || (repos.length > 0 && picks.length === 0);

  return (
    <section className="px-6 pb-8 max-w-3xl mx-auto">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--border)">
        {loading
          ? Array.from({ length: MIN }).map((_, i) => (
              <FlagshipSkeleton key={`fsk-${i}`} />
            ))
          : picks.map((repo, i) => (
              <FlagshipCard key={`flagship-${repo.id}`} repo={repo} index={i} />
            ))}
      </div>
    </section>
  );
};

const FlagshipCard = ({ repo, index }: { repo: GithubRepo; index: number }) => {
  const accent = repo.language ? getStackMeta(repo.language).bg : "var(--accent)";
  const href = repo.homepage || repo.html_url;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 + index * 0.07 }}
      className="group relative flex flex-col gap-2 rounded-xl border border-border/70 bg-(--surface)/70 p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent)/40 hover:bg-(--surface-2)/80 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)] snap-start shrink-0 w-[240px]"
    >
      {/* top accent bar, tinted by language */}
      <span
        className="absolute inset-x-0 top-0 h-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: accent !== "transparent" ? accent : "var(--accent)" }}
      />

      <div className="flex items-center justify-between">
        <span className="font-mono text-nano text-(--muted)/50 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ArrowUpRight
          size={15}
          className="text-(--muted)/40 group-hover:text-(--accent) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150"
        />
      </div>

      <h3 className="text-base font-semibold text-text tracking-tight leading-tight">
        {repo.name}
      </h3>

      {repo.description && (
        <p className="text-xs leading-relaxed text-(--overlay-a100) line-clamp-3 flex-1">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1 font-mono text-nano text-(--muted)/70">
        {repo.language && (
          <span className="inline-flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: accent !== "transparent" ? accent : "var(--muted)" }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="inline-flex items-center gap-0.5 tabular-nums">
            <Star size={9} /> {repo.stargazers_count}
          </span>
        )}
        <Github size={11} className="ml-auto opacity-60" />
      </div>
    </motion.a>
  );
};

const FlagshipSkeleton = () => (
  <div className="rounded-xl border border-border/40 bg-(--surface)/40 p-4 h-36 w-[240px] shrink-0 snap-start animate-pulse" />
);
