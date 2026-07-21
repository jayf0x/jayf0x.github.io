import { OWNER } from "@/config";
import {
  fetchLatestDmgUrl,
  fetchNpmPackages,
  fetchPreviewUrl,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiDownloadCloud, FiExternalLink } from "react-icons/fi";
import { SiGithub, SiNpm } from "react-icons/si";
import { StackIcon } from "@/components/StackIcon";
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative isolate flex aspect-square flex-col justify-end overflow-hidden rounded-[calc(var(--r-card)+2px)] border border-white/12 bg-(--surface) shadow-[3px_3px_0_0_rgba(0,0,0,0.5),6px_6px_0_0_rgba(0,0,0,0.4),9px_9px_0_0_rgba(0,0,0,0.3),12px_12px_24px_-6px_rgba(0,0,0,0.6)]"
    >
      {/* Covering, centered screenshot */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-65 transition-opacity duration-500 group-hover:opacity-80"
        />
      ) : (
        // no screenshot → big ghosted stack glyph so the tile still has presence
        repo.language && (
          <StackIcon
            language={repo.language}
            className="pointer-events-none absolute -bottom-6 -right-6 text-[13rem] text-white/[0.04]"
          />
        )
      )}

      {/* Pro scrim: black for legibility + a single breath of primary */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/25" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(100% 90% at 82% 4%, color-mix(in oklab, var(--accent) 30%, transparent) 0%, transparent 52%)`,
        }}
      />
      {/* top bevel highlight for the raised look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

      {/* language chip, top-left */}
      {repo.language && (
        <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-nano text-white/80 backdrop-blur-md">
          <StackIcon language={repo.language} className="text-[13px]" />
          {repo.language}
        </span>
      )}

      {/* content */}
      <div className="relative z-10 p-6">
        <a
          href={repo.homepage || repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="after:absolute after:inset-0 after:z-0 after:content-['']"
        >
          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {repo.name}
          </h3>
        </a>

        {repo.description && (
          <p className="mt-2 max-w-[92%] text-sm leading-relaxed text-white/70 line-clamp-2 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
            {repo.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2">
          {npmUrl && (
            <TileLink href={npmUrl} label="npm" Icon={SiNpm} brand="#cb3837" />
          )}
          {repo.homepage && (
            <TileLink href={repo.homepage} label="Website" Icon={FiExternalLink} />
          )}
          {dmgUrl && (
            <TileLink href={dmgUrl} label="Download" Icon={FiDownloadCloud} />
          )}
          <TileLink href={repo.html_url} label="Source" Icon={SiGithub} />
        </div>
      </div>
    </motion.article>
  );
};

const TileLink = ({
  href,
  label,
  Icon,
  brand,
}: {
  href: string;
  label: string;
  Icon: IconType;
  brand?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className="group/link relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white/75 backdrop-blur-md transition-colors duration-150 hover:border-(--accent)/60 hover:bg-(--accent)/15 hover:text-white"
    style={brand ? ({ ["--brand" as string]: brand } as React.CSSProperties) : undefined}
  >
    <Icon
      size={15}
      className={brand ? "group-hover/link:text-[var(--brand)]" : undefined}
    />
  </a>
);

const TileSkeleton = () => (
  <div className="aspect-square animate-pulse rounded-[calc(var(--r-card)+2px)] border border-white/10 bg-(--surface)/60" />
);
