import { OWNER } from "@/config";
import {
  fetchNpmPackages,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;
const MONTH = 30 * 24 * 60 * 60 * 1000;

export const Hero = () => {
  const { data: repos = [] } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });
  const { data: npmPackages } = useQuery<Record<string, string>>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
  });

  const count = repos.length;
  const npmCount = npmPackages ? Object.keys(npmPackages).length : 0;
  const shipped = repos.filter(
    (r) => Date.now() - new Date(r.pushed_at).getTime() < MONTH,
  ).length;

  return (
    <section className="relative mx-auto w-full max-w-6xl px-8 pt-16 pb-10">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="mb-6 font-mono text-nano uppercase tracking-[0.35em] text-(--muted)"
      >
        Jonatan Verstraete — Engineering, Gent
      </motion.p>

      <h1 className="font-display font-semibold leading-[0.86] tracking-[-0.03em] text-text">
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="block text-[clamp(3.5rem,11vw,9rem)]"
        >
          Resolving
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease }}
          className="block pl-[0.04em] text-[clamp(3.5rem,11vw,9rem)] italic text-(--accent)"
        >
          friction.
        </motion.span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease }}
        className="mt-8 max-w-xl text-lg leading-relaxed text-(--overlay-a100)"
      >
        I build focused software that removes it — libraries, extensions and
        tools that do one thing well. A working index of the work below.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.35 }}
        className="mt-6 flex items-center gap-6 font-mono text-nano text-(--muted)"
      >
        <span className="tabular-nums">
          <span className="text-text">{count || "—"}</span> repositories
        </span>
        <span className="h-3 w-px bg-(--border)" />
        <span className="tabular-nums">
          <span className="text-text">{npmCount || "—"}</span> npm packages
        </span>
        <span className="h-3 w-px bg-(--border)" />
        <span className="tabular-nums">
          <span className="text-text">{shipped || "—"}</span> shipped this month
        </span>
      </motion.div>
    </section>
  );
};
