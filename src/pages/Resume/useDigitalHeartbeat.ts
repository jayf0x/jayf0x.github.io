import type { RefObject } from "react";
import { useEffect } from "react";

const DESIGN_W = 750;
const DESIGN_H = 520;
const BASE = 360;

const CIRC_CX = 490;
const CIRC_CY = 260;
const CIRC_R = 60;

const C = {
  ink: "#8b98ab",
  inkDim: "#46505f",
  warm: "255,184,84",
  teal: "255,124,84",
} as const;

const GCOL = {
  not: "180,100,255",
  and: "255,184,84",
  nor: "52,225,196",
} as const;

type Point = [number, number];
type Seg = { a: Point; b: Point; len: number; start: number };
type Path = { segs: Seg[]; total: number };

function notGate(ix: number, iy: number) {
  return {
    tri: [
      [ix, iy - 16],
      [ix, iy + 16],
      [ix + 34, iy],
    ] as Point[],
    bub: [ix + 39, iy, 5] as [number, number, number],
    cx: ix + 18,
    cy: iy,
  };
}
function andGate(lx: number, cy: number) {
  return {
    path: `M ${lx},${cy - 20} L ${lx},${cy + 20} Q ${lx + 44},${cy + 20} ${lx + 44},${cy} Q ${lx + 44},${cy - 20} ${lx},${cy - 20} Z`,
    cx: lx + 22,
    cy,
  };
}
function norGate(lx: number, cy: number) {
  return {
    path: `M ${lx},${cy - 18} Q ${lx + 12},${cy} ${lx},${cy + 18} Q ${lx + 30},${cy + 18} ${lx + 48},${cy} Q ${lx + 30},${cy - 18} ${lx},${cy - 18} Z`,
    bub: [lx + 53, cy, 5] as [number, number, number],
    cx: lx + 24,
    cy,
  };
}

function buildPath(pts: Point[]): Path {
  const segs: Seg[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i],
      b = pts[i + 1];
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

function arcPts(top: boolean, steps = 20): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = top ? Math.PI + Math.PI * t : Math.PI - Math.PI * t;
    pts.push([CIRC_CX + CIRC_R * Math.cos(a), CIRC_CY + CIRC_R * Math.sin(a)]);
  }
  return pts;
}

