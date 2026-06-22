// Circuit topology: gate positions, wire layout, comet loop path.

import type { Point } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";
import { buildPath, arcPts } from "./path";
import { xorGate, srLatch } from "./gates";

// ─── gate instances ───────────────────────────────────────────────────────────

export const XOR   = xorGate(360, 260);
export const LATCH = srLatch(590, 260, 50); // RS NOR: NOR-1→Q (top), NOR-2→Q̅ (bot)

// ─── key points ──────────────────────────────────────────────────────────────

export const SPLIT2:   Point = [CIRC_CX + CIRC_R, CIRC_CY]; // [550, 260]
export const Q_OUT:    Point = [LATCH.qOut[0],    LATCH.qOut[1]];    // [640, 235]
export const QBAR_OUT: Point = [LATCH.qBarOut[0], LATCH.qBarOut[1]]; // [640, 285]

const XOR_TOP: Point = [360, 240]; // Q arc → XOR top input
const XOR_BOT: Point = [360, 280]; // Q̅ arc → XOR bot input

// ─── static wires ─────────────────────────────────────────────────────────────
// Indices 0-3: main signal (ink). Index 4: Q̅ dim feedback (inkDim, thinner).

export const WIRES: Point[][] = [
  [[408, 260], [CIRC_CX - CIRC_R, CIRC_CY]],               // 0: beat → circle left
  [SPLIT2, [550, 225], [590, 225]],                         // 1: circle right → NOR-1 top pin
  [SPLIT2, [550, 275], [590, 275]],                         // 2: circle right → NOR-2 bot pin
  [Q_OUT,    [660, 235], [660, 110], [360, 110], XOR_TOP],  // 3: Q → outer top arc → XOR top
  [QBAR_OUT, [660, 285], [660, 410], [360, 410], XOR_BOT],  // 4: Q̅ → outer bot arc → XOR bot (dim)
];

// Splitter dots: wire junctions.
export const SPLITTER_DOTS: Point[] = [SPLIT2, Q_OUT, QBAR_OUT];

// ─── comet loop path ─────────────────────────────────────────────────────────
// XOR top → beat → circle top arc → NOR-1 → Q → outer arc → XOR top (repeat)

const latchPath: Point[] = [
  [550, 225], // NOR-1 S pin
  [590, 225], // enter NOR-1 left edge
  [590, 235], // NOR-1 center-y
  [640, 235], // exit Q output = Q_OUT
];

export const loopHi = buildPath([
  XOR_TOP,                               // start: Q arc arrives at XOR top input
  [408, 260],                            // XOR output (beat)
  [CIRC_CX - CIRC_R, CIRC_CY],          // circle left edge [430, 260]
  ...arcPts(true).slice(1),              // top arc → SPLIT2 [550, 260]
  ...latchPath,                          // through NOR-1 → Q_OUT [640, 235]
  [660, 235], [660, 110], [360, 110],    // outer top arc
  XOR_TOP,                               // back to XOR top input (closed loop)
]);

// Distance at which comet reaches Q_OUT — triggers latch flash.
export const dLATCH_TRIGGER = buildPath([
  XOR_TOP, [408, 260], [CIRC_CX - CIRC_R, CIRC_CY],
  ...arcPts(true).slice(1), ...latchPath,
]).total;
