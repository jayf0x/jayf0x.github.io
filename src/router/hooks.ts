import { useLocation } from "@tanstack/react-router";
import { routeDefs } from "./routes";

// Resolve the routeDef for the current location. Falls back to the first route
// (e.g. while "/" is redirecting, or for any unknown path).
export const useCurrentRoute = () => {
  const { pathname } = useLocation();
  return routeDefs.find((r) => r.path === pathname) ?? routeDefs[0];
};
