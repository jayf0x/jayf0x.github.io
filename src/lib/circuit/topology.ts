// Circuit topology: gate positions, wire layout, comet loop paths.

import type { Point } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";
import { buildPath, arcPts } from "./path";
import { notGate, xorGate, srLatch } from "./gates";

// ─── gate instances ───────────────────────────────────────────────────────────

export const NOT   = notGate(240, 290);
export const XOR   = xorGate(360, 260);
// gap=100 → ty=210, by=310 — gives 60px between gates for the 45° cross wires
export const LATCH = srLatch(590, 260, 100);

// ─── key points ──────────────────────────────────────────────────────────────

export const CONV:     Point = [90, 260];
export const SPLIT1:   Point = [130, 260];
export const SPLIT2:   Point = [CIRC_CX + CIRC_R, CIRC_CY]; // [550, 260]
export const Q_OUT:    Point = [LATCH.qOut[0],    LATCH.qOut[1]];    // [640, 210]
export const QBAR_OUT: Point = [LATCH.qBarOut[0], LATCH.qBarOut[1]]; // [640, 310]

// Pin y-coords: symmetric 60px above/below CIRC_CY (10px inside each gate from center)
const TOP_PIN_Y = LATCH.top.cy - 10;  // 200
const BOT_PIN_Y = LATCH.bot.cy + 10;  // 320

// ─── static wires ─────────────────────────────────────────────────────────────
// Indices 0-6: main signal (ink). Indices 7-8: feedback arcs (inkDim, thinner).

export const WIRES: Point[][] = [
  [CONV, SPLIT1],                                                              // 0: input trunk
  [SPLIT1, [130, 240], [360, 240]],                                            // 1: direct → XOR top
  [SPLIT1, [130, 290], [240, 290]],                                            // 2: → NOT in
  [[284, 290], [330, 290], [330, 280], [360, 280]],                            // 3: NOT out → XOR bot
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],                                  // 4: XOR out → circle left
  [SPLIT2, [550, TOP_PIN_Y], [590, TOP_PIN_Y]],                                // 5: → top NAND S pin
  [SPLIT2, [550, BOT_PIN_Y], [590, BOT_PIN_Y]],                                // 6: → bot NAND R pin
  [Q_OUT,    [660, Q_OUT[1]],    [660, 110], [90, 110], CONV],                 // 7: Q top arc (feedback)
  [QBAR_OUT, [660, QBAR_OUT[1]], [660, 410], [90, 410], CONV],                 // 8: Q-bar bot arc (feedback)
];

// Splitter dots rendered as filled circles.
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop paths ─────────────────────────────────────────────────────────
// loopQ and loopQBar have identical total lengths — headA survives a path switch.

const PRE_HI: Point[] = [
  CONV, SPLIT1, [130, 240], [360, 240],
  [408, 260],
  [CIRC_CX - CIRC_R, CIRC_CY],
];

// Top NAND path: SPLIT2 → S pin → gate center-y → Q output
const latchPathQ: Point[] = [
  [550, TOP_PIN_Y], [590, TOP_PIN_Y], [590, Q_OUT[1]], Q_OUT,
];

// Bottom NAND path: SPLIT2 → R pin → gate center-y → Q̄ output (symmetric)
const latchPathQBar: Point[] = [
  [550, BOT_PIN_Y], [590, BOT_PIN_Y], [590, QBAR_OUT[1]], QBAR_OUT,
];

const SUF_Q:    Point[] = [[660, Q_OUT[1]],    [660, 110], [90, 110], CONV];
const SUF_QBAR: Point[] = [[660, QBAR_OUT[1]], [660, 410], [90, 410], CONV];

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
export const ghostQ    = buildPath([Q_OUT,    ...SUF_Q]);
export const ghostQBar = buildPath([QBAR_OUT, ...SUF_QBAR]);

// Cross-coupling comets: right → (down|up) → 45° diagonal → gate input
// Derived directly from LATCH.cross so coordinates stay in sync.
export const crossPath1 = buildPath(LATCH.cross[0]);
export const crossPath2 = buildPath(LATCH.cross[1]);

// NOT branch comet: SPLIT1 → NOT gate → XOR bottom input
export const notBranchPath = buildPath([
  SPLIT1, [130, 290], [240, 290], [284, 290], [330, 290], [330, 280], [360, 280],
]);

// Pre-computed distances along the common prefix — same for both loopQ and loopQBar
export const dSPLIT1_dist   = buildPath([CONV, SPLIT1]).total;
export const dXOR_dist      = buildPath([CONV, SPLIT1, [130, 240], [360, 240]]).total;
export const dLATCH_TRIGGER = buildPath([...PRE_HI, ...arcPts(true).slice(1), ...latchPathQ]).total;
