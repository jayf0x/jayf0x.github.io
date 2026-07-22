import type { GithubRepo } from "@/utils/fetch-repository";

// Deterministic PRNG (mulberry32) seeded by the repo's own GitHub id, so a
// given repo always rolls the same "size" — the mosaic looks hand-curated
// and never reshuffles itself between reloads or re-renders.
const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// Weighted pool, skewed toward small/medium tiles with occasional standouts —
// an all-equal grid reads as a spreadsheet, not a showcase.
const WEIGHT_POOL = [1, 1, 1, 2, 2, 3] as const;
export const FEATURE_WEIGHT = 4;

export type SizeTier = "hero" | "standard" | "compact";

/** Stable per-repo grid weight. The newest repo (index 0) always leads as
 * the feature tile; everything else rolls from a seeded pool keyed on its
 * GitHub id. */
export const weightFor = (repo: GithubRepo, index: number): number =>
  index === 0
    ? FEATURE_WEIGHT
    : WEIGHT_POOL[Math.floor(mulberry32(repo.id)() * WEIGHT_POOL.length)];

export const tierForWeight = (weight: number): SizeTier =>
  weight >= FEATURE_WEIGHT ? "hero" : weight >= 2 ? "standard" : "compact";

// Fixed skeleton sizes so the loading grid already hints at the mosaic
// rhythm instead of a uniform wall of placeholders.
export const SKELETON_WEIGHTS = [4, 1, 2, 1, 3, 1, 2, 1, 1, 2] as const;
