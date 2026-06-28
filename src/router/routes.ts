import { Contact } from "@/pages/Contact";
import { DevPage } from "@/pages/Dev";
import { Home } from "@/pages/Home";
import { Resume } from "@/pages/Resume";
import { IS_DEV } from "@/utils/dev";
import type { ComponentType } from "react";
import type { PageLabel, RoutePath } from "./schemas";

export type RouteDef = {
  path: RoutePath;
  label: PageLabel;
  Component: ComponentType;
};

export const routeDefs = [
  { path: "/127-0-0-1", label: "127.0.0.1", Component: Home },
  { path: "/resume", label: "Résumé", Component: Resume },
  { path: "/contact", label: "Contact", Component: Contact },
  (IS_DEV
    ? { path: "/dev", label: "Dev", Component: DevPage }
    : null) as RouteDef,
].filter((r): r is RouteDef => Boolean(r)) satisfies readonly RouteDef[];

export const routePaths = routeDefs.map((r) => r.path) as readonly RoutePath[];
