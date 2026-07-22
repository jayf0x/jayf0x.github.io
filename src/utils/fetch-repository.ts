import axios from "axios";

const GITHUB_API = "https://api.github.com";
const HEADERS = {
  // "User-Agent": "jayf0x-site",
  Accept: "application/vnd.github+json",
};

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
  topics: string[];
  archived: boolean;
  disabled: boolean;
  has_pages: boolean;
  homepage: string | null;
  languages_url: string;
  license: { key: string; name: string; spdx_id: string } | null;
  default_branch: string;
  visibility: string;
}

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface Release {
  assets?: ReleaseAsset[];
}

export async function fetchUserRepos(owner: string): Promise<GithubRepo[]> {
  const response = await axios.get<GithubRepo[]>(
    `${GITHUB_API}/users/${encodeURIComponent(owner)}/repos?per_page=100`,
    { headers: HEADERS },
  );
  return response.data.filter((r) => !r.fork && r.size > 0);
}

export async function fetchPreviewUrl(
  owner: string,
  repo: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/assets/preview.png`;
  try {
    await axios.head(url);
    return url;
  } catch {
    return null;
  }
}

// Real language breakdown (bytes per language) for the stack bar.
export async function fetchLanguages(
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  try {
    const { data } = await axios.get<Record<string, number>>(
      `${GITHUB_API}/repos/${owner}/${repo}/languages`,
      { headers: HEADERS },
    );
    return data;
  } catch {
    return {};
  }
}

// Optional animated preview: assets/preview.gif, swapped in on hover where present.
export async function fetchPreviewGifUrl(
  owner: string,
  repo: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/assets/preview.gif`;
  try {
    await axios.head(url);
    return url;
  } catch {
    return null;
  }
}

// Flagship picks = the repos Jonatan links in his profile README, in order.
export async function fetchFlagshipSlugs(owner: string): Promise<string[]> {
  const url = `https://raw.githubusercontent.com/${owner}/${owner}/main/README.md`;
  const { data } = await axios.get<string>(url, {
    responseType: "text",
    transformResponse: (d) => d,
  });
  const re = new RegExp(`github\\.com/${owner}/([a-zA-Z0-9._-]+)`, "g");
  const slugs = [...data.matchAll(re)].map((m) => m[1]);
  return [...new Set(slugs)]; // dedupe, keep README order
}

export async function fetchNpmPackages(
  owner: string,
): Promise<Record<string, string>> {
  const url = `https://registry.npmjs.org/-/v1/search?text=author:${encodeURIComponent(owner)}&size=100`;
  const res = await axios.get<{
    objects: { package: { name: string; links: { npm: string } } }[];
  }>(url);
  return Object.fromEntries(
    res.data.objects.map(({ package: p }) => [p.name, p.links.npm]),
  );
}

export async function fetchLatestDmgUrl(
  owner: string,
  repo: string,
): Promise<string | null> {
  try {
    const response = await axios.get<Release>(
      `${GITHUB_API}/repos/${owner}/${repo}/releases/latest`,
    );
    const dmg = response.data.assets?.find((a) => a.name.endsWith(".dmg"));
    return dmg?.browser_download_url ?? null;
  } catch {
    return null;
  }
}
