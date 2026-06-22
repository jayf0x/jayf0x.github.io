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
  cross: [Point, Point, Point, Point][];
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
  // Cross-coupling: Q (ty) → bottom gate at by+10; Q̄ (by) → top gate at ty-10
  // ty-10 and by+10 match the symmetric input pin positions in topology.ts
  const cross: [Point, Point, Point, Point][] = [
    [[lx + 50, ty], [lx + 56, ty], [lx + 56, by + 10], [lx, by + 10]],
    [[lx + 50, by], [lx + 60, by], [lx + 60, ty - 10], [lx, ty - 10]],
  ];
  return {
    top: { path: nandPath(ty), bub: [lx + 45, ty, bubR], cx: lx + 20, cy: ty },
    bot: { path: nandPath(by), bub: [lx + 45, by, bubR], cx: lx + 20, cy: by },
    cross,
    qOut: [lx + 50, ty],
    qBarOut: [lx + 50, by],
  };
}
