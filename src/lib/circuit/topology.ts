// Circuit topology: gate positions, wire layout, comet loop paths.

import type { Point } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";
import { buildPath, arcPts } from "./path";
import { notGate, xorGate, srLatch } from "./gates";

// ─── gate instances ───────────────────────────────────────────────────────────

export const NOT   = notGate(240, 290);
export const XOR   = xorGate(360, 260);
export const LATCH = srLatch(590, 260, 50);

// ─── key points ──────────────────────────────────────────────────────────────

export const CONV:     Point = [90, 260];
export const SPLIT1:   Point = [130, 260];
export const SPLIT2:   Point = [CIRC_CX + CIRC_R, CIRC_CY]; // [550, 260]
export const Q_OUT:    Point = [LATCH.qOut[0],    LATCH.qOut[1]];    // [640, 235]
export const QBAR_OUT: Point = [LATCH.qBarOut[0], LATCH.qBarOut[1]]; // [640, 285]

// ─── static wires ─────────────────────────────────────────────────────────────
// Indices 0-6: main signal (ink). Indices 7-8: feedback arcs (inkDim, thinner).

export const WIRES: Point[][] = [
  [CONV, SPLIT1],                                               // 0: input trunk
  [SPLIT1, [130, 240], [360, 240]],                             // 1: direct → XOR top
  [SPLIT1, [130, 290], [240, 290]],                             // 2: → NOT in   (aura wire)
  [[284, 290], [330, 290], [330, 280], [360, 280]],             // 3: NOT out → XOR bot (aura wire)
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],                   // 4: XOR out → circle left
  [SPLIT2, [550, 225], [590, 225]],                             // 5: → NAND top S upper pin
  [SPLIT2, [550, 275], [590, 275]],                             // 6: → NAND bot R upper pin
  [Q_OUT,    [660, 235], [660, 110], [90, 110], CONV],          // 7: Q top arc (feedback)
  [QBAR_OUT, [660, 285], [660, 410], [90, 410], CONV],          // 8: Q-bar bot arc (feedback)
];

// Splitter dots rendered as filled circles.
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop paths ─────────────────────────────────────────────────────────

const PRE_HI: Point[] = [
  CONV, SPLIT1, [130, 240], [360, 240],
  [408, 260],
  [CIRC_CX - CIRC_R, CIRC_CY],
];

// Comet traverses top NAND: SPLIT2 gap → S upper pin → gate center-y → Q output
const latchPath: Point[] = [
  [550, 225], // NAND top S upper pin (SPLIT2 → this is implicit buildPath segment)
  [590, 225], // enter gate left edge
  [590, 235], // slide to gate center-y
  [640, 235], // exit Q output = Q_OUT
];

const SUF_HI: Point[] = [[660, 235], [660, 110], [90, 110], CONV];

export const loopHi = buildPath([
  ...PRE_HI,
  ...arcPts(true).slice(1), // arc ends at SPLIT2 [550,260]
  ...latchPath,
  ...SUF_HI,
]);

// Ghost comet: Q-bar output → bottom arc → CONV (one-shot, fades over path length)
export const ghostPath = buildPath([
  QBAR_OUT, [660, 285], [660, 410], [90, 410], CONV,
]);

// Pre-computed distances used in hook.ts — avoids rebuilding paths per frame
export const dSPLIT1_dist   = buildPath([CONV, SPLIT1]).total;
export const dXOR_dist      = buildPath([CONV, SPLIT1, [130, 240], [360, 240]]).total;
export const dLATCH_TRIGGER = buildPath([...PRE_HI, ...arcPts(true).slice(1), ...latchPath]).total;
