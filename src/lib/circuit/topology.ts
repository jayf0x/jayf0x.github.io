// Circuit topology: gate positions, wire layout, comet loop paths.
//
// Signal flow (left → right):
//
//   CONV → SPLIT1 ─┬─ direct ──────────────────────────→ XOR top input
//                  └─ → NOT → inverted ─────────────────→ XOR bot input
//                                        XOR out → ●circle (orbit) → SPLIT2
//                                                   SPLIT2 ─┬─ → LATCH S (top NAND, drives Q)
//                                                           └─ → LATCH R (bot NAND, drives Q̄)
//           ┌──── Q  feedback arc (top, dim) ←───────────────────────────────┘
//           └──── Q̄ feedback arc (bot, dim) ←───────────────────────────────┘
//           ↓
//          CONV (loop restarts)
//
// Key named points (all in design-space coordinates):
//   CONV     — where both feedback arcs converge back to the main loop start
//   SPLIT1   — first junction: signal forks to XOR direct path AND the NOT branch
//   SPLIT2   — second junction: right side of orbit circle, forks to S and R pins
//   Q_OUT    — output pin of top NAND (Q)
//   QBAR_OUT — output pin of bottom NAND (Q̄)

import type { Point } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";
import { buildPath, arcPts } from "./path";
import { notGate, xorGate, srLatch } from "./gates";

// ─── gate instances ───────────────────────────────────────────────────────────

export const NOT   = notGate(240, 290);
export const XOR   = xorGate(360, 260);
// gap=100 → top gate at y=210, bot gate at y=310 — 60px between bodies for 45° cross wires
export const LATCH = srLatch(590, 260, 100);

// ─── key junction points ──────────────────────────────────────────────────────

export const CONV:     Point = [90, 260];              // feedback convergence / loop origin
export const SPLIT1:   Point = [130, 260];             // XOR direct-path / NOT branch fork
export const SPLIT2:   Point = [CIRC_CX + CIRC_R, CIRC_CY]; // [550, 260] — orbit exit / latch fork
export const Q_OUT:    Point = [LATCH.qOut[0],    LATCH.qOut[1]];    // [640, 210]
export const QBAR_OUT: Point = [LATCH.qBarOut[0], LATCH.qBarOut[1]]; // [640, 310]

// Input pin y-coords on the NAND gates — 10px inside each gate from its center edge
const TOP_PIN_Y = LATCH.top.cy - 10;  // 200 — top gate's upper input
const BOT_PIN_Y = LATCH.bot.cy + 10;  // 320 — bot gate's lower input

// ─── static wires ─────────────────────────────────────────────────────────────
// Drawn once onto the background canvas.
// 0–6 → main signal wires (ink, 1.6px)
// 7–8 → feedback arcs (inkDim, 1px) — the Q and Q̄ return paths

export const WIRES: Point[][] = [
  [CONV, SPLIT1],                                                              // 0: input trunk
  [SPLIT1, [130, 240], [360, 240]],                                            // 1: direct → XOR top input
  [SPLIT1, [130, 290], [240, 290]],                                            // 2: → NOT gate in
  [[284, 290], [330, 290], [330, 280], [360, 280]],                            // 3: NOT out → XOR bot input
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],                                  // 4: XOR out → orbit left tangent
  [SPLIT2, [550, TOP_PIN_Y], [590, TOP_PIN_Y]],                                // 5: orbit exit → LATCH S pin
  [SPLIT2, [550, BOT_PIN_Y], [590, BOT_PIN_Y]],                                // 6: orbit exit → LATCH R pin
  [Q_OUT,    [660, Q_OUT[1]],    [660, 110], [90, 110], CONV],                 // 7: Q  top feedback arc
  [QBAR_OUT, [660, QBAR_OUT[1]], [660, 410], [90, 410], CONV],                 // 8: Q̄ bot feedback arc
];

// Junction dots rendered as filled circles at each wire branch/merge.
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop paths ─────────────────────────────────────────────────────────
// loopQ and loopQBar share the same PRE_HI prefix and orbit arc,
// then diverge at SPLIT2 into top or bottom NAND, then take separate feedback arcs.
// Both loops have identical total lengths so headA can switch between them mid-travel.

// Shared prefix: CONV → SPLIT1 → XOR top-input → XOR output → orbit entry
const PRE_HI: Point[] = [
  CONV, SPLIT1, [130, 240], [360, 240],
  [408, 260],
  [CIRC_CX - CIRC_R, CIRC_CY], // orbit left tangent (π)
];

// After orbit exit (SPLIT2), each path routes to one NAND gate
const latchPathQ: Point[] = [    // top NAND: → S pin → Q output
  [550, TOP_PIN_Y], [590, TOP_PIN_Y], [590, Q_OUT[1]], Q_OUT,
];
const latchPathQBar: Point[] = [ // bot NAND: → R pin → Q̄ output
  [550, BOT_PIN_Y], [590, BOT_PIN_Y], [590, QBAR_OUT[1]], QBAR_OUT,
];

// Feedback arcs: Q/Q̄ output → top/bottom routing → CONV
const SUF_Q:    Point[] = [[660, Q_OUT[1]],    [660, 110], [90, 110], CONV];
const SUF_QBAR: Point[] = [[660, QBAR_OUT[1]], [660, 410], [90, 410], CONV];

// Full loop paths (main comet alternates between these when latch toggles)
export const loopQ = buildPath([
  ...PRE_HI,
  ...arcPts(true).slice(1), // orbit arc (top half: π→2π), skip duplicate start point
  ...latchPathQ,
  ...SUF_Q,
]);

export const loopQBar = buildPath([
  ...PRE_HI,
  ...arcPts(true).slice(1),
  ...latchPathQBar,
  ...SUF_QBAR,
]);

// Ghost comets: fire on the path we're LEAVING after each latch toggle.
// Start at Q/Q̄ output and fade out as they travel the old feedback arc.
export const ghostQ    = buildPath([Q_OUT,    ...SUF_Q]);
export const ghostQBar = buildPath([QBAR_OUT, ...SUF_QBAR]);

// Cross-coupling comets: visualize the internal NAND feedback signal.
// cross[0]: Q output → diagonal → bot NAND upper input  (triggers Q̄ to respond)
// cross[1]: Q̄ output → diagonal → top NAND lower input (triggers Q  to respond)
export const crossPath1 = buildPath(LATCH.cross[0]);
export const crossPath2 = buildPath(LATCH.cross[1]);

// NOT branch comet: purely visual — mirrors SPLIT1→NOT→XOR path of wire 2+3.
// Travels in parallel with the main comet while it traverses the XOR region.
export const notBranchPath = buildPath([
  SPLIT1, [130, 290], [240, 290], [284, 290], [330, 290], [330, 280], [360, 280],
]);

// ─── trigger distances along loopQ/loopQBar ───────────────────────────────────
// These are pre-computed distances used in hook.ts to fire effects at exact moments.

// Distance from loop start (CONV) to SPLIT1 — when comet passes here, NOT branch fires
export const dSPLIT1_dist = buildPath([CONV, SPLIT1]).total;

// Distance from CONV to XOR top input — end of the NOT branch aura window
export const dXOR_dist = buildPath([CONV, SPLIT1, [130, 240], [360, 240]]).total;

// Distance from CONV to Q output (latch trigger point) — when comet exits NAND,
// ghost + cross-coupling comets fire, and pendingBit is staged
export const dLATCH_TRIGGER = buildPath([...PRE_HI, ...arcPts(true).slice(1), ...latchPathQ]).total;
