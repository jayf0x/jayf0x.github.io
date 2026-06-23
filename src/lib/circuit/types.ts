// Two canvas coordinates [x, y].
export type Point = [number, number];

// One straight-line segment in a path, with cumulative start distance.
export type Seg = { a: Point; b: Point; len: number; start: number };

// Polyline path: ordered segments + total arc length (used for comet travel).
export type Path = { segs: Seg[]; total: number };

// Semantic moments the main comet passes each cycle. Fired by the animation loop
// so the UI can sync highlights to the pulse:
//   question — comet reaches the XOR (the question is computed)
//   orbit    — comet reaches the red-button core (one full cycle counted)
//   memory   — comet reaches the SR latch (the bit is stored)
//   loop     — comet returns to CONV (memory feeds back, asks again)
export type CircuitPhase = "question" | "orbit" | "memory" | "loop";

export type CircuitEvents = {
  onPhase?: (phase: CircuitPhase) => void;
};
