import { memo } from "react";
import type { IconType } from "react-icons";
import { FiArrowUpRight, FiDownload } from "react-icons/fi";
import { SiGithub, SiNpm } from "react-icons/si";

// Quiet, left-aligned utility row. The card body is the primary link (whole
// surface is clickable); these are secondary, so they stay small and low-key
// and only warm to the accent on hover.
export const CardLinks = memo(
  ({
    npmUrl,
    homepage,
    dmgUrl,
    htmlUrl,
  }: {
    npmUrl: string | undefined;
    homepage: string | null;
    dmgUrl: string | null | undefined;
    htmlUrl: string;
  }) => (
    <div className="mt-5 flex items-center gap-3.5">
      <LinkIcon href={htmlUrl} label="Source" Icon={SiGithub} />
      {homepage && <LinkIcon href={homepage} label="Live site" Icon={FiArrowUpRight} />}
      {npmUrl && <LinkIcon href={npmUrl} label="npm" Icon={SiNpm} />}
      {dmgUrl && <LinkIcon href={dmgUrl} label="Download" Icon={FiDownload} />}
    </div>
  ),
);
CardLinks.displayName = "CardLinks";

const LinkIcon = ({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: IconType;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className="relative z-10 flex items-center text-white/50 transition-colors duration-200 ease-out hover:text-(--accent)"
  >
    <Icon size={16} />
  </a>
);
