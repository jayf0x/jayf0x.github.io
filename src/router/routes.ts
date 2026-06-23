import { Contact } from "@/pages/Contact";
import { Home } from "@/pages/Home";
import { Resume } from "@/pages/Resume";
import type { ComponentType } from "react";
import type { PageLabel, RoutePath } from "./schemas";

export type RouteDef = {
  path: RoutePath;
  label: PageLabel;
  Component: ComponentType;
};

export const routeDefs = [
  { path: "/", label: "127.0.0.1", Component: Home },
  { path: "/resume", label: "Résumé", Component: Resume },
  { path: "/contact", label: "Contact", Component: Contact },
] as const satisfies readonly RouteDef[];

export const routePaths = routeDefs.map((r) => r.path) as readonly RoutePath[];
