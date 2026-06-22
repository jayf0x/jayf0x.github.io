// Pure canvas drawing functions — no React, no state.
//
// renderStatic  → draws background wires + gate shapes once onto an offscreen canvas.
//                 Gate fills are drawn BEFORE outlines so they erase wires passing through.
// drawComet     → per-frame: draws a comet (glowing head + fading dot trail).
// drawFlash     → per-frame: draws a radial glow pulse at a gate center.

import type { Path } from "./types";
import { C, CIRC_CX, CIRC_CY, CIRC_R, tau } from "./config";
import { pointAt } from "./path";
import { NOT, XOR, LATCH, WIRES, SPLITTER_DOTS } from "./topology";

// ─── background (static, drawn once) ─────────────────────────────────────────

export function renderStatic(bgx: CanvasRenderingContext2D): void {
  bgx.clearRect(0, 0, CIRC_CX * 2, CIRC_CY * 2);

  // Wires: main (ink) vs feedback arcs (inkDim, thinner) — see WIRES comments in topology
  WIRES.forEach((w, i) => {
    bgx.strokeStyle = i >= 10 ? C.inkDim : C.ink;
    bgx.lineWidth   = i >= 10 ? 1 : 1.6;
    bgx.lineJoin    = "round";
    bgx.lineCap     = "round";
    bgx.beginPath();
    w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
    bgx.stroke();
  });

  // Orbit circle (the memory node / download button orbit)
  bgx.strokeStyle = C.ink;
  bgx.lineWidth   = 1.6;
  bgx.beginPath();
  bgx.arc(CIRC_CX, CIRC_CY, CIRC_R, 0, tau);
  bgx.stroke();

  // Gate fills: erase wires that pass through gate bodies, then redraw outlines on top
  bgx.fillStyle = C.gateBg;

  bgx.beginPath();
  NOT.tri.forEach((p, i) => (i ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
  bgx.closePath();
  bgx.fill();

  bgx.fill(new Path2D(XOR.body));
  [LATCH.top, LATCH.bot].forEach((g) => bgx.fill(new Path2D(g.path)));

  // Gate outlines ─────────────────────────────────────────────────────────────

  // NOT: triangle + inversion bubble
  bgx.strokeStyle = C.ink;
  bgx.lineWidth   = 2.5;
  bgx.beginPath();
  NOT.tri.forEach((p, i) => (i ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
  bgx.closePath();
  bgx.stroke();
  bgx.beginPath();
  bgx.arc(NOT.bub[0], NOT.bub[1], NOT.bub[2], 0, tau);
  bgx.stroke();

  // XOR: dashed back arc (characteristic extra curve) then solid body
  bgx.strokeStyle = C.ink;
  bgx.lineWidth   = 1.6;
  bgx.setLineDash([4, 3]);
  bgx.stroke(new Path2D(XOR.outerArc));
  bgx.setLineDash([]);
  bgx.stroke(new Path2D(XOR.body));

  // SR NAND latch: two gate bodies + inversion bubbles on outputs
  bgx.strokeStyle = C.ink;
  bgx.lineWidth   = 1.6;
  [LATCH.top, LATCH.bot].forEach((g) => {
    bgx.stroke(new Path2D(g.path));
    bgx.beginPath();
    bgx.arc(g.bub[0], g.bub[1], g.bub[2], 0, tau);
    bgx.stroke();
  });

  // Cross-coupling wires (Q→R input, Q̄→S input) — comets animate on top of these
  bgx.strokeStyle = C.ink;
  bgx.lineWidth   = 1.6;
  bgx.lineJoin    = "round";
  bgx.lineCap     = "round";
  LATCH.cross.forEach((w) => {
    bgx.beginPath();
    w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
    bgx.stroke();
  });

  // Junction splitter dots
  SPLITTER_DOTS.forEach(([x, y]) => {
    bgx.fillStyle = C.ink;
    bgx.beginPath();
    bgx.arc(x, y, 4, 0, tau);
    bgx.fill();
  });
}

// ─── per-frame drawing ────────────────────────────────────────────────────────

// Draws a comet: 18-dot fading trail behind a glowing head.
// head: current distance along path; len: trail length in px; r: head dot radius.
export function drawComet(
  ctx: CanvasRenderingContext2D,
  path: Path,
  head: number,
  col: string,
  len: number,
  r: number,
): void {
  // Trail: 18 dots, each slightly smaller and more transparent as they lag behind
  for (let i = 18; i >= 1; i--) {
    const f = i / 18;
    const [x, y] = pointAt(path, head - len * f);
    ctx.fillStyle = `rgba(${col},${(1 - f) * 0.7})`;
    ctx.beginPath();
    ctx.arc(x, y, (1 - f) * 2.4 + 0.4, 0, tau);
    ctx.fill();
  }
  // Head: full glow
  const [hx, hy] = pointAt(path, head);
  ctx.save();
  ctx.shadowColor = `rgb(${col})`;
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = `rgb(${col})`;
  ctx.beginPath();
  ctx.arc(hx, hy, r, 0, tau);
  ctx.fill();
  ctx.restore();
}

// Radial glow at gate center; intensity decays over time (caller handles the decay).
export function drawFlash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  intensity: number,
  col: string,
): void {
  if (intensity <= 0) return;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  g.addColorStop(0, `rgba(${col},${intensity * 0.55})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, tau);
  ctx.fill();
}
