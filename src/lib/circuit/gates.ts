import type { Point } from "./types";

// ─── return types ────────────────────────────────────────────────────────────

export type NotGateShape = {
  tri: Point[];
  bub: [number, number, number];
  cx: number;
  cy: number;
};

export type SimpleGateShape = {
  path: string;
  cx: number;
  cy: number;
};

export type BubbedGateShape = SimpleGateShape & {
  bub: [number, number, number];
};

// ─── current gates (AND + NOR pair) ──────────────────────────────────────────
// TODO: replace andGate → xorGate, norGate × 2 → srLatch  (see plan-circuit.md)

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

export function andGate(lx: number, cy: number): SimpleGateShape {
  return {
    path: `M ${lx},${cy - 20} L ${lx},${cy + 20} Q ${lx + 44},${cy + 20} ${lx + 44},${cy} Q ${lx + 44},${cy - 20} ${lx},${cy - 20} Z`,
    cx: lx + 22,
    cy,
  };
}

export function norGate(lx: number, cy: number): BubbedGateShape {
  return {
    path: `M ${lx},${cy - 18} Q ${lx + 12},${cy} ${lx},${cy + 18} Q ${lx + 30},${cy + 18} ${lx + 48},${cy} Q ${lx + 30},${cy - 18} ${lx},${cy - 18} Z`,
    bub: [lx + 53, cy, 5],
    cx: lx + 24,
    cy,
  };
}

// ─── future gates (add here when implementing plan-circuit.md) ───────────────

// xorGate(lx, cy): extra back-curve + OR body, no bubble
//   back curve: M lx-6,cy-20  Q lx+6,cy  lx-6,cy+20
//   body:       M lx,cy-20  Q lx+12,cy  lx,cy+20  Q lx+30,cy+20  lx+48,cy  Q lx+30,cy-20  lx,cy-20  Z
//   output tip: lx+48, cy

// srLatch(lx, cy, gap): two NAND gates (AND body + output bubble) with cross-coupling
//   NAND top at cy-gap/2, NAND bot at cy+gap/2
//   cross wires: top-output → bot-lower-input, bot-output → top-lower-input
