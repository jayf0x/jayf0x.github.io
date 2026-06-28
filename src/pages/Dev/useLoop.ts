// Self-contained animation hook for the Dev page.
// A single pulse travels a loop reading Friction → Focus → Understanding → learning → back.
// The stages are drawn as real circuit components, not logic gates:
//   Friction      → resistor   (resists the flow)
//   Focus         → diode      (lets it pass one way)
//   Understanding → capacitor  (stores / accumulates)
//   learning      → no component — its label sits inside the loop; the wire just returns
// Minimal lines, a near-white pulse with a faint blue shine. The renderer is decoupled
// from rAF (see renderScene) so the GIF capture driver can drive it deterministically.

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// ─── types ────────────────────────────────────────────────────────────────────
type Pt   = [number, number];
type Seg  = { a: Pt; b: Pt; len: number; start: number };
type Path = { segs: Seg[]; total: number };

export type FlowPhase  = "friction" | "focus" | "understanding" | "learning";
export type FlowEvents = { onPhase?: (p: FlowPhase) => void };
export type Theme      = "dark" | "light";

// ─── config ───────────────────────────────────────────────────────────────────
// Compact, wide design space — sized for a small horizontal GIF.
export const FLOW_W = 560;
export const FLOW_H = 200;

export const SPEED = 230;   // design-px / sec — unhurried
const tau = Math.PI * 2;

// ─── palette ──────────────────────────────────────────────────────────────────
export type Palette = {
  bg: string; wire: string; label: string;
  comet: string; glow: string; // RGB strings for rgba()
};

export function palette(theme: Theme): Palette {
  return theme === "light"
    ? { bg: "#ffffff", wire: "#c4ccd9", label: "#8a93a3", comet: "37,99,235",  glow: "59,130,246"  }
    : { bg: "#060608", wire: "#2f3e57", label: "#3a4a66", comet: "223,233,255", glow: "130,175,255" };
}

const LABEL: Record<FlowPhase, string> = {
  friction:      "Friction",
  focus:         "Focus",
  understanding: "Understanding",
  learning:      "learning",
};

// ─── path helpers ─────────────────────────────────────────────────────────────
function buildPath(pts: Pt[]): Path {
  const segs: Seg[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  return { segs, total };
}

function pointAt(p: Path, d: number): Pt {
  const T = p.total;
  d = ((d % T) + T) % T;
  for (const s of p.segs) {
    if (d <= s.start + s.len + 1e-6) {
      const t = (d - s.start) / (s.len || 1);
      return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
    }
  }
  const L = p.segs[p.segs.length - 1];
  return [L.b[0], L.b[1]];
}

// ─── geometry ─────────────────────────────────────────────────────────────────
//
//   [TL] ─[RESISTOR]─[DIODE]─[CAPACITOR]─ [TR]
//    │              learning              │
//   [BL] ──────────────────────────────── [BR]
//
const TL: Pt = [ 70,  68];
const TR: Pt = [490,  68];
const BR: Pt = [490, 150];
const BL: Pt = [ 70, 150];

const NPOS: Record<FlowPhase, Pt> = {
  friction:      [175, 68],
  focus:         [280, 68],
  understanding: [385, 68],
  learning:      [280, 150], // trigger point on the bottom rail
};

// Where each label is drawn. learning sits *inside* the loop.
const LPOS: Record<FlowPhase, Pt> = {
  friction:      [175, 42],
  focus:         [280, 42],
  understanding: [385, 42],
  learning:      [280, 109],
};

export const LOOP = buildPath([
  TL,
  NPOS.friction, NPOS.focus, NPOS.understanding,
  TR, BR,
  NPOS.learning,
  BL, TL,
]);

// Cumulative arc-distance at each node along the loop
const D: Record<FlowPhase, number> = {
  friction:      buildPath([TL, NPOS.friction]).total,
  focus:         buildPath([TL, NPOS.friction, NPOS.focus]).total,
  understanding: buildPath([TL, NPOS.friction, NPOS.focus, NPOS.understanding]).total,
  learning:      buildPath([TL, NPOS.friction, NPOS.focus, NPOS.understanding, TR, BR, NPOS.learning]).total,
};

// 0→1 proximity of comet to a trigger (wrap-aware)
function prox(head: number, trigger: number, r = 64): number {
  const T = LOOP.total;
  const d = Math.min(Math.abs(head - trigger), T - Math.abs(head - trigger));
  return Math.max(0, 1 - d / r);
}

const PHASES: FlowPhase[] = ["friction", "focus", "understanding", "learning"];

// ─── component symbols ─────────────────────────────────────────────────────────
// Each is drawn inline on a horizontal wire at y=cy. The wire behind is masked
// with the bg color first so leads connect cleanly to the symbol.
const MASK: Partial<Record<FlowPhase, number>> = {
  friction: 52, focus: 40, understanding: 34,
};

function drawComponent(
  ctx: CanvasRenderingContext2D,
  phase: FlowPhase,
  pal: Palette,
): void {
  const mask = MASK[phase];
  if (!mask) return; // learning has no component
  const [cx, cy] = NPOS[phase];

  ctx.fillStyle   = pal.bg;
  ctx.fillRect(cx - mask / 2, cy - 18, mask, 36);

  ctx.strokeStyle = pal.wire;
  ctx.lineWidth   = 1.4;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.beginPath();

  switch (phase) {
    case "friction": { // resistor — zigzag
      const w = 40, a = 7, x0 = cx - w / 2;
      ctx.moveTo(cx - mask / 2, cy);
      ctx.lineTo(x0, cy);
      for (let i = 0; i < 6; i++) {
        const x = x0 + (w * (i + 0.5)) / 6;
        ctx.lineTo(x, cy + (i % 2 ? a : -a));
      }
      ctx.lineTo(cx + w / 2, cy);
      ctx.lineTo(cx + mask / 2, cy);
      ctx.stroke();
      break;
    }
    case "focus": { // diode — triangle + cathode bar
      ctx.moveTo(cx - mask / 2, cy);
      ctx.lineTo(cx - 9, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 10);
      ctx.lineTo(cx - 9, cy + 10);
      ctx.lineTo(cx + 8, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 11);
      ctx.lineTo(cx + 8, cy + 11);
      ctx.moveTo(cx + 8, cy);
      ctx.lineTo(cx + mask / 2, cy);
      ctx.stroke();
      break;
    }
    case "understanding": { // capacitor — two parallel plates
      ctx.moveTo(cx - mask / 2, cy);
      ctx.lineTo(cx - 5, cy);
      ctx.moveTo(cx - 5, cy - 13);
      ctx.lineTo(cx - 5, cy + 13);
      ctx.moveTo(cx + 5, cy - 13);
      ctx.lineTo(cx + 5, cy + 13);
      ctx.moveTo(cx + 5, cy);
      ctx.lineTo(cx + mask / 2, cy);
      ctx.stroke();
      break;
    }
  }
}

// ─── scene render (one full frame for a given head) ─────────────────────────────
// Draws at design coordinates into ctx. Caller sets any scaling transform.
export function renderScene(
  ctx: CanvasRenderingContext2D,
  head: number,
  pal: Palette,
): void {
  // background
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, FLOW_W, FLOW_H);

  // loop wire — thin
  ctx.strokeStyle = pal.wire;
  ctx.lineWidth   = 1.4;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.beginPath();
  ctx.moveTo(LOOP.segs[0].a[0], LOOP.segs[0].a[1]);
  for (const s of LOOP.segs) ctx.lineTo(s.b[0], s.b[1]);
  ctx.stroke();

  for (const ph of PHASES) drawComponent(ctx, ph, pal);

  // labels — dim, brightening near the comet
  ctx.font         = "13px ui-monospace, monospace";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  for (const ph of PHASES) {
    const p = prox(head, D[ph]);
    const [lx, ly] = LPOS[ph];
    if (p > 0) {
      const [nx, ny] = NPOS[ph];
      drawFlash(ctx, nx, ny, p, pal, 30);
      ctx.fillStyle = `rgba(${pal.comet},${0.35 + p * 0.65})`;
    } else {
      ctx.fillStyle = pal.label;
    }
    ctx.fillText(LABEL[ph], lx, ly);
  }

  drawComet(ctx, head, pal);
}

