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

// Widened, uneven pool — the extra 4 lets a non-newest repo occasionally
// bloom into a second big tile, so the grid never reads as one hero + a wall
// of uniform small cards.
const WEIGHT_POOL = [1, 1, 2, 2, 3, 3, 4] as const;
export const FEATURE_WEIGHT = 6;

export type SizeTier = "hero" | "standard" | "compact";

/** Stable per-repo grid weight. The newest repo (index 0) always leads as
 * the feature tile; everything else rolls from a seeded pool keyed on its
 * GitHub id. */
export const weightFor = (repo: GithubRepo, index: number): number =>
  index === 0
    ? FEATURE_WEIGHT
    : WEIGHT_POOL[Math.floor(mulberry32(repo.id)() * WEIGHT_POOL.length)];

// Threshold at 4 (not 6) so a seeded standout reads as a proper hero tile —
// big media, room for three lines of description — not just a large standard.
export const tierForWeight = (weight: number): SizeTier =>
  weight >= 4 ? "hero" : weight >= 2 ? "standard" : "compact";

// Fixed skeleton sizes so the loading grid already hints at the mosaic
// rhythm instead of a uniform wall of placeholders.
export const SKELETON_WEIGHTS = [6, 2, 3, 1, 4, 2, 3, 1, 2, 3] as const;

// Void tiles are woven in at these card-sequence positions (desktop only) to
// carve breathing room into the mosaic — negative space is a design element,
// not wasted area. Positions are golden-ish, not evenly spaced, so the gaps
// feel placed rather than looped.
export const VOID_AFTER: ReadonlyArray<{ after: number; weight: number }> = [
  { after: 2, weight: 2 },
  { after: 6, weight: 1 },
  { after: 9, weight: 2 },
];
