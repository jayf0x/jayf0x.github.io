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
// import { tierForWeight } from "./seed";
import { StackBar } from "./StackBar";

const TITLE_CLASS = {
  hero: "text-2xl md:text-3xl",
  standard: "text-xl",
  compact: "text-lg",
};

const DESC_CLAMP = {
  hero: "line-clamp-3",
  standard: "line-clamp-2",
  compact: "line-clamp-2",
};

const PADDING = {
  hero: "p-7",
  standard: "p-6",
  compact: "p-5",
};

export const Card = memo(
  ({
    repo,
    index,
    // weight,
  }: {
    repo: GithubRepo;
    index: number;
    // weight: number;
  }) => {
    const previewUrl = useRepoPreview(repo.name);
    const gifUrl = useRepoGif(repo.name);
    const languages = useRepoLanguages(repo.name);
    const npmUrl = useNpmUrl(repo.name);
    const dmgUrl = useRepoDmgUrl(repo.name);

    // const tier = tierForWeight(weight);

    const tier = "standard";

    return (
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration: 0.7,
          delay: Math.min(index, 7) * 0.06,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="group relative isolate flex h-full w-full flex-col justify-end overflow-hidden rounded-[10px] bg-(--surface) shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]"
      >
        <CardMedia
          previewUrl={previewUrl}
          gifUrl={gifUrl}
          language={repo.language}
          eager={index === 0}
        />

        {/* legibility scrim, weighted toward the text foot of the card */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
        {/* one quiet breath of accent from the top corner (opacity only) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-35 transition-opacity duration-500 ease-out group-hover:opacity-60"
          style={{
            background:
              "radial-gradient(120% 90% at 85% 0%, color-mix(in oklab, var(--accent) 26%, transparent) 0%, transparent 55%)",
          }}
        />
        {/* animated accent snake — revealed only on hover */}
        <span
          className="ip-snake opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          aria-hidden
        />

        <StackBar languages={languages} />

        <div className={`relative z-10 ${PADDING[tier]}`}>
          <a
            href={repo.homepage || repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            <h3
              className={`font-display font-semibold leading-[1.1] tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] ${TITLE_CLASS[tier]}`}
            >
              {repo.name}
            </h3>
          </a>

          {repo.description && (
            <p
              className={`mt-2.5 max-w-[46ch] text-[0.8125rem] leading-relaxed text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)] ${DESC_CLAMP[tier]}`}
            >
              {repo.description}
            </p>
          )}

          <CardLinks
            npmUrl={npmUrl}
            homepage={repo.homepage}
            dmgUrl={dmgUrl}
            htmlUrl={repo.html_url}
          />
        </div>
      </motion.article>
    );
  },
);
Card.displayName = "Card";
