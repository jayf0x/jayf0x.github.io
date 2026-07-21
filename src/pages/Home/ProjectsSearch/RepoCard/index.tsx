import { OWNER } from "@/config";
import {
  fetchNpmPackages,
  fetchPreviewUrl,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { findNpmUrl } from "../types";
import { RepoInfo } from "./RepoInfo";
import { RepoLinks } from "./RepoLinks";

export const RepoCard = ({
  repo,
  onTagClick,
}: {
  repo: GithubRepo;
  onTagClick?: (name: string) => void;
}) => {
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

  // On mobile there's no hover, so a tap toggles the dimmed/readable state.
  const [tapped, setTapped] = useState(false);

  const bg = repo.language ? getStackMeta(repo.language).bg : "transparent";
  const accentColor = bg !== "transparent" ? bg : null;

  return (
    <article
      className="group/card relative flex items-start gap-3 rounded-lg border border-border/80 border-l-2 bg-(--surface)/90 overflow-hidden px-4 py-4 transition-all duration-200 hover:border-border hover:bg-(--surface-2)/80 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
      onClick={() => setTapped((v) => !v)}
    >
      {previewUrl && (
        <>
          {/* Preview image: always full-height, slight blur; dims to 0.8 on
              hover (desktop) or tap (mobile) so the text stays readable. */}
          <img
            src={previewUrl}
            alt=""
            aria-hidden
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-right blur-[2px] transition-opacity duration-200 group-hover/card:opacity-80 ${
              tapped ? "opacity-80" : "opacity-100"
            }`}
          />
          {/* Full-height gradient so the left side never leaks the image. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-(--surface) from-35% to-transparent to-[65%]" />
        </>
      )}

      <div className="relative z-10 min-w-0 flex-1 flex items-start gap-3">
        <RepoInfo
          repo={repo}
          languages={repo.language ? [repo.language] : []}
          onTagClick={onTagClick}
        />
        <RepoLinks
          repo={repo}
          npmUrl={npmUrl}
          hasPreview={Boolean(previewUrl)}
        />
      </div>
    </article>
  );
};
