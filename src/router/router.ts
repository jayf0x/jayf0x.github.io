import { App } from "@/App";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { routeDefs } from "./routes";
import { widgetSearchSchema } from "./schemas";

const rootRoute = createRootRoute({ component: App });

const indexRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/127-0-0-1" });
  },
});

// Routes are componentless: the root (App) renders the matched page itself in an
// animated motion.div (see App.tsx / useCurrentRoute) rather than via <Outlet />,
// so the outgoing page keeps its own content while it transitions out.
const childRoutes = routeDefs.map(({ path }) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    validateSearch: widgetSearchSchema,
  }),
);

const routeTree = rootRoute.addChildren([indexRedirect, ...childRoutes]);

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
