import { useIsMobile } from "@/hooks/useDevice";
import { useRepos } from "@/hooks/useRepoQueries";
import type { GithubRepo } from "@/utils/fetch-repository";
import { useMemo } from "react";
import { Grid, GridItem } from "weighted-grid/react";
import { Card } from "./Card";
import { CardSkeleton } from "./CardSkeleton";
import { Tile, TileEmpty } from "./typing";
import { useGridCols } from "./useGridCols";
import { VoidTile } from "./VoidTile";

const emptyTiles: TileEmpty[] = [
  { index: 3, cols: 3, rows: 3 },
  { index: 6, cols: 1, rows: 3 },
  { index: 12, cols: 4, rows: 2 },
];

const weightByIndex = (index: number) => (index === 0 ? 3 : index % 2 || 2);

const byNewest = (a: GithubRepo, b: GithubRepo) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const Showcase = () => {
  const { data: repos = [], isLoading } = useRepos();
  const cols = useGridCols();
  const isMobile = useIsMobile();

  const COUNT = isMobile ? 5 : 12;

  // Build the woven tile list once: repos (newest-first) get a stable weight,
  // and — on desktop — a few blueprint tiles are threaded between them for
  // negative space. Weight is reused for the card's own typography tier.
  const tiles = useMemo<Tile[]>(() => {
    const recentRepos = repos.slice().sort(byNewest).slice(0, COUNT);

    const temp: Tile[] = [];

    recentRepos.forEach((repo, index) => {
      const w = weightByIndex(index);
      temp.push({
        repo,
        weight: w + 4,
        // cols: w + 4,
        rows: w + 2,
      });
    });

    // emptyTiles.forEach((tile, idx) => {
    //   if (tile.index < recentRepos.length) {
    //     temp.splice(tile.index - idx, 1, tile);
    //   }
    // });

    return temp.concat(...emptyTiles).sort((a, b) => {
      const ia = a.index ?? temp.indexOf(a);
      const ib = a.index ?? temp.indexOf(b);

      return ib - ia;
    });

    return temp;
  }, [repos, COUNT]);

  return (
    <section className="mx-auto w-full max-w-352 px-6 pb-24 md:px-10">
      <Grid
        cols={isMobile ? 5 : 12}
        rows={5}
        isFillHeight={false}
        isAnimated={false}
        rowHeight={isMobile ? 50 : 80}
        gap={5}
      >
        {isLoading
          ? [...Array(COUNT)].map((weight, i) => (
              <GridItem key={i} weight={weightByIndex(weight)}>
                <CardSkeleton />
              </GridItem>
            ))
          : tiles.map(({ repo, index, ...args }, idx) => (
              <GridItem key={`tile-${repo ? repo.id : index}`} {...args}>
                {repo ? <Card repo={repo} index={idx} /> : <VoidTile />}
              </GridItem>
            ))}
      </Grid>
    </section>
  );
};
