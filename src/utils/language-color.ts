// GitHub linguist brand colors, lowercased keys. Fallback = muted periwinkle.
const COLORS: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f1e05a",
  python: "#3572a5",
  rust: "#dea584",
  go: "#00add8",
  swift: "#f05138",
  "c++": "#f34b7d",
  c: "#555555",
  lua: "#000080",
  html: "#e34c26",
  css: "#563d7c",
  scss: "#c6538c",
  shell: "#89e051",
  svelte: "#ff3e00",
  vue: "#41b883",
  ruby: "#701516",
  java: "#b07219",
  kotlin: "#a97bff",
  "objective-c": "#438eff",
  glsl: "#5686a5",
  mdx: "#fcb32c",
  dockerfile: "#384d54",
  makefile: "#427819",
  nix: "#7e7eff",
  zig: "#ec915c",
};

export const languageColor = (lang: string): string =>
  COLORS[lang.toLowerCase()] ?? "#7c85ff";
