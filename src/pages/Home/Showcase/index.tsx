import { useRepos } from "@/hooks/useRepoQueries";
import type { GithubRepo } from "@/utils/fetch-repository";
import { useMemo } from "react";
import { Grid, GridItem } from "weighted-grid/react";
import { Card } from "./Card";
import { CardSkeleton } from "./CardSkeleton";
import { SKELETON_WEIGHTS, weightFor } from "./seed";
import { useGridCols } from "./useGridCols";

const COUNT = 12;

const byNewest = (a: GithubRepo, b: GithubRepo) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const Showcase = () => {
  const { data: repos = [], isLoading } = useRepos();
  const cols = useGridCols();

  // Weight computed once per repo and reused for both the grid slot and the
  // card's own typography tier, instead of re-rolling the seeded PRNG twice.
  const weighted = useMemo(
    () =>
      repos
        .slice()
        .sort(byNewest)
        .slice(0, COUNT)
        .map((repo, index) => ({
          repo,
          index,
          weight: weightFor(repo, index),
        })),
    [repos],
  );

  const itemCount = isLoading ? SKELETON_WEIGHTS.length : weighted.length;
  const rows = Math.max(1, Math.ceil(itemCount / cols));
  const rowHeight = cols <= 2 ? 170 : 210;
  const gap = cols <= 2 ? 12 : 16;

  return (
    <section className="mx-auto w-full max-w-6xl px-8 pb-16">
      <Grid
        cols={cols}
        rows={rows}
        isFillHeight={false}
        rowHeight={rowHeight}
        gap={gap}
      >
        {isLoading
          ? SKELETON_WEIGHTS.map((weight, i) => (
              <GridItem key={i} weight={weight}>
                <CardSkeleton />
              </GridItem>
            ))
          : weighted.map(({ repo, index, weight }) => (
              <GridItem key={repo.id} weight={weight}>
                <Card repo={repo} index={index} weight={weight} />
              </GridItem>
            ))}
      </Grid>
    </section>
  );
};
