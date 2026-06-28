import { OWNER } from "@/config";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import {
  fetchNpmPackages,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { type SortKey } from "../types";

const EMPTY_PKGS: Record<string, string> = {};

// tag param is a comma-separated list so multiple active filters round-trip.
const parseTags = (tag?: string): Set<string> =>
  new Set(
    (tag ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  );

export function useProjectSearch() {
  const navigate = useNavigate();
  const { tag, q } = useSearch({ strict: false }) as {
    tag?: string;
    q?: string;
  };

  // Filters are derived from the URL (?tag=) — single source of truth.
  const filters = useMemo(() => parseTags(tag), [tag]);

  // Query is local for instant typing; debounced into the URL (?q=) below.
  const [query, setQueryRaw] = useState(q ?? "");
  const [sort, setSort] = useState<SortKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: repos = [], isLoading } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });

  const { data: npmPackages = EMPTY_PKGS } = useQuery<Record<string, string>>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const facetCtx = useMemo(() => ({ npmPackages }), [npmPackages]);
  const { results, allFilters, facetFilters } = useRepoSearch(
    repos,
    query,
    filters,
    facetCtx,
  );

  const setTagParam = (next: Set<string>) =>
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        tag: next.size ? [...next].join(",") : undefined,
      }),
      replace: true,
    });

  // Debounce query → URL so sharing/back-forward works without thrashing history.
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = query.trim();
      navigate({
        to: ".",
        search: (prev) => ({ ...prev, q: trimmed || undefined }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [query, navigate]);

  const hasQuery = query.trim().length > 0;
  const hasActiveFilters = filters.size > 0;
  const hasInput = hasQuery || hasActiveFilters;

  const displayResults = hasInput
    ? results
    : repos.slice().sort((a, b) => {
        // no input → browse all, default to recent activity
        if (sort === "name") return a.name.localeCompare(b.name);
        const key = (sort ?? "pushed_at") as "created_at" | "pushed_at";
        return new Date(b[key]).getTime() - new Date(a[key]).getTime();
      });

  const setQuery = (value: string) => {
    setSort(null);
    setQueryRaw(value);
  };

  const toggleFilter = (value: string) => {
    setSort(null);
    const v = value.toLowerCase();
    const next = new Set(filters);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next.has(v) ? next.delete(v) : next.add(v);
    setTagParam(next);
  };

  const applySort = (key: SortKey) => {
    setSort(key);
    setQueryRaw("");
    setTagParam(new Set());
  };

  const clearQuery = () => {
    setQueryRaw("");
    inputRef.current?.focus();
  };

  const clearFilters = () => setTagParam(new Set());

  const clearAll = () => {
    setQueryRaw("");
    setSort(null);
    setTagParam(new Set());
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return {
    query,
    setQuery,
    filters,
    toggleFilter,
    clearFilters,
    sort,
    applySort,
    inputRef,
    isLoading,
    allFilters,
    facetFilters,
    displayResults,
    hasQuery,
    hasActiveFilters,
    hasInput,
    clearQuery,
    clearAll,
  };
}
