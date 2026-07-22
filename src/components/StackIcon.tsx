import type { IconType } from "react-icons";
import {
  SiC,
  SiCplusplus,
  SiCss,
  SiGnubash,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiLua,
  SiMdx,
  SiPython,
  SiReact,
  SiRust,
  SiShell,
  SiSvelte,
  SiSwift,
  SiTypescript,
  SiVite,
  SiWebgl,
} from "react-icons/si";
import { TbBinary } from "react-icons/tb";

// language string (from GitHub) → brand glyph. Unknown falls back to a dot.
const MAP: Record<string, IconType> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  python: SiPython,
  rust: SiRust,
  go: SiGo,
  swift: SiSwift,
  swiftui: SiSwift,
  "c++": SiCplusplus,
  c: SiC,
  lua: SiLua,
  html: SiHtml5,
  css: SiCss,
  shell: SiShell,
  bash: SiGnubash,
  svelte: SiSvelte,
  react: SiReact,
  webgl: SiWebgl,
  glsl: SiWebgl,
  mdx: SiMdx,
  json: SiJson,
  vite: SiVite,
};

export const StackIcon = ({
  language,
  className,
  style,
}: {
  language: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const Icon = MAP[language.toLowerCase()] ?? TbBinary;
  return <Icon className={className} style={style} aria-hidden />;
};
