// GIF capture driver. Renders the loop deterministically (not via rAF) and POSTs
// every frame to the local create-gif.py API, awaiting each one so nothing is dropped.
// One full loop per theme; the API assembles the GIF and decides fps.

import { FLOW_H, FLOW_W, LOOP, SPEED, palette, renderScene, type Theme } from "./useLoop";

const API = "http://localhost:8723";

async function captureLoop(theme: Theme, fps: number): Promise<void> {
  const cv = document.createElement("canvas");
  cv.width = FLOW_W;
  cv.height = FLOW_H;
  const ctx = cv.getContext("2d")!;
  const pal = palette(theme);

  const n = Math.max(1, Math.round((LOOP.total / SPEED) * fps));
  for (let i = 0; i < n; i++) {
    const head = (i / n) * LOOP.total;
    renderScene(ctx, head, pal);
    const data = cv.toDataURL("image/png");
    await fetch(`${API}/frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: theme, index: i, total: n, fps, data, isFinal: i === n - 1 }),
    });
  }
}

// Captures dark then light. Exposed on window so it can be triggered from a button
// or the console. Returns when both GIFs are written.
export async function captureGif(): Promise<void> {
  const cfg = await fetch(`${API}/config`).then((r) => r.json());
  const fps: number = cfg.fps ?? 18;
  for (const theme of ["dark", "light"] as Theme[]) {
    // eslint-disable-next-line no-console
    console.log(`[capture] ${theme}…`);
    await captureLoop(theme, fps);
  }
  // eslint-disable-next-line no-console
  console.log("[capture] done — check src/pages/Dev/");
}
