import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

export const AppRouter = () => <RouterProvider router={router} />;

export { routeDefs } from "./routes";
export type { PageLabel, RoutePath } from "./schemas";
