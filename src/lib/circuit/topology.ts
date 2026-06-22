// Circuit topology: gate positions, wire layout, comet loop paths.
//
// Signal flow (left → right):
//
//   CONV → SPLIT1 ─┬─ direct ──────────────────────────→ XOR top input
//                  └─ → NOT → inverted ─────────────────→ XOR bot input
//                                        XOR out → ●circle (orbit) → SPLIT2
//                                                   SPLIT2 ─┬─ → LATCH S (top NAND, drives Q)
//                                                           └─ → LATCH R (bot NAND, drives Q̄)
//           ┌──── Q  feedback arc (top, dim) ←──────────────────────────────┘
//           └──── Q̄ feedback arc (bot, dim) ←──────────────────────────────┘
//           ↓
//          CONV (loop restarts)
//
// All semantic positions come from the grid (grid.ts). Intermediate routing bends
// that are purely geometric (NOT output pin, LATCH cross-coupling coords) are
// derived from gate shapes so they stay in sync when gate parameters change.

import { notGate, srLatch, xorGate } from "./gates";
import { gpt, registerPt } from "./grid";
import { buildPath, loopPts } from "./path";
import type { Point } from "./types";

// ─── gate instances ───────────────────────────────────────────────────────────

export const NOT = notGate(
  gpt("notIn", "notCenter")[0],
  gpt("notIn", "notCenter")[1],
);
export const XOR = xorGate(
  gpt("xorLeft", "center")[0],
  gpt("xorLeft", "center")[1],
);
// gap=100 → top gate at y=210, bot gate at y=310 — 60px between bodies for 45° cross wires
export const LATCH = srLatch(
  gpt("latchLeft", "center")[0],
  gpt("latchLeft", "center")[1],
  100,
);

// ─── named junction points ────────────────────────────────────────────────────
// Registered in the grid — access via pt('NAME') anywhere; throws if name is wrong.

export const CONV: Point = registerPt("CONV", gpt("feedLeft", "center"));
export const SPLIT1: Point = registerPt("SPLIT1", gpt("split1", "center"));
export const SPLIT2: Point = registerPt("SPLIT2", gpt("split2", "center")); // post-orbit split (25px right of orbit tangent)
export const Q_OUT: Point = registerPt("Q_OUT", [LATCH.qOut[0], LATCH.qOut[1]]);
export const QBAR_OUT: Point = registerPt("QBAR_OUT", [
  LATCH.qBarOut[0],
  LATCH.qBarOut[1],
]);

// Gate centers registered for flash/glow lookups and validation
registerPt("NOT_CTR", [NOT.cx, NOT.cy]);
registerPt("XOR_CTR", [XOR.cx, XOR.cy]);
registerPt("LATCH_TOP_CTR", [LATCH.top.cx, LATCH.top.cy]);
registerPt("LATCH_BOT_CTR", [LATCH.bot.cx, LATCH.bot.cy]);

// NAND input pin y-coords — 10px inside each gate body from its center edge.
// Derived from LATCH geometry so they stay aligned when gap changes.
const TOP_PIN_Y = LATCH.top.cy - 10; // 200
const BOT_PIN_Y = LATCH.bot.cy + 10; // 320

// Latch left edge x — wires enter the NAND gates here.
// Using the grid column directly (not LATCH.top.cx which is the body center).
const LATCH_X = gpt("latchLeft", "center")[0]; // 590

// ─── static wires ─────────────────────────────────────────────────────────────
// Drawn once onto the background canvas.
// 0–9  → main signal wires (ink, 1.6px)
// 10–11 → feedback arcs (inkDim, 1px)

export const WIRES: Point[][] = [
  // 0: input trunk — CONV → SPLIT1
  [CONV, SPLIT1],
  // 1: direct path → XOR top input
  [SPLIT1, gpt("split1", "xorTop"), gpt("xorLeft", "xorTop")],
  // 2: → NOT gate in
  [SPLIT1, gpt("split1", "notCenter"), gpt("notIn", "notCenter")],
  // 3: NOT out → XOR bot input  (284 = NOT bubble right edge; 330 = routing corner before XOR)
  [
    [NOT.bub[0] + NOT.bub[2], NOT.cy],
    [330, NOT.cy],
    [330, gpt("xorLeft", "xorBot")[1]],
    gpt("xorLeft", "xorBot"),
  ],
  // 4: XOR out → orbit left tangent
  [gpt("xorOut", "center"), gpt("circLeft", "center")],
  // 5: orbit right tangent → SPLIT2 (visible breathing-room segment after the 360° loop;
  //    the through-button portion is hidden by the download button DOM overlay)
  [gpt("circRight", "center"), SPLIT2],
  // 6: SPLIT2 → LATCH S pin (top NAND upper input)
  [SPLIT2, [SPLIT2[0], TOP_PIN_Y], [LATCH_X, TOP_PIN_Y]],
  // 7: SPLIT2 → LATCH R pin (bot NAND lower input)
  [SPLIT2, [SPLIT2[0], BOT_PIN_Y], [LATCH_X, BOT_PIN_Y]],
  // 8: NAND Q  output stub — bubble right edge → Q  splitter dot (visual continuity)
  [[LATCH.top.bub[0] + LATCH.top.bub[2], LATCH.top.bub[1]], Q_OUT],
  // 9: NAND Q̄ output stub — bubble right edge → Q̄ splitter dot
  [[LATCH.bot.bub[0] + LATCH.bot.bub[2], LATCH.bot.bub[1]], QBAR_OUT],
  // 10: Q  top feedback arc (dim)
  [
    Q_OUT,
    gpt("feedRight", "latchTop"),
    gpt("feedRight", "feedTop"),
    gpt("feedLeft", "feedTop"),
    CONV,
  ],
  // 11: Q̄ bot feedback arc (dim)
  [
    QBAR_OUT,
    gpt("feedRight", "latchBot"),
    gpt("feedRight", "feedBot"),
    gpt("feedLeft", "feedBot"),
    CONV,
  ],
];

