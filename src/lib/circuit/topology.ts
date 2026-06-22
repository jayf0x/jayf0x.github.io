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
// Pins are symmetric around CIRC_CY=260: top at 260-35=225, bottom at 260+35=295.

export const WIRES: Point[][] = [
  [CONV, SPLIT1],                                               // 0: input trunk
  [SPLIT1, [130, 240], [360, 240]],                             // 1: direct → XOR top
  [SPLIT1, [130, 290], [240, 290]],                             // 2: → NOT in
  [[284, 290], [330, 290], [330, 280], [360, 280]],             // 3: NOT out → XOR bot
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],                   // 4: XOR out → circle left
  [SPLIT2, [550, 225], [590, 225]],                             // 5: → NAND top S pin (35px up)
  [SPLIT2, [550, 295], [590, 295]],                             // 6: → NAND bot R pin (35px down, symmetric)
  [Q_OUT,    [660, 235], [660, 110], [90, 110], CONV],          // 7: Q top arc (feedback)
  [QBAR_OUT, [660, 285], [660, 410], [90, 410], CONV],          // 8: Q-bar bot arc (feedback)
];

// Splitter dots rendered as filled circles.
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop paths ─────────────────────────────────────────────────────────
// loopQ and loopQBar have identical total lengths — safe to switch headA between them.

const PRE_HI: Point[] = [
  CONV, SPLIT1, [130, 240], [360, 240],
  [408, 260],
  [CIRC_CX - CIRC_R, CIRC_CY],
];

// Top NAND path: SPLIT2 → S pin → gate center-y → Q output
const latchPathQ: Point[] = [
  [550, 225], [590, 225], [590, 235], [640, 235],
];

// Bottom NAND path: SPLIT2 → R pin → gate center-y → Q̄ output (symmetric to top)
const latchPathQBar: Point[] = [
  [550, 295], [590, 295], [590, 285], [640, 285],
];

const SUF_Q:    Point[] = [[660, 235], [660, 110], [90, 110], CONV];
const SUF_QBAR: Point[] = [[660, 285], [660, 410], [90, 410], CONV];

export const loopQ = buildPath([
  ...PRE_HI,
  ...arcPts(true).slice(1),
  ...latchPathQ,
  ...SUF_Q,
]);

export const loopQBar = buildPath([
  ...PRE_HI,
  ...arcPts(true).slice(1),
  ...latchPathQBar,
  ...SUF_QBAR,
]);

// Ghost comets: fire on the path we're LEAVING after each latch toggle
export const ghostQ    = buildPath([Q_OUT,    [660, 235], [660, 110], [90, 110], CONV]);
export const ghostQBar = buildPath([QBAR_OUT, [660, 285], [660, 410], [90, 410], CONV]);

// Cross-coupling comets: short paths inside the latch, fire on latch trigger
export const crossPath1 = buildPath([[640, 235], [646, 235], [646, 295], [590, 295]]);
export const crossPath2 = buildPath([[640, 285], [650, 285], [650, 225], [590, 225]]);

// NOT branch comet: SPLIT1 → NOT gate → XOR bottom input
export const notBranchPath = buildPath([
  SPLIT1, [130, 290], [240, 290], [284, 290], [330, 290], [330, 280], [360, 280],
]);

// Pre-computed distances along the common prefix — same for both loopQ and loopQBar
export const dSPLIT1_dist   = buildPath([CONV, SPLIT1]).total;
export const dXOR_dist      = buildPath([CONV, SPLIT1, [130, 240], [360, 240]]).total;
export const dLATCH_TRIGGER = buildPath([...PRE_HI, ...arcPts(true).slice(1), ...latchPathQ]).total;
