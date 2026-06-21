import { Github, Linkedin, Package } from "lucide-react";

const links = [
  {
    platform: "GitHub",
    handle: "jayf0x",
    href: "https://github.com/jayf0x",
    icon: <Github size={14} strokeWidth={1.5} />,
    color: "bg-neutral-500/20 text-neutral-300",
  },
  {
    platform: "LinkedIn",
    handle: "jonatan-verstraete",
    href: "https://www.linkedin.com/in/jonatan-verstraete/",
    icon: <Linkedin size={14} strokeWidth={1.5} />,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    platform: "Bluesky",
    handle: "jayf0x.bsky.social",
    href: "https://bsky.app/profile/jayf0x.bsky.social",
    icon: "🦋",
    color: "bg-sky-500/20 text-sky-400",
  },
  {
    platform: "npm",
    handle: "~jayf0x",
    href: "https://www.npmjs.com/~jayf0x",
    icon: <Package size={14} strokeWidth={1.5} />,
    color: "bg-red-500/20 text-red-400",
  },
  {
    platform: "Chess.com",
    handle: "chaos_70b",
    href: "https://www.chess.com/member/chaos_70b",
    icon: "♟︎",
    color: "bg-green-600/20 text-green-400",
  },
];

export const Contact = () => (
  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
    <div className="px-8 py-6 max-w-lg mx-auto w-full">
      <p className="font-mono text-mini tracking-[0.18em] uppercase mb-5 text-(--muted)/40">
        Find me on
      </p>

      <ul className="flex flex-col gap-2">
        {links.map(({ platform, handle, href, icon, color }) => (
          <li key={platform}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 px-4 py-3.5 rounded-lg border border-(--border)/50 hover:border-(--border) hover:bg-(--overlay-xs) transition-colors duration-150"
            >
              <span
                className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-[13px] ${color}`}
              >
                {icon}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-mono text-[10px] tracking-[0.15em] uppercase mb-0.5 text-(--muted)/40">
                  {platform}
                </span>
                <span className="block font-mono text-[13px] truncate text-(--muted)/80 group-hover:text-(--muted) transition-colors duration-150">
                  {handle}
                </span>
              </span>

              <span className="font-mono text-[10px] text-(--muted)/0 group-hover:text-(--muted)/40 transition-colors duration-150">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
