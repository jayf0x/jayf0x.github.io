import { type CheckpointItem } from "@/store/checkPointStore";

export const OWNER = "jayf0x";
export const CACHE_INVALIDATION_TIME = 2 * 60 * 60 * 1000;
export const RESUME_DOWNLOAD_URL =
  "https://raw.githubusercontent.com/jayf0x/jayf0x/main/assets/Jonatan-Verstraete-resume-2026.pdf";

export const allCheckpointItems = [
  { tag: "Ads", percentage: 80 },
  { tag: "🐔🥚", percentage: 60 },
  { tag: "Red Button", percentage: 30 },
  // { tag: "Conway", percentage: 20 },
  { tag: "Void", percentage: 0, invert: true },
] satisfies CheckpointItem[];

export const allWidgetNames = ["chat", "info"] as const;

export type CheckPointTag = (typeof allCheckpointItems)[number]["tag"];
export type WidgetName = (typeof allWidgetNames)[number];
