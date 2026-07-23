import { useRepos } from "@/hooks/useRepoQueries";
import type { GithubRepo } from "@/utils/fetch-repository";
import { useMemo } from "react";
import { Grid, GridItem } from "weighted-grid/react";
import { Card } from "./Card";
import { CardSkeleton } from "./CardSkeleton";
import { SKELETON_WEIGHTS, VOID_AFTER, weightFor } from "./seed";
import { useGridCols } from "./useGridCols";
import { VoidTile } from "./VoidTile";

const COUNT = 12;

const byNewest = (a: GithubRepo, b: GithubRepo) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

type Tile =
  | {
      kind: "card";
      key: string;
      weight: number;
      repo: GithubRepo;
      index: number;
    }
  | { kind: "void"; key: string; weight: number };

export const Showcase = () => {
  const { data: repos = [], isLoading } = useRepos();
  const cols = useGridCols();
  const withVoids = cols > 2;

  // Build the woven tile list once: repos (newest-first) get a stable seeded
  // weight, and — on desktop — a few void tiles are threaded between them for
  // negative space. Weight is reused for the card's own typography tier.
  const tiles = useMemo<Tile[]>(() => {
    const cards = repos
      .slice()
      .sort(byNewest)
      .slice(0, COUNT)
      .map((repo, index) => ({ repo, index, weight: weightFor(repo, index) }));

    const out: Tile[] = [];
    cards.forEach((c, i) => {
      out.push({ kind: "card", key: String(c.repo.id), ...c });
      if (withVoids) {
        const v = VOID_AFTER.find((x) => x.after === i + 1);
        if (v) out.push({ kind: "void", key: `void-${i}`, weight: v.weight });
      }
    });
    return out;
  }, [repos, withVoids]);

  const itemCount = isLoading ? SKELETON_WEIGHTS.length : tiles.length;
  const rows = Math.max(1, Math.ceil(itemCount / cols));
  const rowHeight = cols <= 2 ? 200 : 268;
  const gap = cols <= 2 ? 14 : 22;

  return (
    <section className="mx-auto w-full max-w-[88rem] px-6 pb-24 md:px-10">
      <Grid
        cols={cols}
        rows={rows}
        isFillHeight={false}
        isAnimated={false}
        rowHeight={rowHeight}
        gap={gap}
      >
        {isLoading
          ? SKELETON_WEIGHTS.map((weight, i) => (
              <GridItem key={i} weight={weight}>
                <CardSkeleton />
              </GridItem>
            ))
          : tiles.map((tile) =>
              tile.kind === "void" ? (
                <GridItem key={tile.key} weight={tile.weight}>
                  <VoidTile />
                </GridItem>
              ) : (
                <GridItem key={tile.key} weight={tile.weight}>
                  <Card
                    repo={tile.repo}
                    index={tile.index}
                    weight={tile.weight}
                  />
                </GridItem>
              ),
            )}
      </Grid>
    </section>
  );
};
