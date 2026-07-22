import { findNpmUrl, type GithubRepo } from "@/utils/fetch-repository";

// Facets are derived boolean properties of a repo (does it ship an npm package,
// does it have a website, …). They live in the same filter set as language/topic
// tags but are resolved through a predicate instead of string equality, so the
// search stays scalable: add a new facet here and it becomes searchable, a
// clickable chip, and a shareable ?tag= value with no other changes.
export type FacetContext = { npmPackages: Record<string, string> };

export type Facet = {
  /** canonical id used in the filter set and ?tag= url param (lowercase) */
  name: string;
  predicate: (repo: GithubRepo, ctx: FacetContext) => boolean;
};

export const FACETS: readonly Facet[] = [
  { name: "npm", predicate: (r, ctx) => Boolean(findNpmUrl(ctx.npmPackages, r.name)) },
  { name: "website", predicate: (r) => Boolean(r.homepage) },
];

export const facetByName = (name: string): Facet | undefined =>
  FACETS.find((f) => f.name === name.toLowerCase());
