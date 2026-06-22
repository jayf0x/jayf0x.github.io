// Circuit topology: gate positions, wire layout, comet loop paths.
// This is the main file to edit when redesigning the circuit.
// See plan-circuit.md for the XOR + SR-latch redesign.

import type { Point } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";
import { buildPath, arcPts } from "./path";
import { notGate, andGate, norGate } from "./gates";

// ─── gate instances ───────────────────────────────────────────────────────────
// TODO (plan-circuit.md §Gates): swap andGate→xorGate, norGate×2→srLatch

export const NOT = notGate(240, 290);
export const AND = andGate(360, 260);   // becomes XOR
export const N1 = norGate(560, 210);    // becomes SR latch top
export const N2 = norGate(560, 310);    // becomes SR latch bot

// ─── key points ──────────────────────────────────────────────────────────────

export const CONV: Point = [90, 260]; // input arrival / feedback convergence
// TODO (plan-circuit.md §Splitters): add SPLIT1=[130,260], SPLIT2=[CIRC_CX+CIRC_R,CIRC_CY]

// ─── static wires ─────────────────────────────────────────────────────────────
// Indices 0-5: main signal (ink color). 6+: feedback arcs (inkDim, thinner).
// TODO (plan-circuit.md §Wires): replace with new fan-out topology

export const WIRES: Point[][] = [
  [CONV, [90, 250], [360, 250]],                              // 0: top AND input (comA)
  [CONV, [90, 290], [210, 290], [240, 290]],                 // 1: to NOT gate (comB)
  [[284, 290], [330, 290], [330, 270], [360, 270]],          // 2: NOT→AND bottom (comB)
  [[404, 260], [CIRC_CX - CIRC_R, CIRC_CY]],                // 3: AND out→circle
  [[CIRC_CX + CIRC_R, CIRC_CY], [550, 210], [560, 210]],    // 4: circle→N1
  [[CIRC_CX + CIRC_R, CIRC_CY], [550, 310], [560, 310]],    // 5: circle→N2
  [[618, 210], [660, 210], [660, 110], [90, 110], CONV],     // 6: N1 outer feedback
  [[618, 310], [660, 310], [660, 410], [90, 410], CONV],     // 7: N2 outer feedback
];

// Cross-coupling wires between NOR gates (drawn teal).
// TODO (plan-circuit.md §SRLatch): replace with NAND cross-coupling inside srLatch()
export const CROSS: Point[][] = [
  [[618, 210], [618, 228], [560, 292], [560, 301]], // N1 out → N2 upper input
  [[618, 310], [618, 292], [560, 228], [560, 219]], // N2 out → N1 lower input
];

// Splitter dots rendered as filled circles.
// TODO (plan-circuit.md §Splitters): add SPLIT1, SPLIT2
export const SPLITTER_DOTS: Point[] = [
  CONV,
  [CIRC_CX + CIRC_R, CIRC_CY],
];

// ─── comet loop paths ─────────────────────────────────────────────────────────
// loopHi: comA — direct top input path
// loopLo: comB — through NOT gate path
// TODO (plan-circuit.md §LoopPaths): update PRE/SUF segments for new topology

const PRE_HI: Point[] = [
  CONV, [90, 250], [360, 250], [404, 260], [CIRC_CX - CIRC_R, CIRC_CY],
];
const PRE_LO: Point[] = [
  CONV, [90, 290], [210, 290], [240, 290], [284, 290],
  [330, 290], [330, 270], [360, 270], [404, 260], [CIRC_CX - CIRC_R, CIRC_CY],
];

const topArc = arcPts(true);
const botArc = arcPts(false);

const SUF_HI: Point[] = [
  [550, 210], [560, 210], [618, 210], [660, 210], [660, 110], [90, 110], CONV,
];
const SUF_LO: Point[] = [
  [550, 310], [560, 310], [618, 310], [660, 310], [660, 410], [90, 410], CONV,
];

export const loopHi = buildPath([...PRE_HI, ...topArc.slice(1), ...SUF_HI]);
export const loopLo = buildPath([...PRE_LO, ...botArc.slice(1), ...SUF_LO]);

// Distance at which each comet exits its NOR gate output bubble (triggers flash/pop).
// TODO (plan-circuit.md §TriggerDistances): recalculate after loop path changes
export const dNOR_A = buildPath([
  ...PRE_HI, ...topArc.slice(1), [550, 210], [560, 210], [N1.bub[0], 210],
]).total;
export const dNOR_B = buildPath([
  ...PRE_LO, ...botArc.slice(1), [550, 310], [560, 310], [N2.bub[0], 310],
]).total;
