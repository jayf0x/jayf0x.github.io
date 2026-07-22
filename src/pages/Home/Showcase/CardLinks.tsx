import { memo } from "react";
import type { IconType } from "react-icons";
import { FiDownloadCloud, FiExternalLink } from "react-icons/fi";
import { SiGithub, SiNpm } from "react-icons/si";
import type { SizeTier } from "./seed";

export const CardLinks = memo(
  ({
    npmUrl,
    homepage,
    dmgUrl,
    htmlUrl,
    tier,
  }: {
    npmUrl: string | undefined;
    homepage: string | null;
    dmgUrl: string | null | undefined;
    htmlUrl: string;
    tier: SizeTier;
  }) => (
    <div className="mt-4 flex items-center gap-2">
      {npmUrl && <LinkIcon href={npmUrl} label="npm" Icon={SiNpm} tier={tier} brand="#cb3837" />}
      {homepage && (
        <LinkIcon href={homepage} label="Website" Icon={FiExternalLink} tier={tier} />
      )}
      {dmgUrl && (
        <LinkIcon href={dmgUrl} label="Download" Icon={FiDownloadCloud} tier={tier} />
      )}
      <LinkIcon href={htmlUrl} label="Source" Icon={SiGithub} tier={tier} />
    </div>
  ),
);
CardLinks.displayName = "CardLinks";

const SIZE_CLASS: Record<SizeTier, string> = {
  hero: "h-10 w-10",
  standard: "h-9 w-9",
  compact: "h-8 w-8",
};

const LinkIcon = ({
  href,
  label,
  Icon,
  brand,
  tier,
}: {
  href: string;
  label: string;
  Icon: IconType;
  brand?: string;
  tier: SizeTier;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className={`group/link relative z-10 flex items-center justify-center rounded-full border border-white/12 bg-black/45 text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-px hover:border-(--accent)/60 hover:bg-(--accent)/15 hover:text-white ${SIZE_CLASS[tier]}`}
    style={brand ? ({ ["--brand" as string]: brand } as React.CSSProperties) : undefined}
  >
    <Icon
      size={tier === "compact" ? 13 : 15}
      className={brand ? "group-hover/link:text-[var(--brand)]" : undefined}
    />
  </a>
);