export function useDigitalHeartbeat(
  containerRef: RefObject<HTMLDivElement | null>,
  buttonRef?: RefObject<HTMLElement | null>,
  labelRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const NOT = notGate(240, 290);
    const AND = andGate(360, 260);
    const N1 = norGate(560, 210);
    const N2 = norGate(560, 310);

    const CONV: Point = [90, 260];

    const WIRES: Point[][] = [
      [CONV, [90, 250], [360, 250]],
      [CONV, [90, 290], [210, 290], [240, 290]],
      [
        [284, 290],
        [330, 290],
        [330, 270],
        [360, 270],
      ],
      [
        [404, 260],
        [CIRC_CX - CIRC_R, CIRC_CY],
      ],
      [
        [CIRC_CX + CIRC_R, CIRC_CY],
        [550, 210],
        [560, 210],
      ],
      [
        [CIRC_CX + CIRC_R, CIRC_CY],
        [550, 310],
        [560, 310],
      ],
      [[618, 210], [660, 210], [660, 110], [90, 110], CONV],
      [[618, 310], [660, 310], [660, 410], [90, 410], CONV],
      [
        [618, 210],
        [560, 301],
      ],
      [
        [618, 310],
        [560, 219],
      ],
    ];

    const PRE: Point[] = [
      CONV,
      [90, 290],
      [210, 290],
      [240, 290],
      [284, 290],
      [330, 290],
      [330, 270],
      [360, 270],
      [404, 260],
      [CIRC_CX - CIRC_R, CIRC_CY],
    ];
    const topArc = arcPts(true);
    const botArc = arcPts(false);
    const SUF_HI: Point[] = [
      [550, 210],
      [560, 210],
      [618, 210],
      [660, 210],
      [660, 110],
      [90, 110],
      CONV,
    ];
    const SUF_LO: Point[] = [
      [550, 310],
      [560, 310],
      [618, 310],
      [660, 310],
      [660, 410],
      [90, 410],
      CONV,
    ];

    const loopHi = buildPath([...PRE, ...topArc.slice(1), ...SUF_HI]);
    const loopLo = buildPath([...PRE, ...botArc.slice(1), ...SUF_LO]);
    const dTrig = buildPath(PRE).total;
    // Visual trigger: when comet reaches NOR gate output bubble (after arc + short run)
    const dNOR = buildPath([
      ...PRE,
      ...topArc.slice(1),
      [550, 210],
      [560, 210],
      [N1.bub[0], 210],
    ]).total;

    const bg = document.createElement("canvas");
    const bgx = bg.getContext("2d")!;
    const tau = Math.PI * 2;

    function renderStatic() {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      bg.width = DESIGN_W * DPR;
      bg.height = DESIGN_H * DPR;
      bgx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bgx.clearRect(0, 0, DESIGN_W, DESIGN_H);

      WIRES.forEach((w, i) => {
        bgx.strokeStyle = i >= 8 ? C.inkDim : C.ink;
        bgx.lineWidth = 1.6;
        bgx.lineJoin = "round";
        bgx.lineCap = "round";
        bgx.beginPath();
        w.forEach((p, j) =>
          j ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1]),
        );
        bgx.stroke();
      });

      bgx.strokeStyle = C.ink;
      bgx.lineWidth = 1.6;
      bgx.beginPath();
      bgx.arc(CIRC_CX, CIRC_CY, CIRC_R, 0, tau);
      bgx.stroke();

      bgx.strokeStyle = C.ink;
      bgx.lineWidth = 2.5;
      bgx.beginPath();
      NOT.tri.forEach((p, i) =>
        i ? bgx.lineTo(p[0], p[1]) : bgx.moveTo(p[0], p[1]),
      );
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

      ([CONV, [CIRC_CX + CIRC_R, CIRC_CY]] as Point[]).forEach(([x, y]) => {
        bgx.fillStyle = C.ink;
        bgx.beginPath();
        bgx.arc(x, y, 3, 0, tau);
        bgx.fill();
      });
    }

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    let head = 0;
    let q = 0;
    let bitPop = 0;
    let last = 0;
    let scale = 1;
    let ox = 0;
    let oy = 0;
    let mobMode = false;
    let mobTx = 0;
    let mobTy = 0;
    let cw = 0;
    let rafId = 0;

    const CCX = (90 + 660) / 2; // 375 — content horizontal center
    const CCY = 260;

    function positionOverlays() {
      const btnX = mobMode ? CIRC_CY * scale + mobTx : CIRC_CX * scale + ox;
      const btnY = mobMode ? -CIRC_CX * scale + mobTy : CIRC_CY * scale + oy;
      if (buttonRef?.current) {
        buttonRef.current.style.left = `${btnX}px`;
        buttonRef.current.style.top = `${btnY}px`;
      }
      if (labelRef?.current) {
        labelRef.current.style.left = `${btnX}px`;
        labelRef.current.style.top = `${btnY + CIRC_R * scale + 14}px`;
      }
    }

    function resize(w: number, h: number) {
      cw = w;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      mobMode = w < h;
      scale = mobMode
        ? Math.min(h / DESIGN_W, w / DESIGN_H) * 0.95
        : Math.min(w / DESIGN_W, h / DESIGN_H) * 0.95;
      ox = w / 2 - CCX * scale;
      oy = h / 2 - CCY * scale;
      mobTx = w / 2 - CCY * scale;
      mobTy = h / 2 + CCX * scale;
      positionOverlays();
    }

    function crossed(a: number, b: number, x: number) {
      return a <= b ? x > a && x <= b : x > a || x <= b;
    }

    function step(dt: number) {
      const T = loopHi.total;
      const prev = head;
      head += BASE * dt;
      const a = ((prev % T) + T) % T;
      const b = ((head % T) + T) % T;
      if (crossed(a, b, dTrig)) {
        q = 1 - q;
      }
      if (crossed(a, b, dNOR)) {
        bitPop = 1;
      } // visual trigger at NOR gate, not red button
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
        ctx.fillStyle = `rgba(${col},${(1 - f) * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, (1 - f) * 2.4 + 0.4, 0, tau);
        ctx.fill();
      }
      const [hx, hy] = pointAt(path, h);
      ctx.save();
      ctx.shadowColor = `rgb(${col})`;
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgb(${col})`;
      ctx.beginPath();
      ctx.arc(hx, hy, r, 0, tau);
      ctx.fill();
      ctx.restore();
    }

    function flash(cx: number, cy: number, intensity: number, col: string) {
      if (intensity <= 0) return;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      g.addColorStop(0, `rgba(${col},${intensity * 0.55})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, tau);
      ctx.fill();
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      step(dt);

      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mobMode) {
        ctx.setTransform(
          0,
          -scale * DPR,
          scale * DPR,
          0,
          mobTx * DPR,
          mobTy * DPR,
        );
      } else {
        ctx.setTransform(scale * DPR, 0, 0, scale * DPR, ox * DPR, oy * DPR);
      }
      ctx.drawImage(bg, 0, 0, DESIGN_W, DESIGN_H);

      // Stored energy — at NOR bubble center; active = bright, inactive = ghost
      [
        [N1.bub[0], N1.bub[1], q === 1],
        [N2.bub[0], N2.bub[1], q === 0],
      ].forEach(([x, y, activeVal]) => {
        const active = activeVal as boolean;
        ctx.save();
        ctx.shadowColor = `rgb(${C.teal})`;
        ctx.shadowBlur = active ? 14 : 4;
        ctx.fillStyle = `rgba(${C.teal},${active ? 1 : 0.22})`;
        ctx.beginPath();
        ctx.arc(x as number, y as number, active ? 5 + bitPop * 2 : 3, 0, tau);
        ctx.fill();
        ctx.restore();
      });

      const headPt = pointAt(q ? loopHi : loopLo, head);
      flash(NOT.cx, NOT.cy, near(headPt, NOT.cx, NOT.cy, 38), GCOL.not);
      flash(AND.cx, AND.cy, near(headPt, AND.cx, AND.cy, 42), GCOL.and);
      flash(N1.cx, N1.cy, near(headPt, N1.cx, N1.cy, 42), GCOL.nor);
      flash(N2.cx, N2.cy, near(headPt, N2.cx, N2.cy, 42), GCOL.nor);

      comet(q ? loopHi : loopLo, head, C.warm, 54, 4);

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