function drawComet(ctx: CanvasRenderingContext2D, head: number, pal: Palette): void {
  const TRAIL = 16, LEN = 44;
  for (let i = TRAIL; i >= 1; i--) {
    const f = i / TRAIL;
    const [x, y] = pointAt(LOOP, head - LEN * f);
    ctx.fillStyle = `rgba(${pal.glow},${(1 - f) * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, (1 - f) * 1.8 + 0.3, 0, tau);
    ctx.fill();
  }
  const [hx, hy] = pointAt(LOOP, head);
  ctx.save();
  ctx.shadowColor = `rgba(${pal.glow},0.9)`;
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = `rgb(${pal.comet})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 2.6, 0, tau);
  ctx.fill();
  ctx.restore();
}

function drawFlash(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, t: number, pal: Palette, r = 30,
): void {
  if (t <= 0) return;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${pal.glow},${t * 0.22})`);
  g.addColorStop(1, `rgba(${pal.glow},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, tau);
  ctx.fill();
}

// ─── live hook ─────────────────────────────────────────────────────────────────
export function useLoop(
  containerRef: RefObject<HTMLDivElement | null>,
  events?: FlowEvents,
): void {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const pal = palette("dark");

    const T   = LOOP.total;
    let head  = 0;
    let last  = 0;
    let rafId = 0;
    let scale = 1, ox = 0, oy = 0, dpr = 1;

    function resize(w: number, h: number) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      scale = Math.min(w / FLOW_W, h / FLOW_H) * 0.92;
      ox = (w - FLOW_W * scale) / 2;
      oy = (h - FLOW_H * scale) / 2;
    }

    function crossed(a: number, b: number, x: number): boolean {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const prev = head;
      head += SPEED * dt;
      if (head >= T) head -= T;

      const onPhase = eventsRef.current?.onPhase;
      if (onPhase) {
        const a = ((prev % T) + T) % T, b = ((head % T) + T) % T;
        for (const ph of PHASES) if (crossed(a, b, D[ph])) onPhase(ph);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
      renderScene(ctx, head, pal);

      rafId = requestAnimationFrame(frame);
    }

    const { width, height } = container.getBoundingClientRect();
    resize(width, height);
    const ro = new ResizeObserver(([e]) => {
      const { inlineSize: w, blockSize: h } = e.contentBoxSize[0];
      resize(w, h);
    });
    ro.observe(container);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.remove();
    };
  }, []);
}
