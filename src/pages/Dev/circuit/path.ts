import type { Path, Point, Seg } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";

// Build a polyline Path from an ordered list of waypoints.
// Stores each segment with its cumulative start distance for O(n) pointAt lookups.
export function buildPath(pts: Point[]): Path {
  const segs: Seg[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  return { segs, total };
}

// Interpolate a point at distance d along path p.
// d wraps modulo total length, so callers can pass headA directly.
export function pointAt(p: Path, d: number): Point {
  const T = p.total;
  d = ((d % T) + T) % T;
  for (const s of p.segs) {
    if (d <= s.start + s.len + 1e-6) {
      const t = (d - s.start) / (s.len || 1);
      return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
    }
  }
  const L = p.segs[p.segs.length - 1];
  return [L.b[0], L.b[1]];
}

// Sample the orbit circle as a polyline of `steps` segments.
// top=true  → left half → right half (π → 2π): the path the comet takes
// top=false → right half → left half (π → 0): currently unused
export function arcPts(top: boolean, steps = 20): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = top ? Math.PI + Math.PI * t : Math.PI - Math.PI * t;
    pts.push([CIRC_CX + CIRC_R * Math.cos(a), CIRC_CY + CIRC_R * Math.sin(a)]);
  }
  return pts;
}

// Full 360° loop starting and ending at the left tangent (angle π), going
// clockwise (down first → right → up → back to left). Used for the orbit
// revolution the comet performs around the download button.
export function loopPts(steps = 40): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = Math.PI + 2 * Math.PI * t;
    pts.push([CIRC_CX + CIRC_R * Math.cos(a), CIRC_CY + CIRC_R * Math.sin(a)]);
  }
  return pts;
}