// Junction splitter dots rendered as filled circles.
export const SPLITTER_DOTS: Point[] = [CONV, SPLIT1, SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop paths ─────────────────────────────────────────────────────────
// loopQ and loopQBar share the same PRE_HI prefix and orbit arc,
// then diverge at SPLIT2 into top/bot NAND, then take separate feedback arcs.
// Both total lengths are identical so headA can switch between them seamlessly.

// Shared prefix: CONV → SPLIT1 → XOR top input → XOR output → orbit left tangent
const PRE_HI: Point[] = [
  CONV,
  SPLIT1,
  gpt("split1", "xorTop"),
  gpt("xorLeft", "xorTop"),
  gpt("xorOut", "center"),
  gpt("circLeft", "center"),
];

// SPLIT2 → NAND gate → Q/Q̄ output
const latchPathQ: Point[] = [
  [SPLIT2[0], TOP_PIN_Y],
  [LATCH_X, TOP_PIN_Y],
  [LATCH_X, Q_OUT[1]],
  Q_OUT,
];
const latchPathQBar: Point[] = [
  [SPLIT2[0], BOT_PIN_Y],
  [LATCH_X, BOT_PIN_Y],
  [LATCH_X, QBAR_OUT[1]],
  QBAR_OUT,
];

// Q/Q̄ output → right rail → top/bot arc → CONV
const SUF_Q: Point[] = [
  gpt("feedRight", "latchTop"),
  gpt("feedRight", "feedTop"),
  gpt("feedLeft", "feedTop"),
  CONV,
];
const SUF_QBAR: Point[] = [
  gpt("feedRight", "latchBot"),
  gpt("feedRight", "feedBot"),
  gpt("feedLeft", "feedBot"),
  CONV,
];

export const loopQ = buildPath([
  ...PRE_HI,
  ...loopPts().slice(1), // full 360° around the button, returns to circLeft
  SPLIT2, // traverse through button (hidden) → emerge at SPLIT2
  ...latchPathQ,
  ...SUF_Q,
]);

export const loopQBar = buildPath([
  ...PRE_HI,
  ...loopPts().slice(1),
  SPLIT2,
  ...latchPathQBar,
  ...SUF_QBAR,
]);

// Ghost comets: fire on the path we're LEAVING after each toggle
export const ghostQ = buildPath([Q_OUT, ...SUF_Q]);
export const ghostQBar = buildPath([QBAR_OUT, ...SUF_QBAR]);

// Cross-coupling comets: Q→R-input and Q̄→S-input internal feedback
export const crossPath1 = buildPath(LATCH.cross[0]);
export const crossPath2 = buildPath(LATCH.cross[1]);

// NOT branch comet: mirrors SPLIT1 → NOT gate → XOR bot input (wire 2+3)
export const notBranchPath = buildPath([
  SPLIT1,
  gpt("split1", "notCenter"),
  gpt("notIn", "notCenter"),
  [NOT.bub[0] + NOT.bub[2], NOT.cy],
  [330, NOT.cy],
  [330, gpt("xorLeft", "xorBot")[1]],
  gpt("xorLeft", "xorBot"),
]);

// ─── trigger distances ────────────────────────────────────────────────────────
// Pre-computed arc lengths along loopQ used to fire effects at exact moments.

export const dSPLIT1_dist = buildPath([CONV, SPLIT1]).total;
export const dXOR_dist = buildPath([
  CONV,
  SPLIT1,
  gpt("split1", "xorTop"),
  gpt("xorLeft", "xorTop"),
]).total;

export const dLATCH_TRIGGER = buildPath([
  ...PRE_HI,
  ...loopPts().slice(1),
  SPLIT2,
  ...latchPathQ,
]).total;
