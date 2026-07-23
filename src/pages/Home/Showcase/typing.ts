import { GithubRepo } from "@/utils/fetch-repository";
import { GridItemProps } from "weighted-grid/react";

interface TileRepo extends GridItemProps {
  repo: GithubRepo;
  index?: never;
}
interface TileEmpty extends GridItemProps {
  index: number;
  repo?: never;
}

type Tile = TileEmpty | TileRepo;

export type { Tile, TileEmpty, TileRepo };
