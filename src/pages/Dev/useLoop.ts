// Self-contained animation hook for the Dev page.
// Draws a circuit-style pulse traveling Friction → Focus → Understanding → learning → back.
// No dependency on the shared circuit library — this is an isolated experiment.

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// ─── types ────────────────────────────────────────────────────────────────────
type Pt   = [number, number];
type Seg  = { a: Pt; b: Pt; len: number; start: number };
type Path = { segs: Seg[]; total: number };

export type FlowPhase  = "friction" | "focus" | "understanding" | "learning";
export type FlowEvents = { onPhase?: (p: FlowPhase) => void };

// ─── config ───────────────────────────────────────────────────────────────────
// Exported so a GIF-capture script can set the container to exactly this size.
export const FLOW_W = 640;
export const FLOW_H = 340;

const SPEED   = 280;        // design-px / sec
const tau     = Math.PI * 2;
const GATEBG  = "#0b1420";  // gate fill — opaque, erases wire through body

const C = {
  wire:          "#2b3d57",
  wirePx:        "43,61,87",
  friction:      "255,148,52",
  focus:         "46,208,255",
  understanding: "172,72,255",
  learning:      "88,228,118",
} as const;

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
//   [TL] ──[FRICTION]──[FOCUS]──[UNDERSTANDING]──[TR]
//    │                                             │
//   [BL] ──────────────[LEARNING]──────────────[BR]
//
const TL: Pt = [ 80, 118];
const TR: Pt = [560, 118];
const BR: Pt = [560, 240];
const BL: Pt = [ 80, 240];

const NPOS: Record<FlowPhase, Pt> = {
  friction:      [185, 118],
  focus:         [320, 118],
  understanding: [455, 118],
  learning:      [320, 240],
};

