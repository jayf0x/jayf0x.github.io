export type Point = [number, number];
export type Seg = { a: Point; b: Point; len: number; start: number };
export type Path = { segs: Seg[]; total: number };
