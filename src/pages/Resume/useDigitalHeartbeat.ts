import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const DESIGN_W = 1100;
const DESIGN_H = 560;
const BASE = 360;

// Circle where the split lives — download button goes here
const CIRC_CX = 490;
const CIRC_CY = 260;
const CIRC_R = 60;

const C = {
  ink: "#8b98ab",
  inkDim: "#46505f",
  warm: "255,184,84",
  teal: "52,225,196",
  tealHex: "#34e1c4",
} as const;

type Point = [number, number];
type Seg = { a: Point; b: Point; len: number; start: number };
type Path = { segs: Seg[]; total: number };

function notGate(ix: number, iy: number) {
  return {
    tri: [[ix, iy - 16], [ix, iy + 16], [ix + 34, iy]] as Point[],
    bub: [ix + 39, iy, 5] as [number, number, number],
    cx: ix + 18, cy: iy,
  };
}
function andGate(lx: number, cy: number) {
  return {
    path: `M ${lx},${cy - 20} L ${lx},${cy + 20} Q ${lx + 44},${cy + 20} ${lx + 44},${cy} Q ${lx + 44},${cy - 20} ${lx},${cy - 20} Z`,
    cx: lx + 22, cy,
  };
}
function norGate(lx: number, cy: number) {
  return {
    path: `M ${lx},${cy - 18} Q ${lx + 12},${cy} ${lx},${cy + 18} Q ${lx + 30},${cy + 18} ${lx + 48},${cy} Q ${lx + 30},${cy - 18} ${lx},${cy - 18} Z`,
    bub: [lx + 53, cy, 5] as [number, number, number],
    cx: lx + 24, cy,
  };
}

function buildPath(pts: Point[]): Path {
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

function pointAt(p: Path, d: number): Point {
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

// Semicircle as polyline — top arc goes above, bottom arc goes below
function arcPts(top: boolean, steps = 20): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = top ? Math.PI + Math.PI * t : Math.PI - Math.PI * t;
    pts.push([CIRC_CX + CIRC_R * Math.cos(a), CIRC_CY + CIRC_R * Math.sin(a)]);
  }
  return pts;
}

export type HeartbeatControls = {
  playingRef: React.MutableRefObject<boolean>;
  speedRef: React.MutableRefObject<number>;
  reset: () => void;
};