const LOOP = buildPath([
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
function prox(head: number, trigger: number, r = 74): number {
  const T = LOOP.total;
  const d = Math.min(Math.abs(head - trigger), T - Math.abs(head - trigger));
  return Math.max(0, 1 - d / r);
}

// ─── gate shapes ─────────────────────────────────────────────────────────────
//
//  FRICTION      — buffer triangle →  (raw energy in)
//  FOCUS         — AND gate →         (convergence)
//  UNDERSTANDING — XOR gate →         (synthesis / new insight)
//  LEARNING      — NOT gate ←         (transforms and feeds back)
//
function drawGate(
  ctx: CanvasRenderingContext2D,
  phase: FlowPhase,
  fill: string,
  stroke: string,
  lw: number,
): void {
  ctx.fillStyle   = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = lw;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  const [cx, cy] = NPOS[phase];

  switch (phase) {
    case "friction": {
      // Triangle buffer →
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 15);
      ctx.lineTo(cx - 20, cy + 15);
      ctx.lineTo(cx + 20, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "focus": {
      // AND gate → (D-shape)
      const p = new Path2D(
        `M ${cx - 18},${cy - 15} L ${cx - 18},${cy + 15} ` +
        `Q ${cx + 20},${cy + 15} ${cx + 20},${cy} ` +
        `Q ${cx + 20},${cy - 15} ${cx - 18},${cy - 15} Z`,
      );
      ctx.fill(p);
      ctx.stroke(p);
      break;
    }
    case "understanding": {
      // XOR gate → (D-shape body + characteristic dashed outer arc)
      const lx = cx - 22;
      const body = new Path2D(
        `M ${lx},${cy - 16} Q ${lx + 12},${cy} ${lx},${cy + 16} ` +
        `Q ${lx + 22},${cy + 16} ${lx + 44},${cy} ` +
        `Q ${lx + 22},${cy - 16} ${lx},${cy - 16} Z`,
      );
      const outerArc = new Path2D(
        `M ${lx - 5},${cy - 16} Q ${lx + 7},${cy} ${lx - 5},${cy + 16}`,
      );
      ctx.fill(body);
      ctx.stroke(body);
      ctx.save();
      ctx.setLineDash([3, 2]);
      ctx.stroke(outerArc);
      ctx.restore();
      break;
    }
    case "learning": {
      // NOT gate ← (mirrored triangle + inversion bubble on output left)
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 15);
      ctx.lineTo(cx + 20, cy + 15);
      ctx.lineTo(cx - 20, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // inversion bubble on the output (left side — learning transforms back)
      ctx.beginPath();
      ctx.arc(cx - 25, cy, 4.5, 0, tau);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
}

// ─── static render (drawn once to offscreen canvas) ───────────────────────────
function renderStatic(bgx: CanvasRenderingContext2D): void {
  bgx.clearRect(0, 0, FLOW_W, FLOW_H);

  // Full loop wire (gate fills will cover it inside gate bodies)
  bgx.strokeStyle = C.wire;
  bgx.lineWidth   = 1.5;
  bgx.lineCap     = "round";
  bgx.lineJoin    = "round";
  bgx.beginPath();
  bgx.moveTo(LOOP.segs[0].a[0], LOOP.segs[0].a[1]);
  for (const s of LOOP.segs) bgx.lineTo(s.b[0], s.b[1]);
  bgx.stroke();

  // Gate fills erase wire through gate bodies; outlines drawn on top
  const phases: FlowPhase[] = ["friction", "focus", "understanding", "learning"];
  for (const ph of phases) drawGate(bgx, ph, GATEBG, C.wire, 1.5);

  // Corner splitter dots
  bgx.fillStyle = C.wire;
  for (const [x, y] of [TL, TR, BR, BL] as Pt[]) {
    bgx.beginPath();
    bgx.arc(x, y, 3.5, 0, tau);
    bgx.fill();
  }

  // Dim labels (overdrawn with glow per-frame when active)
  bgx.font         = "bold 13px ui-monospace, monospace";
  bgx.textAlign    = "center";
  bgx.textBaseline = "middle";
  bgx.fillStyle    = "#253550";
  for (const ph of phases) {
    const [nx, ny] = NPOS[ph];
    bgx.fillText(LABEL[ph], nx, ph === "learning" ? ny + 40 : ny - 40);
  }

  // Arrow direction hints on the long wire segments (subtle ›› markers)
  bgx.fillStyle = "#1e2e47";
  bgx.font      = "9px ui-monospace, monospace";
  // top rail arrows between nodes
  const arrowsTop: Pt[] = [[252, 112], [388, 112]];
  for (const [x, y] of arrowsTop) bgx.fillText("›", x, y);
  // right rail arrow going down
  bgx.fillText("›", 565, 179);
  // bottom rail arrow going left
  bgx.fillText("‹", 435, 246);
  bgx.fillText("‹", 200, 246);
  // left rail arrow going up
  bgx.fillText("›", 75, 179);
}

// ─── per-frame drawing ─────────────────────────────────────────────────────────
function drawComet(ctx: CanvasRenderingContext2D, head: number, col: string): void {
  const TRAIL = 22;
  const LEN   = 58;

  for (let i = TRAIL; i >= 1; i--) {
    const f = i / TRAIL;
    const [x, y] = pointAt(LOOP, head - LEN * f);
    ctx.fillStyle = `rgba(${col},${(1 - f) * 0.62})`;
    ctx.beginPath();
    ctx.arc(x, y, (1 - f) * 2.3 + 0.3, 0, tau);
    ctx.fill();
  }

  // Glowing head
  const [hx, hy] = pointAt(LOOP, head);
  ctx.save();
  ctx.shadowColor = `rgb(${col})`;
  ctx.shadowBlur  = 14;
  ctx.fillStyle   = `rgb(${col})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 3.6, 0, tau);
  ctx.fill();
  ctx.restore();
}

function drawFlash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number,
  col: string,
  r = 42,
): void {
  if (t <= 0) return;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${col},${t * 0.52})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, tau);
  ctx.fill();
}

// ─── hook ─────────────────────────────────────────────────────────────────────
export function useLoop(
  containerRef: RefObject<HTMLDivElement | null>,
  events?: FlowEvents,
): void {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Offscreen bg: painted once, blit each frame
    const bg  = document.createElement("canvas");
    const bgx = bg.getContext("2d")!;

    function paintStatic(dpr: number) {
      bg.width  = FLOW_W * dpr;
      bg.height = FLOW_H * dpr;
      bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderStatic(bgx);
    }

    // Main (display) canvas
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    const T    = LOOP.total;
    let head   = 0;
    let last   = 0;
    let rafId  = 0;
    let scale  = 1;
    let ox     = 0;
    let oy     = 0;

    function resize(w: number, h: number) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      scale = Math.min(w / FLOW_W, h / FLOW_H) * 0.90;
      ox    = (w - FLOW_W * scale) / 2;
      oy    = (h - FLOW_H * scale) / 2;
      paintStatic(dpr);
    }

    function crossed(a: number, b: number, x: number): boolean {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    const PHASES: FlowPhase[] = ["friction", "focus", "understanding", "learning"];

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const prev = head;
      head += SPEED * dt;
      if (head >= T) head -= T;

      const a = ((prev % T) + T) % T;
      const b = ((head % T) + T) % T;

      const onPhase = eventsRef.current?.onPhase;
      if (onPhase) {
        for (const ph of PHASES) {
          if (crossed(a, b, D[ph])) onPhase(ph);
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);

      // Faint path aura before bg blit — gate fills will cover it inside bodies
      ctx.save();
      ctx.strokeStyle = `rgba(${C.wirePx},0.28)`;
      ctx.lineWidth   = 5;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.beginPath();
      ctx.moveTo(LOOP.segs[0].a[0], LOOP.segs[0].a[1]);
      for (const s of LOOP.segs) ctx.lineTo(s.b[0], s.b[1]);
      ctx.stroke();
      ctx.restore();

      // Blit static bg (covers aura inside gate bodies)
      ctx.drawImage(bg, 0, 0, FLOW_W, FLOW_H);

      // Node flash glows + bright labels (drawn ON TOP of bg, intentionally over gates)
      ctx.font         = "bold 13px ui-monospace, monospace";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      for (const ph of PHASES) {
        const p = prox(head, D[ph]);
        if (p <= 0) continue;
        const col     = C[ph];
        const [nx, ny] = NPOS[ph];
        const yOff    = ph === "learning" ? 40 : -40;

        drawFlash(ctx, nx, ny, p, col, 46);

        ctx.save();
        ctx.shadowColor = `rgb(${col})`;
        ctx.shadowBlur  = p * 16;
        ctx.fillStyle   = `rgba(${col},${0.42 + p * 0.58})`;
        ctx.fillText(LABEL[ph], nx, ny + yOff);
        ctx.restore();
      }

      // Comet — color blends toward the nearest active node
      let bestP  = 0;
      let bestPh: FlowPhase = "friction";
      for (const ph of PHASES) {
        const p = prox(head, D[ph], 88);
        if (p > bestP) { bestP = p; bestPh = ph; }
      }
      drawComet(ctx, head, bestP > 0.12 ? C[bestPh] : C.wirePx);

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
