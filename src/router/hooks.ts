import { useLocation } from "@tanstack/react-router";
import { routeDefs, routePaths } from "./routes";
import type { RoutePath } from "./schemas";

export const useCurrentRoute = () => {
  const { pathname } = useLocation();
  const path = (
    routePaths.includes(pathname as RoutePath) ? pathname : "/"
  ) as RoutePath;
  return routeDefs.find((r) => r.path === path)!;
};
