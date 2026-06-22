import type { Path, Point, Seg } from "./types";
import { CIRC_CX, CIRC_CY, CIRC_R } from "./config";

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

export function arcPts(top: boolean, steps = 20): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = top ? Math.PI + Math.PI * t : Math.PI - Math.PI * t;
    pts.push([CIRC_CX + CIRC_R * Math.cos(a), CIRC_CY + CIRC_R * Math.sin(a)]);
  }
  return pts;
}
