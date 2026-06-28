import { allWidgetNames } from "@/config";
import { z } from "zod";

export const routePathSchema = z.enum([
  "/127-0-0-1",
  "/resume",
  "/contact",
  "/dev",
]);
export type RoutePath = z.infer<typeof routePathSchema>;

export const pageLabelSchema = z.enum([
  "127.0.0.1",
  "Résumé",
  "Contact",
  "Dev",
]);
export type PageLabel = z.infer<typeof pageLabelSchema>;

export const widgetSearchSchema = z.object({
  widget: z.enum(allWidgetNames).optional(),
  // Project search state, shareable via URL (e.g. ?tag=npm or ?q=tauri).
  // Kept flexible (free strings) since tags/queries aren't known up front.
  // `tag` is comma-separated to round-trip multiple active filters.
  tag: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});
export type WidgetSearch = z.infer<typeof widgetSearchSchema>;
