// Two canvas coordinates [x, y].
export type Point = [number, number];

// One straight-line segment in a path, with cumulative start distance.
export type Seg = { a: Point; b: Point; len: number; start: number };

// Polyline path: ordered segments + total arc length (used for comet travel).
export type Path = { segs: Seg[]; total: number };
