import { OWNER } from "@/config";
import {
  fetchLatestDmgUrl,
  fetchNpmPackages,
  fetchPreviewUrl,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Github,
  Globe,
  Package,
} from "lucide-react";
import { findNpmUrl } from "./ProjectsSearch/types";

const COUNT = 8;

const byNewest = (a: GithubRepo, b: GithubRepo) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const Showcase = () => {
  const { data: repos = [], isLoading } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });

  const picks = repos.slice().sort(byNewest).slice(0, COUNT);

  return (
    <section className="mx-auto w-full max-w-6xl px-8 pb-16">
      {/* Two-column gallery — square tiles stack down both sides. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: COUNT }).map((_, i) => <TileSkeleton key={i} />)
          : picks.map((repo, i) => <Tile key={repo.id} repo={repo} index={i} />)}
      </div>
    </section>
  );
};

const Tile = ({ repo, index }: { repo: GithubRepo; index: number }) => {
  const { data: previewUrl } = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () => fetchPreviewUrl(OWNER, repo.name),
  });
  const npmUrl = useQuery<Record<string, string>, Error, string | undefined>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
    gcTime: Infinity,
    select: (pkgs) => findNpmUrl(pkgs, repo.name),
  }).data;
  const dmgUrl = useQuery<string | null>({
    queryKey: ["repo-dmg", repo.name],
    queryFn: () => fetchLatestDmgUrl(OWNER, repo.name),
    staleTime: Infinity,
    gcTime: Infinity,
  }).data;

  const raw = repo.language ? getStackMeta(repo.language).bg : "";
  const tint = raw && raw !== "transparent" ? raw : "var(--accent)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative isolate flex aspect-square flex-col justify-between overflow-hidden rounded-[calc(var(--r-card)+4px)] border border-border/70 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_30px_80px_-24px_rgba(0,0,0,0.8)]"
      style={{
        background: `
          radial-gradient(130% 120% at 100% 0%, color-mix(in oklab, ${tint} 30%, transparent) 0%, transparent 52%),
          radial-gradient(120% 120% at 0% 100%, color-mix(in oklab, ${tint} 14%, transparent) 0%, transparent 60%),
          linear-gradient(150deg, color-mix(in oklab, ${tint} 10%, var(--surface)) 0%, var(--surface) 55%)`,
      }}
    >
      {/* Screenshot as texture, top area, fading down */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 w-full object-cover opacity-20 mix-blend-luminosity transition-all duration-500 group-hover:opacity-35"
          style={{
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />
      )}
      {/* fine grain / vignette for depth */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />

      {/* top row: language + arrow */}
      <div className="relative z-10 flex items-start justify-between">
        {repo.language && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-(--bg)/30 px-3 py-1 font-mono text-nano text-(--overlay-a100) backdrop-blur-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: tint }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-(--bg)/30 text-(--muted) backdrop-blur-sm transition-all duration-300 group-hover:border-(--accent)/50 group-hover:text-(--accent)">
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>

      {/* bottom: name, description, links */}
      <div className="relative z-10">
        {/* stretched link — whole tile opens homepage or repo */}
        <a
          href={repo.homepage || repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="after:absolute after:inset-0 after:z-0 after:content-['']"
        >
          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-text md:text-3xl">
            {repo.name}
          </h3>
        </a>

        {repo.description && (
          <p className="mt-2.5 max-w-[92%] text-sm leading-relaxed text-(--overlay-a100) line-clamp-3">
            {repo.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2">
          {npmUrl && (
            <TileLink href={npmUrl} label="npm">
              <Package size={15} />
            </TileLink>
          )}
          {repo.homepage && (
            <TileLink href={repo.homepage} label="Website">
              <Globe size={15} />
            </TileLink>
          )}
          {dmgUrl && (
            <TileLink href={dmgUrl} label="Download">
              <Download size={15} />
            </TileLink>
          )}
          <TileLink href={repo.html_url} label="Source">
            <Github size={15} />
          </TileLink>
        </div>
      </div>
    </motion.article>
  );
};

const TileLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-(--bg)/40 text-(--overlay-a100) backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent)/50 hover:bg-(--accent)/10 hover:text-(--accent)"
  >
    {children}
  </a>
);

const TileSkeleton = () => (
  <div className="aspect-square animate-pulse rounded-[calc(var(--r-card)+4px)] border border-border/40 bg-(--surface)/50" />
);
