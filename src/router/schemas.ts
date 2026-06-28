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
});
export type WidgetSearch = z.infer<typeof widgetSearchSchema>;
