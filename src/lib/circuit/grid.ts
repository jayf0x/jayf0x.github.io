// Circuit grid: named column/row fractions → design-space Points.
//
// COLS and ROWS express every semantic x/y position as a fraction of DESIGN_W/DESIGN_H.
// To stretch or squeeze the whole circuit, change DESIGN_W/DESIGN_H in config.ts —
// every gpt() call scales with it automatically.
//
// Two access patterns:
//   gpt(col, row)  — inline anonymous point from named col × row (TypeScript key-checked)
//   pt(name)       — named semantic junction (registered via registerPt, throws if missing)

import { DESIGN_W, DESIGN_H } from "./config";
import type { Point } from "./types";

// ─── columns (x-axis) ────────────────────────────────────────────────────────
// Fraction of DESIGN_W. Add a column here when a new x-position is introduced.

export const COLS = {
  feedLeft:   90  / DESIGN_W,  // CONV, left feedback arc edge
  split1:     130 / DESIGN_W,  // SPLIT1 — XOR direct / NOT branch fork
  notIn:      240 / DESIGN_W,  // NOT gate input edge
  xorLeft:    360 / DESIGN_W,  // XOR gate left edge / input
  xorOut:     408 / DESIGN_W,  // XOR gate output pin
  circLeft:   430 / DESIGN_W,  // orbit circle left tangent  (CIRC_CX − CIRC_R)
  circ:       490 / DESIGN_W,  // orbit circle center        (CIRC_CX)
  circRight:  550 / DESIGN_W,  // orbit circle right tangent (CIRC_CX + CIRC_R) = SPLIT2
  latchLeft:  720 / DESIGN_W,  // SR latch left edge — pushed right so right span (400px) matches left
  latchOut:   770 / DESIGN_W,  // SR latch output pins       (latchLeft + 50px)
  feedRight:  890 / DESIGN_W,  // right edge of feedback arcs — symmetric: 400px from CIRC_CX
} as const;

// ─── rows (y-axis) ───────────────────────────────────────────────────────────
// Fraction of DESIGN_H.

export const ROWS = {
  feedTop:    110 / DESIGN_H,  // top feedback arc y
  latchTop:   210 / DESIGN_H,  // top NAND gate center    (CIRC_CY − gap/2 = 210)
  xorTop:     240 / DESIGN_H,  // XOR direct wire / top input
  center:     260 / DESIGN_H,  // main horizontal axis    (CIRC_CY)
  xorBot:     280 / DESIGN_H,  // XOR bottom input wire
  notCenter:  290 / DESIGN_H,  // NOT gate center y
  latchBot:   310 / DESIGN_H,  // bot NAND gate center    (CIRC_CY + gap/2 = 310)
  feedBot:    410 / DESIGN_H,  // bot feedback arc y
} as const;

// ─── grid point helpers ───────────────────────────────────────────────────────

// Convert a named col × row intersection to a design-space Point.
// Keys are TypeScript-checked at compile time.
export function gpt(col: keyof typeof COLS, row: keyof typeof ROWS): Point {
  return [COLS[col] * DESIGN_W, ROWS[row] * DESIGN_H];
}

// ─── named point registry ─────────────────────────────────────────────────────
// Registers semantic junction points (CONV, SPLIT1, etc.) by name.
// pt() throws at runtime if a key is missing — catches misaligned references immediately.

const REGISTRY = new Map<string, Point>();

// Register a named point and return it (so you can const X = registerPt('X', gpt(...))).
export function registerPt(key: string, p: Point): Point {
  REGISTRY.set(key, p);
  return p;
}

// Look up a named point. Throws a descriptive error if not found.
export function pt(key: string): Point {
  const p = REGISTRY.get(key);
  if (p === undefined)
    throw new Error(`[circuit grid] Point "${key}" not defined — register it in topology.ts`);
  return p;
}

// Expose registry for the validation script.
export function allPts(): Map<string, Point> {
  return REGISTRY;
}
