import { OWNER } from "@/config";
import {
  fetchLanguages,
  fetchLatestDmgUrl,
  fetchNpmPackages,
  fetchPreviewGifUrl,
  fetchPreviewUrl,
  fetchUserRepos,
  findNpmUrl,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";

// One definition per query key so `Showcase` and `ProjectsSearch` can never
// drift into two different keys (or two different fetchers) for the same data.
const FOREVER = { staleTime: Infinity, gcTime: Infinity } as const;

export const useRepos = () =>
  useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });

export const useNpmPackages = () =>
  useQuery<Record<string, string>>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    ...FOREVER,
  });

export const useNpmUrl = (repoName: string) =>
  useQuery<Record<string, string>, Error, string | undefined>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    ...FOREVER,
    select: (pkgs) => findNpmUrl(pkgs, repoName),
  }).data;

export const useRepoPreview = (repoName: string) =>
  useQuery<string | null>({
    queryKey: ["repo-preview", repoName],
    queryFn: () => fetchPreviewUrl(OWNER, repoName),
  }).data;

export const useRepoGif = (repoName: string) =>
  useQuery<string | null>({
    queryKey: ["repo-gif", repoName],
    queryFn: () => fetchPreviewGifUrl(OWNER, repoName),
    ...FOREVER,
  }).data;

const EMPTY_LANGUAGES: Record<string, number> = {};

export const useRepoLanguages = (repoName: string) =>
  useQuery<Record<string, number>>({
    queryKey: ["repo-languages", repoName],
    queryFn: () => fetchLanguages(OWNER, repoName),
    ...FOREVER,
  }).data ?? EMPTY_LANGUAGES;

export const useRepoDmgQuery = (repoName: string) =>
  useQuery<string | null>({
    queryKey: ["repo-dmg", repoName],
    queryFn: () => fetchLatestDmgUrl(OWNER, repoName),
    ...FOREVER,
  });

export const useRepoDmgUrl = (repoName: string) =>
  useRepoDmgQuery(repoName).data;