export function useDigitalHeartbeat(
  containerRef: RefObject<HTMLDivElement | null>,
  buttonRef?: RefObject<HTMLElement | null>,
  labelRef?: RefObject<HTMLElement | null>,
): HeartbeatControls {
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const resetRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Gates
    const NOT = notGate(240, 290);
    const AND = andGate(360, 260);
    const N1 = norGate(560, 210);
    const N2 = norGate(560, 310);

    // Static wires — feedback outer loops use ink (not dim) to reinforce memory
    const WIRES: Point[][] = [
      [[150, 260], [210, 260]],
      [[210, 260], [210, 290], [240, 290]],
      [[284, 290], [330, 290], [330, 270], [360, 270]],
      [[210, 260], [210, 250], [360, 250]],
      [[404, 260], [CIRC_CX - CIRC_R, CIRC_CY]],
      [[CIRC_CX + CIRC_R, CIRC_CY], [550, 210], [560, 210]],
      [[CIRC_CX + CIRC_R, CIRC_CY], [550, 310], [560, 310]],
      [[618, 210], [700, 210], [700, 90], [150, 90], [150, 260]],   // Q feedback — full ink
      [[618, 310], [700, 310], [700, 430], [150, 430], [150, 260]], // Q' feedback — full ink
      [[618, 210], [560, 301]],  // cross-couple straight diagonals (cleaner X)
      [[618, 310], [560, 219]],
    ];

    // Memory hold paths (glow targets)
    const HOLD_HI: Point[] = [[618, 210], [700, 210], [700, 90], [150, 90], [150, 260]];
    const HOLD_LO: Point[] = [[618, 310], [700, 310], [700, 430], [150, 430], [150, 260]];
    const X_HI: Point[] = [[618, 210], [560, 301]];
    const X_LO: Point[] = [[618, 310], [560, 219]];
    const pXHI = buildPath(X_HI);
    const pXLO = buildPath(X_LO);

    // Loop paths — PRE shared, arcs diverge at circle
    const PRE: Point[] = [
      [150, 260], [210, 260], [210, 290], [240, 290],
      [284, 290], [330, 290], [330, 270], [360, 270],
      [404, 260], [CIRC_CX - CIRC_R, CIRC_CY],
    ];
    const topArc = arcPts(true);
    const botArc = arcPts(false);
    const SUF_HI: Point[] = [[550, 210], [560, 210], [618, 210], [700, 210], [700, 90], [150, 90], [150, 260]];
    const SUF_LO: Point[] = [[550, 310], [560, 310], [618, 310], [700, 310], [700, 430], [150, 430], [150, 260]];

    const loopHi = buildPath([...PRE, ...topArc.slice(1), ...SUF_HI]);
    const loopLo = buildPath([...PRE, ...botArc.slice(1), ...SUF_LO]);
    const dTrig = buildPath(PRE).total;

    // ── Static offscreen layer ────────────────────────────────────────────
    const bg = document.createElement("canvas");
    const bgx = bg.getContext("2d")!;
    const tau = Math.PI * 2;

    function renderStatic() {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      bg.width = DESIGN_W * DPR;
      bg.height = DESIGN_H * DPR;
      bgx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bgx.clearRect(0, 0, DESIGN_W, DESIGN_H);

      // Wires: feedback loops (7, 8) stay at full ink — they ARE the memory structure
      WIRES.forEach((w, i) => {
        bgx.strokeStyle = i >= 9 ? C.inkDim : C.ink; // cross-couples slightly dimmer
        bgx.lineWidth = 1.6;
        bgx.lineJoin = "round";
        bgx.lineCap = "round";
        bgx.beginPath();
        w.forEach((p, j) => (j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
        bgx.stroke();
      });

      // Circle — the split / decision point
      bgx.strokeStyle = C.ink;
      bgx.lineWidth = 1.6;
      bgx.beginPath();
      bgx.arc(CIRC_CX, CIRC_CY, CIRC_R, 0, tau);
      bgx.stroke();

      // Gates — outlines only (wires terminate at boundaries, no fill needed)
      bgx.strokeStyle = C.ink;
      bgx.lineWidth = 2.5;
      bgx.beginPath();
      NOT.tri.forEach((p, i) => (i ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1])));
      bgx.closePath();
      bgx.stroke();
      bgx.beginPath();
      bgx.arc(NOT.bub[0], NOT.bub[1], NOT.bub[2], 0, tau);
      bgx.stroke();

      bgx.stroke(new Path2D(AND.path));

      [N1, N2].forEach((g) => {
        bgx.stroke(new Path2D(g.path));
        bgx.beginPath();
        bgx.arc(g.bub[0], g.bub[1], g.bub[2], 0, tau);
        bgx.stroke();
      });

      // Junction dots
      ([
        [150, 260], [210, 260], [CIRC_CX + CIRC_R, CIRC_CY],
      ] as Point[]).forEach(([x, y]) => {
        bgx.fillStyle = C.ink;
        bgx.beginPath();
        bgx.arc(x, y, 2.8, 0, tau);
        bgx.fill();
      });
    }

    // ── Main canvas ───────────────────────────────────────────────────────
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    let head = 0;
    let q = 0;
    let bitPop = 0;
    let shimmer = 0;
    let last = 0;
    let scale = 1;
    let ox = 0;
    let oy = 0;
    let rafId = 0;

    resetRef.current = () => { head = 0; q = 0; bitPop = 0; };

    function positionOverlays() {
      if (buttonRef?.current) {
        buttonRef.current.style.left = `${CIRC_CX * scale + ox}px`;
        buttonRef.current.style.top = `${CIRC_CY * scale + oy}px`;
      }
      if (labelRef?.current) {
        labelRef.current.style.left = `${CIRC_CX * scale + ox}px`;
        labelRef.current.style.top = `${(CIRC_CY + CIRC_R + 14) * scale + oy}px`;
      }
    }

    function resize(w: number, h: number) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      scale = Math.min(w / DESIGN_W, h / DESIGN_H) * 0.97;
      ox = (w - DESIGN_W * scale) / 2;
      oy = (h - DESIGN_H * scale) / 2;
      positionOverlays();
    }

    function crossed(a: number, b: number, x: number) {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    function step(dt: number) {
      const spd = speedRef.current;
      const T = loopHi.total;
      const prev = head;
      head += BASE * spd * dt;
      const a = ((prev % T) + T) % T;
      const b = ((head % T) + T) % T;
      if (crossed(a, b, dTrig)) { q = 1 - q; bitPop = 1; }
      if (head >= T) head -= T;
      if (bitPop > 0) bitPop = Math.max(0, bitPop - dt * 3.2);
    }

    function near(pt: Point, cx: number, cy: number, th: number) {
      return Math.max(0, 1 - Math.hypot(pt[0] - cx, pt[1] - cy) / th);
    }

    function comet(path: Path, h: number, col: string, len: number, r: number) {
      for (let i = 18; i >= 1; i--) {
        const f = i / 18;
        const [x, y] = pointAt(path, h - len * f);
        ctx.fillStyle = `rgba(${col},${(1 - f) * 0.85})`;
        ctx.beginPath();
        ctx.arc(x, y, (1 - f) * 2.6 + 0.5, 0, tau);
        ctx.fill();
      }
      const [hx, hy] = pointAt(path, h);
      ctx.save();
      ctx.shadowColor = `rgb(${col})`;
      ctx.shadowBlur = 24;
      ctx.fillStyle = `rgb(${col})`;
      ctx.beginPath();
      ctx.arc(hx, hy, r, 0, tau);
      ctx.fill();
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(hx, hy, r * 0.5, 0, tau);
      ctx.fill();
      ctx.restore();
    }

    function glow(pts: Point[], col: string, w: number, alpha: number) {
      ctx.save();
      ctx.strokeStyle = `rgba(${col},${alpha})`;
      ctx.lineWidth = w;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = `rgb(${col})`;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.restore();
    }

    function flash(cx: number, cy: number, intensity: number, col: string) {
      if (intensity <= 0) return;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38);
      g.addColorStop(0, `rgba(${col},${intensity * 0.9})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, tau);
      ctx.fill();
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (playingRef.current) {
        step(dt);
        shimmer += dt * speedRef.current;
      }

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      // Memory: held side glows teal + cross-couple shimmer
      const [holdPath, pX] = q ? [HOLD_HI, pXHI] : [HOLD_LO, pXLO];
      const xPath = q ? X_HI : X_LO;
      glow(holdPath, C.teal, 4, 0.9);
      glow(xPath, C.teal, 3, 0.65);
      comet(pX, (shimmer * 60) % pX.total, C.teal, 26, 2);

      // Travelling spark (warm) — flashes gates as it passes
      const path = q ? loopHi : loopLo;
      const headPt = pointAt(path, head);
      flash(AND.cx, AND.cy, near(headPt, AND.cx, AND.cy, 44), C.warm);
      flash(NOT.cx, NOT.cy, near(headPt, NOT.cx, NOT.cy, 36), C.warm);
      flash(N1.cx, N1.cy, near(headPt, N1.cx, N1.cy, 44), C.warm);
      flash(N2.cx, N2.cy, near(headPt, N2.cx, N2.cy, 44), C.warm);
      flash(150, 260, near(headPt, 150, 260, 32) * 0.7, C.warm);
      flash(CIRC_CX, CIRC_CY, near(headPt, CIRC_CX, CIRC_CY, CIRC_R + 12) * 0.5, C.warm);
      comet(path, head, C.warm, 54, 4.2);

      rafId = requestAnimationFrame(frame);
    }

    renderStatic();
    const { width, height } = container.getBoundingClientRect();
    resize(width, height);

    const ro = new ResizeObserver(([entry]) => {
      const { inlineSize: w, blockSize: h } = entry.contentBoxSize[0];
      resize(w, h);
    });
    ro.observe(container);

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.remove();
      resetRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    playingRef,
    speedRef,
    reset: () => resetRef.current?.(),
  };
}
