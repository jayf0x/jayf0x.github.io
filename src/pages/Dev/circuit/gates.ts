// Gate shape generators — return geometry only, no drawing.
// Each function returns coordinates in the shared design space.

import type { Point } from "./types";

// ─── return types ─────────────────────────────────────────────────────────────

export type NotGateShape = {
  tri: Point[]; // three vertices of the triangle body
  bub: [number, number, number]; // [cx, cy, r] of the inversion bubble
  cx: number;
  cy: number; // visual center (for flash/glow)
};

export type XorGateShape = {
  outerArc: string; // SVG path: the dashed back arc (characteristic XOR extra curve)
  body: string; // SVG path: the gate body (D-shape with curved inputs)
  cx: number;
  cy: number; // visual center
};

export type SrLatchShape = {
  // top = S gate (Set, drives Q output); bot = R gate (Reset, drives Q̄ output)
  top: { path: string; bub: [number, number, number]; cx: number; cy: number };
  bot: { path: string; bub: [number, number, number]; cx: number; cy: number };
  // cross[0]: Q output → R gate input (feeds back to toggle state)
  // cross[1]: Q̄ output → S gate input (feeds back to toggle state)
  cross: Point[][];
  qOut: Point; // Q  output pin (top NAND, right side)
  qBarOut: Point; // Q̄ output pin (bot NAND, right side)
};

// ─── gates ───────────────────────────────────────────────────────────────────

// NOT gate centered at (ix, iy): triangle pointing right + inversion bubble.
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

// XOR gate with left edge at (lx, cy).
// Output pin is at (lx+48, cy) — tip of the D-shape.
export function xorGate(lx: number, cy: number): XorGateShape {
  // ±24 makes the gate body slightly taller than the ±20 input wires — visible flare
  const outerArc = `M ${lx - 6},${cy - 24} Q ${lx + 6},${cy} ${lx - 6},${cy + 24}`;
  const body = `M ${lx},${cy - 24} Q ${lx + 12},${cy} ${lx},${cy + 24} Q ${lx + 30},${cy + 24} ${lx + 48},${cy} Q ${lx + 30},${cy - 24} ${lx},${cy - 24} Z`;
  return { outerArc, body, cx: lx + 28, cy };
}

// SR NAND latch: two NAND gates stacked gap apart, centered at (lx, cy).
// Each gate is 40px wide, 40px tall (±20 from center).
// gap=100 → ty=210, by=310 — gives 60px between gate bodies for the 45° cross wires.
export function srLatch(lx: number, cy: number, gap = 50): SrLatchShape {
  const ty = cy - gap / 2; // top gate center-y
  const by = cy + gap / 2; // bot gate center-y
  const nandPath = (gy: number) =>
    `M ${lx},${gy - 20} L ${lx},${gy + 20} Q ${lx + 40},${gy + 20} ${lx + 40},${gy} Q ${lx + 40},${gy - 20} ${lx},${gy - 20} Z`;
  const bubR = 5;

  // Cross-coupling wires: each output routes back diagonally to the other gate's input.
  // N controls the breathing room: longer vertical leg from the source gate output,
  // longer horizontal entry leg into the destination gate — both shift the diagonal
  // further from gate bodies for visual clearance.
  const N = (gap - 60) / 2 + 10; // = 30 at gap=100 — extra clearance from NAND gates
  // Splitter dot (qOut / qBarOut) sits OUT_GAP px right of the bubble's right edge
  // (bubble right edge = lx+45+5 = lx+50). Visual separation between the NAND
  // inversion bubble and the splitter / cross-coupling origin.
  const OUT_GAP = 10;
  const qx = lx + 50 + OUT_GAP; // = lx + 60
  const cross: Point[][] = [
    // cross[0]: Q out [qx,ty] → down N → diagonal → into bot upper pin [lx, by-10]
    [
      [qx, ty],
      [qx, ty + N],
      [lx - N, by - 10],
      [lx, by - 10],
    ],
    // cross[1]: Q̄ out [qx,by] → up N → diagonal → into top lower pin [lx, ty+10]
    [
      [qx, by],
      [qx, by - N],
      [lx - N, ty + 10],
      [lx, ty + 10],
    ],
  ];

  return {
    top: { path: nandPath(ty), bub: [lx + 45, ty, bubR], cx: lx + 20, cy: ty },
    bot: { path: nandPath(by), bub: [lx + 45, by, bubR], cx: lx + 20, cy: by },
    cross,
    qOut: [qx, ty],
    qBarOut: [qx, by],
  };
}
