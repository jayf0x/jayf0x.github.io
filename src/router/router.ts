import { App } from "@/App";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { routeDefs } from "./routes";
import { widgetSearchSchema } from "./schemas";

const rootRoute = createRootRoute({ component: App });

const childRoutes = routeDefs.map(({ path, Component }) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: Component,
    validateSearch: widgetSearchSchema,
  }),
);

const routeTree = rootRoute.addChildren(childRoutes);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
