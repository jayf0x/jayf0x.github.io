import { type CheckpointItem } from "@/store/checkPointStore";

export const OWNER = "jayf0x";
export const CACHE_INVALIDATION_TIME = 2 * 60 * 60 * 1000;
export const RESUME_DOWNLOAD_URL_PDF =
  "https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/Jonatan-Verstraete-resume-2026.pdf";

const _dlPrefix = `https://raw.githubusercontent.com/${OWNER}/${OWNER}/main/assets`;
export const DOWNLOAD_RESUME_LINKS = [
  {
    label: "PDF",
    link: `${_dlPrefix}/Jonatan-Verstraete-resume-2026.pdf`,
    icon: "/images/file-pdf.png",
  },
  {
    label: "MD",
    link: `${_dlPrefix}/resume-jv-2026.md`,
    icon: "/images/file-markdown.png",
  },
  {
    label: "HTML",
    link: `${_dlPrefix}/resume-jv-2026.html`,
    icon: "/images/file-html.png",
  },
];
export const allCheckpointItems = [
  { tag: "Ads", percentage: 80 },
  { tag: "🐔🥚", percentage: 60 },
  // { tag: "Red Button", percentage: 30 },
  // { tag: "Conway", percentage: 20 },
  { tag: "Animated text", percentage: 30 },
  { tag: "Void", percentage: 0, invert: true },
] satisfies CheckpointItem[];

export const allWidgetNames = ["chat", "info"] as const;

export type CheckPointTag = (typeof allCheckpointItems)[number]["tag"];
export type WidgetName = (typeof allWidgetNames)[number];
