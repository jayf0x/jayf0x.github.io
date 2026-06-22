// Pure canvas drawing functions — no React, no state.
// renderStatic draws the background once onto an offscreen canvas.
// drawComet and drawFlash are called every animation frame.

import type { Path } from "./types";
import { C, GCOL, CIRC_CX, CIRC_CY, CIRC_R, tau } from "./config";
import { pointAt } from "./path";
import { NOT, AND, N1, N2, WIRES, CROSS, SPLITTER_DOTS } from "./topology";

// ─── background (static, drawn once) ─────────────────────────────────────────
// TODO (plan-circuit.md §Draw): update to render XOR gate and SR latch

export function renderStatic(bgx: CanvasRenderingContext2D): void {
  bgx.clearRect(0, 0, CIRC_CX * 2, CIRC_CY * 2); // cleared by caller before call

  // Wires: main (ink) vs feedback (inkDim)
  WIRES.forEach((w, i) => {
    bgx.strokeStyle = i >= 6 ? C.inkDim : C.ink;
    bgx.lineWidth = i >= 6 ? 1 : 1.6;
    bgx.lineJoin = "round";
    bgx.lineCap = "round";
    bgx.beginPath();
    w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
    bgx.stroke();
  });

  // Circle (CV button placeholder)
  bgx.strokeStyle = C.ink;
  bgx.lineWidth = 1.6;
  bgx.beginPath();
  bgx.arc(CIRC_CX, CIRC_CY, CIRC_R, 0, tau);
  bgx.stroke();

  // NOT gate: triangle + bubble
  bgx.strokeStyle = C.ink;
  bgx.lineWidth = 2.5;
  bgx.beginPath();
  NOT.tri.forEach((p, i) => (i ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
  bgx.closePath();
  bgx.stroke();
  bgx.beginPath();
  bgx.arc(NOT.bub[0], NOT.bub[1], NOT.bub[2], 0, tau);
  bgx.stroke();

  // Main gate (AND, becomes XOR)
  bgx.strokeStyle = C.ink;
  bgx.lineWidth = 1.6;
  bgx.stroke(new Path2D(AND.path));

  // Right gates (NOR pair, becomes SR latch)
  [N1, N2].forEach((g) => {
    bgx.stroke(new Path2D(g.path));
    bgx.beginPath();
    bgx.arc(g.bub[0], g.bub[1], g.bub[2], 0, tau);
    bgx.stroke();
  });

  // Cross-coupling wires (teal)
  bgx.strokeStyle = `rgba(${GCOL.latch},0.65)`;
  bgx.lineWidth = 1.4;
  bgx.lineJoin = "round";
  bgx.lineCap = "round";
  CROSS.forEach((w) => {
    bgx.beginPath();
    w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
    bgx.stroke();
  });

  // Splitter dots
  SPLITTER_DOTS.forEach(([x, y]) => {
    bgx.fillStyle = C.ink;
    bgx.beginPath();
    bgx.arc(x, y, 3, 0, tau);
    bgx.fill();
  });
}

// ─── per-frame drawing ────────────────────────────────────────────────────────

export function drawComet(
  ctx: CanvasRenderingContext2D,
  path: Path,
  head: number,
  col: string,
  len: number,
  r: number,
): void {
  for (let i = 18; i >= 1; i--) {
    const f = i / 18;
    const [x, y] = pointAt(path, head - len * f);
    ctx.fillStyle = `rgba(${col},${(1 - f) * 0.7})`;
    ctx.beginPath();
    ctx.arc(x, y, (1 - f) * 2.4 + 0.4, 0, tau);
    ctx.fill();
  }
  const [hx, hy] = pointAt(path, head);
  ctx.save();
  ctx.shadowColor = `rgb(${col})`;
  ctx.shadowBlur = 8;
  ctx.fillStyle = `rgb(${col})`;
  ctx.beginPath();
  ctx.arc(hx, hy, r, 0, tau);
  ctx.fill();
  ctx.restore();
}

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
