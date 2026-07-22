import { OWNER } from "@/config";
import {
  fetchLanguages,
  fetchLatestDmgUrl,
  fetchNpmPackages,
  fetchPreviewGifUrl,
  fetchPreviewUrl,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { languageColor } from "@/utils/language-color";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiDownloadCloud, FiExternalLink } from "react-icons/fi";
import { SiGithub, SiNpm } from "react-icons/si";
import { StackIcon } from "@/components/StackIcon";
import { findNpmUrl } from "./ProjectsSearch/types";

const COUNT = 12;

type Shape = "feature" | "wide" | "tall" | "box" | "std";

// Every shape stays at least 2 rows tall AND (on desktop) ≥2 cols wide, so a
// description always fits. Mobile collapses to a 2-col grid where each card is
// full width with varied height — a readable vertical rhythm.
const SHAPE_CLASS: Record<Shape, string> = {
  feature: "col-span-2 row-span-3 sm:col-span-3 sm:row-span-3",
  wide: "col-span-2 row-span-2 sm:col-span-4 sm:row-span-2",
  tall: "col-span-2 row-span-3 sm:col-span-2 sm:row-span-3",
  box: "col-span-2 row-span-2 sm:col-span-3 sm:row-span-2",
  std: "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2",
};

// Curated, balanced sequence (not a raw hash) so widths keep filling the 6-col
// rows and tall cards never clump. Newest repo (index 0) always leads as the
// feature. 2× feature / 2× wide / 2× tall / 3× box / 3× std across 12 tiles.
const SHAPE_ORDER: Shape[] = [
  "feature",
  "std",
  "tall",
  "box",
  "wide",
  "std",
  "box",
  "feature",
  "tall",
  "std",
  "wide",
  "box",
];

const shapeFor = (index: number): Shape =>
  SHAPE_ORDER[index % SHAPE_ORDER.length];

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
      <div
        className="grid auto-rows-[5.6rem] grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4"
        style={{ gridAutoFlow: "dense" }}
      >
        {isLoading
          ? SHAPE_ORDER.slice(0, 8).map((shape, i) => (
              <TileSkeleton key={i} shape={shape} />
            ))
          : picks.map((repo, i) => (
              <Tile key={repo.id} repo={repo} index={i} shape={shapeFor(i)} />
            ))}
      </div>
    </section>
  );
};

const Tile = ({
  repo,
  index,
  shape,
}: {
  repo: GithubRepo;
  index: number;
  shape: Shape;
}) => {
  const { data: previewUrl } = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () => fetchPreviewUrl(OWNER, repo.name),
  });
  const { data: gifUrl } = useQuery<string | null>({
    queryKey: ["repo-gif", repo.name],
    queryFn: () => fetchPreviewGifUrl(OWNER, repo.name),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const { data: languages = {} } = useQuery<Record<string, number>>({
    queryKey: ["repo-languages", repo.name],
    queryFn: () => fetchLanguages(OWNER, repo.name),
    staleTime: Infinity,
    gcTime: Infinity,
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

  const big = shape === "feature";

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index, 7) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-[calc(var(--r-card)+2px)] border border-white/12 bg-(--surface) transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1.5 shadow-[3px_3px_0_-1px_rgba(0,0,0,0.5),10px_16px_30px_-14px_rgba(0,0,0,0.7)] hover:shadow-[6px_7px_0_0_var(--accent),20px_28px_54px_-12px_var(--accent-a45)] ${SHAPE_CLASS[shape]}`}
    >
      {/* IMAGE — grayscale, lightly-blurred cover fills; sharp contained on top */}
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-[3px] grayscale brightness-75 transition-[opacity,filter] duration-500 group-hover:opacity-55 group-hover:grayscale-[0.4]"
          />
          <img
            src={previewUrl}
            alt=""
            aria-hidden
            className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-85 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
          {gifUrl && (
            <img
              src={gifUrl}
              alt=""
              aria-hidden
              loading="lazy"
              className="img-contain-mask pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </>
      ) : (
        repo.language && (
          <StackIcon
            language={repo.language}
            className="pointer-events-none absolute -bottom-6 -right-6 text-[13rem] text-white/[0.04] transition-transform duration-500 group-hover:scale-110"
          />
        )
      )}

      {/* legibility scrim + one breath of accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/68 to-black/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-500 group-hover:opacity-75"
        style={{
          background:
            "radial-gradient(110% 90% at 84% 2%, color-mix(in oklab, var(--accent) 34%, transparent) 0%, transparent 54%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

      {/* vertical language stack — the only stack indicator (no pill) */}
      <StackBar languages={languages} />

      {/* content */}
      <div className="relative z-10 p-5">
        <a
          href={repo.homepage || repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="after:absolute after:inset-0 after:z-0 after:content-['']"
        >
          <h3
            className={`font-display font-semibold leading-tight tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] ${
              big ? "text-3xl md:text-4xl" : "text-xl"
            }`}
          >
            {repo.name}
          </h3>
        </a>

        {repo.description && (
          <p
            className={`mt-2 max-w-[82%] text-sm leading-relaxed text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] ${
              big ? "line-clamp-3" : "line-clamp-2"
            }`}
          >
            {repo.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
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

// Vertical, right-edge language stack. Segment heights = share of bytes.
// Colours carry meaning (linguist palette); labels + icons reveal on hover.
const StackBar = ({ languages }: { languages: Record<string, number> }) => {
  const entries = Object.entries(languages);
  if (entries.length === 0) return null;
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="absolute right-3 top-5 z-20 flex items-start gap-2">
      {/* labels, revealed on card hover */}
      <ul className="mt-0.5 flex translate-x-1 flex-col items-end gap-1 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        {top.map(([lang, bytes]) => (
          <li
            key={lang}
            className="flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-nano text-white/85 backdrop-blur-sm"
          >
            <span className="tabular-nums text-white/55">
              {Math.round((bytes / total) * 100)}%
            </span>
            {lang}
            <StackIcon
              language={lang}
              className="text-[11px]"
              style={{ color: languageColor(lang) }}
            />
          </li>
        ))}
      </ul>

      {/* the vertical bar */}
      <div className="flex h-20 w-1 flex-col overflow-hidden rounded-full bg-white/12 transition-[width] duration-300 group-hover:w-1.5">
        {top.map(([lang, bytes]) => (
          <span
            key={lang}
            title={`${lang} · ${Math.round((bytes / total) * 100)}%`}
            style={{
              height: `${(bytes / total) * 100}%`,
              background: languageColor(lang),
            }}
          />
        ))}
      </div>
    </div>
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

const TileSkeleton = ({ shape }: { shape: Shape }) => (
  <div
    className={`animate-pulse rounded-[calc(var(--r-card)+2px)] border border-white/10 bg-(--surface)/60 ${SHAPE_CLASS[shape]}`}
  />
);
