import { useMemo } from "react";
import type { GithubRepo } from "@/utils/fetch-repository";
import {
  FACETS,
  facetByName,
  type FacetContext,
} from "@/pages/Home/ProjectsSearch/facets";

export type FilterItem = { name: string; count: number };

const TOP_N = 10;

function matches(repo: GithubRepo, q: string, ctx: FacetContext): boolean {
  const lower = q.toLowerCase();
  // Searching a facet name (e.g. "npm") surfaces every repo with that property.
  const facet = facetByName(lower);
  if (facet?.predicate(repo, ctx)) return true;
  return (
    repo.name.toLowerCase().includes(lower) ||
    (repo.description?.toLowerCase().includes(lower) ?? false) ||
    repo.topics.some((t) => t.toLowerCase().includes(lower)) ||
    (repo.language?.toLowerCase().includes(lower) ?? false)
  );
}

function matchesFilter(repo: GithubRepo, f: string, ctx: FacetContext): boolean {
  const facet = facetByName(f);
  if (facet) return facet.predicate(repo, ctx);
  return (
    repo.language?.toLowerCase() === f ||
    repo.topics.some((t) => t.toLowerCase() === f)
  );
}

export function useRepoSearch(
  repos: GithubRepo[],
  query: string,
  filters: Set<string>,
  ctx: FacetContext,
) {
  const allFilters = useMemo((): FilterItem[] => {
    const counts = new Map<string, number>();
    for (const repo of repos) {
      if (repo.language) {
        const k = repo.language.toLowerCase();
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      for (const t of repo.topics) {
        const k = t.toLowerCase();
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name, count]) => ({ name, count }));
  }, [repos]);

  // Facet chips (NPM, Website, …) shown alongside tag filters; only the ones
  // that actually match at least one repo.
  const facetFilters = useMemo(
    (): FilterItem[] =>
      FACETS.map((f) => ({
        name: f.name,
        count: repos.filter((r) => f.predicate(r, ctx)).length,
      })).filter((f) => f.count > 0),
    [repos, ctx],
  );

  const results = useMemo(() => {
    const hasQuery = query.trim().length > 0;
    const hasFilters = filters.size > 0;
    if (!hasQuery && !hasFilters) return [];

    return repos.filter((repo) => {
      const queryMatch = hasQuery ? matches(repo, query.trim(), ctx) : true;
      const filterMatch = hasFilters
        ? [...filters].some((f) => matchesFilter(repo, f, ctx))
        : true;
      return queryMatch && filterMatch;
    });
  }, [repos, query, filters, ctx]);

  return { results, allFilters, facetFilters };
}
