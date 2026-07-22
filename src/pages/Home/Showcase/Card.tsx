import {
  useNpmUrl,
  useRepoDmgUrl,
  useRepoGif,
  useRepoLanguages,
  useRepoPreview,
} from "@/hooks/useRepoQueries";
import type { GithubRepo } from "@/utils/fetch-repository";
import { motion } from "framer-motion";
import { memo } from "react";
import { CardLinks } from "./CardLinks";
import { CardMedia } from "./CardMedia";
import { tierForWeight } from "./seed";
import { StackBar } from "./StackBar";

const TITLE_CLASS = {
  hero: "text-3xl md:text-4xl",
  standard: "text-xl",
  compact: "text-base",
};

const DESC_CLAMP = {
  hero: "line-clamp-3",
  standard: "line-clamp-2",
  compact: "line-clamp-1",
};

const PADDING = {
  hero: "p-6",
  standard: "p-5",
  compact: "p-4",
};

export const Card = memo(
  ({
    repo,
    index,
    weight,
  }: {
    repo: GithubRepo;
    index: number;
    weight: number;
  }) => {
    const previewUrl = useRepoPreview(repo.name);
    const gifUrl = useRepoGif(repo.name);
    const languages = useRepoLanguages(repo.name);
    const npmUrl = useNpmUrl(repo.name);
    const dmgUrl = useRepoDmgUrl(repo.name);

    const tier = tierForWeight(weight);

    return (
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.55,
          delay: Math.min(index, 7) * 0.045,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="group relative isolate flex h-full w-full flex-col justify-end overflow-hidden rounded-[calc(var(--r-card)+2px)] border border-white/12 bg-(--surface) shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,3px_3px_0_-1px_rgba(0,0,0,0.5),10px_16px_30px_-14px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,6px_7px_0_0_var(--accent),20px_28px_54px_-12px_var(--accent-a45)]"
      >
        <CardMedia
          previewUrl={previewUrl}
          gifUrl={gifUrl}
          language={repo.language}
          eager={index === 0}
        />

        {/* legibility scrim + one breath of accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/68 to-black/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-45 transition-opacity duration-500 group-hover:opacity-75"
          style={{
            background:
              "radial-gradient(110% 90% at 84% 2%, color-mix(in oklab, var(--accent) 34%, transparent) 0%, transparent 54%)",
          }}
        />
        {/* faint grain for tactile depth, not a flat scrim */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

        <StackBar languages={languages} />

        <div className={`relative z-10 ${PADDING[tier]}`}>
          <a
            href={repo.homepage || repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            <h3
              className={`font-display font-semibold leading-tight tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.7)] ${TITLE_CLASS[tier]}`}
            >
              {repo.name}
            </h3>
          </a>

          {repo.description && (
            <p
              className={`mt-2 max-w-[82%] text-sm leading-relaxed text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] ${DESC_CLAMP[tier]}`}
            >
              {repo.description}
            </p>
          )}

          <CardLinks
            npmUrl={npmUrl}
            homepage={repo.homepage}
            dmgUrl={dmgUrl}
            htmlUrl={repo.html_url}
            tier={tier}
          />
        </div>
      </motion.article>
    );
  },
);
Card.displayName = "Card";
