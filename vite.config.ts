import MillionLint from "@million/lint";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    MillionLint.vite({
      enabled: mode !== "production",
      // weighted-grid's <GridItem> is a marker component that always renders null — Grid reads
      // its props without ever mounting it. Million's JSX capture wraps every element in a
      // profiler component, which pushes GridItem one level down into `props.children` and
      // breaks Grid's `weight`/`cols`/`children` reads (empty, unweighted cells in dev only).
      filter: { exclude: [/weighted-grid/, /pages\/Home\/Showcase/] },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
}));
