import type { Point } from "./types";

// ─── return types ────────────────────────────────────────────────────────────

export type NotGateShape = {
  tri: Point[];
  bub: [number, number, number];
  cx: number;
  cy: number;
};

export type XorGateShape = {
  outerArc: string;
  body: string;
  cx: number;
  cy: number;
};

export type SrLatchShape = {
  top: { path: string; bub: [number, number, number]; cx: number; cy: number };
  bot: { path: string; bub: [number, number, number]; cx: number; cy: number };
  cross: Point[][];
  qOut: Point;
  qBarOut: Point;
};

// ─── gates ───────────────────────────────────────────────────────────────────

export function notGate(ix: number, iy: number): NotGateShape {
  return {
    tri: [
      [ix, iy - 16],
      [ix, iy + 16],
      [ix + 34, iy],
    ] as Point[],
    bub: [ix + 39, iy, 5],
    cx: ix + 18,
    cy: iy,
  };
}

export function xorGate(lx: number, cy: number): XorGateShape {
  // ±24 makes the gate body slightly taller than the ±20 input wires — visible flare
  const outerArc = `M ${lx - 6},${cy - 24} Q ${lx + 6},${cy} ${lx - 6},${cy + 24}`;
  const body = `M ${lx},${cy - 24} Q ${lx + 12},${cy} ${lx},${cy + 24} Q ${lx + 30},${cy + 24} ${lx + 48},${cy} Q ${lx + 30},${cy - 24} ${lx},${cy - 24} Z`;
  return { outerArc, body, cx: lx + 28, cy };
}

export function srLatch(lx: number, cy: number, gap = 50): SrLatchShape {
  const ty = cy - gap / 2;
  const by = cy + gap / 2;
  const nandPath = (gy: number) =>
    `M ${lx},${gy - 20} L ${lx},${gy + 20} Q ${lx + 40},${gy + 20} ${lx + 40},${gy} Q ${lx + 40},${gy - 20} ${lx},${gy - 20} Z`;
  const bubR = 5;

  // Cross-coupling: 5-segment route so the two wires never share a segment.
  // N = short vertical step, diag = 45° run (|dx|=|dy|).
  // Derived from gap so the path lands exactly on each gate's input pin.
  const N    = (2 * (gap - 40)) / 5; // = 24 when gap=100
  const diag = 50 + N;               // = 74; horizontal gap from Q_OUT to lx-N
  const cross: Point[][] = [
    // Q_OUT [lx+50,ty] → down N → 45°down-left → down N/2 → right into bot input
    [[lx + 50, ty], [lx + 50, ty + N], [lx - N, ty + N + diag], [lx - N, by + 10], [lx, by + 10]],
    // Q̄_OUT [lx+50,by] → up N  → 45°up-left   → up N/2   → right into top input
    [[lx + 50, by], [lx + 50, by - N], [lx - N, by - N - diag], [lx - N, ty - 10], [lx, ty - 10]],
  ];

  return {
    top: { path: nandPath(ty), bub: [lx + 45, ty, bubR], cx: lx + 20, cy: ty },
    bot: { path: nandPath(by), bub: [lx + 45, by, bubR], cx: lx + 20, cy: by },
    cross,
    qOut:    [lx + 50, ty],
    qBarOut: [lx + 50, by],
  };
}
